use std::net::SocketAddr;
use axum::{
    extract::{ws::WebSocketUpgrade, State},
    http::{HeaderValue, Method},
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use tokio::sync::broadcast;
use tower_http::{cors::{CorsLayer, Any}, trace::TraceLayer, compression::CompressionLayer};
use tracing::{info, debug, warn};
use std::sync::Arc;
use dotenvy::dotenv;

mod types;
mod ws;
mod odds;
mod steam;
mod inference;
mod tests;

use crate::types::{AiPickRequest, AiPickResponse, LiveSignal, AppState};
use crate::ws::handle_ws;
use crate::odds::OddsManager;
use crate::inference::MultiLeagueInference;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv().ok();
    init_tracing()?;
    
    let (tx_signals, _) = broadcast::channel::<LiveSignal>(1024);
    
    let odds_api_key = std::env::var("ODDS_API_KEY").expect("ODDS_API_KEY must be set");
    let model_dir = std::env::var("MODEL_DIR").unwrap_or_else(|_| "/home/ubuntu/nexus-prime-web-local/ml/models".to_string());
    let port = std::env::var("PORT").unwrap_or_else(|_| "8080".to_string());

    let odds_manager = Arc::new(OddsManager::new(odds_api_key));
    let inference_engine = Arc::new(MultiLeagueInference::new(model_dir));

    let state = AppState {
        tx_signals,
        dark_theme_header: HeaderValue::from_static("dark-amoled-2026"),
        odds_manager,
        inference_engine,
    };

    let app = Router::new()
        .route("/health", get(health))
        .route("/api/picks", get(api_picks_get))
        .route("/api/picks", post(api_picks_post))
        .route("/ws/live", get(ws_upgrade))
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
                .allow_headers(Any),
        )
        .layer(CompressionLayer::new())
        .layer(TraceLayer::new_for_http())
        .with_state(state);

    let addr: SocketAddr = format!("0.0.0.0:{}", port).parse()?;
    info!(%addr, "Nexus Prime Elite Production starting (Real Data Mode)...");
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;
    Ok(())
}

async fn health() -> impl IntoResponse {
    Json(serde_json::json!({
        "status": "ok",
        "service": "nexus-prime-pronos",
        "version": "0.3.0-elite-real",
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

async fn api_picks_get(
    State(state): State<AppState>,
) -> impl IntoResponse {
    debug!("API GET /api/picks called - Fetching real matches from The Odds API...");
    
    let matches = match state.odds_manager.get_odds().await {
        Ok(m) => m,
        Err(e) => {
            warn!("Failed to fetch real odds: {}", e);
            return (axum::http::StatusCode::INTERNAL_SERVER_ERROR, "API Fetch Error").into_response();
        }
    };

    let mut picks = Vec::new();
    for m in &matches {
        let match_label = format!("{} vs {}", m.home_team, m.away_team);
        let pred = state.inference_engine.predict(
            &m.league,
            &m.match_id,
            vec![m.home_odds, m.draw_odds, m.away_odds],
            m.opening_odds_pinnacle.unwrap_or(m.home_odds),
            false,
        );

        // Confidence = probability of the selected pick
        let confidence = match pred.pick.as_str() {
            "HOME" => pred.prob_home,
            "DRAW" => pred.prob_draw,
            _ => pred.prob_away,
        };

        let resp = AiPickResponse {
            id: uuid::Uuid::new_v4(),
            match_id: match_label,
            sport: "Soccer".into(),
            market: "1N2".into(),
            pick: pred.pick.clone(),
            confidence,
            stake: (1000.0 * pred.kelly) as f64,
            edge_percent: pred.edge,
            kelly: pred.kelly,
            clv: pred.clv,
            tier: if pred.edge > 5.0 && confidence > 0.60 { 1 } else if pred.edge > 2.0 { 2 } else { 3 },
            steam: pred.edge > 3.5 && pred.clv > 0.5,
            created_at: chrono::Utc::now(),
            model_version: pred.model_version,
        };
        picks.push(resp);
    }

    // Sort by edge descending, return top 30 value bets
    picks.sort_by(|a, b| b.edge_percent.partial_cmp(&a.edge_percent).unwrap_or(std::cmp::Ordering::Equal));
    picks.truncate(30);

    Json(picks).into_response()
}
async fn api_picks_post(
    State(state): State<AppState>,
    Json(payload): Json<AiPickRequest>,
) -> impl IntoResponse {
    let resp = AiPickResponse {
        id: uuid::Uuid::new_v4(),
        match_id: payload.match_id.clone(),
        sport: payload.sport.clone(),
        market: payload.market.clone(),
        pick: "HOME".into(),
        confidence: 0.85,
        stake: 50.0,
        edge_percent: 4.5,
        kelly: 0.02,
        clv: 0.05,
        tier: 1,
        steam: true,
        created_at: chrono::Utc::now(),
        model_version: "nexus-v3-elite".into(),
    };
    Json(resp)
}

async fn ws_upgrade(
    ws: WebSocketUpgrade,
    State(state): State<AppState>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_ws(socket, state))
}

fn init_tracing() -> anyhow::Result<()> {
    use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "debug,tower_http=info".into()),
        )
        .with(
            tracing_subscriber::fmt::layer()
                .with_target(false)
                .with_level(true)
        )
        .init();
    Ok(())
}
