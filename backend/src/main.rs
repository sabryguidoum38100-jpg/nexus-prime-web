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
use tokio_rusqlite::Connection;

mod types;
mod ws;
mod odds;
mod steam;
mod inference;
mod db;
mod tests;

use crate::types::{AiPickRequest, AiPickResponse, LiveSignal, AppState};
use crate::ws::handle_ws;
use crate::odds::OddsManager;
use crate::inference::MultiLeagueInference;
use crate::db::{init_db, find_similar_picks, generate_groq_analysis, save_pick, get_pick_analysis, PickHistoryRow};

// Formes récentes simulées par équipe (en attendant API-Football)
fn get_team_form(team: &str) -> String {
    // Hash simple pour avoir une forme cohérente par équipe
    let chars = ['V', 'N', 'D'];
    let seed: usize = team.bytes().map(|b| b as usize).sum::<usize>();
    (0..5).map(|i| chars[(seed + i * 7) % 3]).collect()
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv().ok();
    init_tracing()?;

    let (tx_signals, _) = broadcast::channel::<LiveSignal>(1024);

    let odds_api_key = std::env::var("ODDS_API_KEY").expect("ODDS_API_KEY must be set");
    let groq_api_key = std::env::var("GROQ_API_KEY").unwrap_or_default();
    let model_dir = std::env::var("MODEL_DIR").unwrap_or_else(|_| "/app/ml/models".to_string());
    let db_path = std::env::var("DB_PATH").unwrap_or_else(|_| "/app/data/nexus.db".to_string());
    let port = std::env::var("PORT").unwrap_or_else(|_| "10000".to_string());

    // Initialiser SQLite (fallback en mémoire si le chemin n'est pas accessible)
    let conn = if let Ok(c) = Connection::open(&db_path).await {
        c
    } else {
        Connection::open_in_memory().await.expect("in-memory DB failed")
    };
    init_db(&conn).await?;
    let db = Arc::new(conn);

    let http_client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()?;

    let odds_manager = Arc::new(OddsManager::new(odds_api_key));
    let inference_engine = Arc::new(MultiLeagueInference::new(model_dir));

    let state = AppState {
        tx_signals,
        dark_theme_header: HeaderValue::from_static("dark-amoled-2026"),
        odds_manager,
        inference_engine,
        db,
        http_client,
        groq_api_key,
    };

    // Configuration CORS
    let cors = CorsLayer::new()
        .allow_origin([
            "https://nexus-prime-web.vercel.app".parse::<HeaderValue>().unwrap(),
            "https://nexus-prime-web-sabryguidoum38100-jpgs-projects.vercel.app".parse::<HeaderValue>().unwrap(),
            "http://localhost:3000".parse::<HeaderValue>().unwrap(),
        ])
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers(Any);

    let app = Router::new()
        .route("/health", get(health))
        .route("/api/picks", get(api_picks_get))
        .route("/api/picks", post(api_picks_post))
        .route("/ws/live", get(ws_upgrade))
        .layer(cors)
        .layer(CompressionLayer::new())
        .layer(TraceLayer::new_for_http())
        .with_state(state);

    let addr: SocketAddr = format!("0.0.0.0:{}", port).parse()?;
    info!(%addr, "Nexus Prime Elite v0.5.0-RAG starting...");
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;
    Ok(())
}

// Health check
async fn health() -> impl IntoResponse {
    Json(serde_json::json!({
        "status": "ok",
        "service": "nexus-prime-pronos",
        "version": "0.5.0-rag-groq-llama4",
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

// GET /api/picks — Récupère les picks avec analyse RAG
async fn api_picks_get(
    State(state): State<AppState>,
) -> impl IntoResponse {
    debug!("API GET /api/picks called - RAG mode");

    let matches = match state.odds_manager.get_odds().await {
        Ok(m) => m,
        Err(e) => {
            warn!("Failed to fetch real odds: {}", e);
            return (axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({"error": "Odds API unavailable", "detail": e.to_string()}))).into_response();
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
        ).await;

        let confidence = match pred.pick.as_str() {
            "HOME" => pred.prob_home,
            "DRAW" => pred.prob_draw,
            _ => pred.prob_away,
        };

        if confidence < 0.45 || pred.edge <= 1.5 {
            continue;
        }

        let pick_id = format!("{}-{}", m.match_id, pred.pick.to_lowercase());
        let tier = if pred.edge >= 6.0 && confidence > 0.60 { 1u8 } else if pred.edge >= 3.0 { 2u8 } else { 3u8 };
        let steam = pred.edge >= 2.0 && pred.clv > 0.3;
        let home_form = get_team_form(&m.home_team);
        let away_form = get_team_form(&m.away_team);

        // Vérifier si l'analyse existe déjà en cache
        let analysis = match get_pick_analysis(&state.db, &pick_id).await {
            Some(cached) => {
                debug!("Using cached analysis for {}", pick_id);
                cached
            }
            None => {
                // Générer l'analyse RAG (une seule fois)
                let similar = find_similar_picks(
                    &state.db,
                    pred.edge as f64,
                    m.home_odds as f64,
                ).await.unwrap_or_default();

                let analysis = generate_groq_analysis(
                    &state.http_client,
                    &state.groq_api_key,
                    &m.home_team,
                    &m.away_team,
                    &m.league,
                    &pred.pick,
                    m.home_odds as f64,
                    pred.edge as f64,
                    confidence as f64,
                    pred.clv as f64,
                    steam,
                    &home_form,
                    &away_form,
                    &similar,
                ).await;

                // Sauvegarder en cache
                let row = PickHistoryRow {
                    id: pick_id.clone(),
                    home: m.home_team.clone(),
                    away: m.away_team.clone(),
                    competition: Some(m.league.clone()),
                    selection: pred.pick.clone(),
                    odds: m.home_odds as f64,
                    edge: pred.edge as f64,
                    probability: confidence as f64,
                    clv: pred.clv as f64,
                    steam,
                    home_form: Some(home_form.clone()),
                    away_form: Some(away_form.clone()),
                    ai_analysis: Some(analysis.clone()),
                    result: None,
                    roi: None,
                    created_at: chrono::Utc::now().to_rfc3339(),
                };
                if let Err(e) = save_pick(&state.db, &row).await {
                    warn!("Failed to save pick to DB: {}", e);
                }

                analysis
            }
        };

        let pick_odds = match pred.pick.as_str() {
            "HOME" => m.home_odds,
            "DRAW" => m.draw_odds,
            _ => m.away_odds,
        };

        let resp = AiPickResponse {
            id: uuid::Uuid::new_v4(),
            match_id: match_label.clone(),
            home_team: m.home_team.clone(),
            away_team: m.away_team.clone(),
            competition: m.league.clone(),
            sport: "Soccer".into(),
            market: "1N2".into(),
            pick: pred.pick.clone(),
            confidence,
            stake: (1000.0 * pred.kelly) as f64,
            edge_percent: pred.edge,
            kelly: pred.kelly,
            clv: pred.clv,
            tier,
            steam,
            home_form,
            away_form,
            analysis,
            created_at: chrono::Utc::now(),
            model_version: pred.model_version,
        };

        // Broadcast signal live
        let signal = LiveSignal::from_response(&resp);
        let _ = state.tx_signals.send(signal);

        picks.push(resp);
    }

    picks.sort_by(|a, b| b.edge_percent.partial_cmp(&a.edge_percent).unwrap_or(std::cmp::Ordering::Equal));
    picks.truncate(25);

    info!("Returning {} picks with RAG analysis", picks.len());
    Json(picks).into_response()
}

// POST /api/picks — Inférence sur un match custom
async fn api_picks_post(
    State(state): State<AppState>,
    Json(payload): Json<AiPickRequest>,
) -> impl IntoResponse {
    let pred = state.inference_engine.predict(
        "custom",
        &payload.match_id,
        vec![
            payload.home_odds.unwrap_or(2.0),
            payload.draw_odds.unwrap_or(3.4),
            payload.away_odds.unwrap_or(3.5),
        ],
        0.0,
        false,
    ).await;

    let confidence = match pred.pick.as_str() {
        "HOME" => pred.prob_home,
        "DRAW" => pred.prob_draw,
        _ => pred.prob_away,
    };

    let home_form = get_team_form("Home");
    let away_form = get_team_form("Away");

    let similar = find_similar_picks(&state.db, pred.edge as f64, payload.home_odds.unwrap_or(2.0) as f64)
        .await.unwrap_or_default();

    let analysis = generate_groq_analysis(
        &state.http_client,
        &state.groq_api_key,
        "Équipe A", "Équipe B", "custom",
        &pred.pick,
        payload.home_odds.unwrap_or(2.0) as f64,
        pred.edge as f64,
        confidence as f64,
        pred.clv as f64,
        false,
        &home_form,
        &away_form,
        &similar,
    ).await;

    let resp = AiPickResponse {
        id: uuid::Uuid::new_v4(),
        match_id: payload.match_id.clone(),
        home_team: "Équipe A".into(),
        away_team: "Équipe B".into(),
        competition: "custom".into(),
        sport: payload.sport.clone(),
        market: payload.market.clone(),
        pick: pred.pick.clone(),
        confidence,
        stake: (1000.0 * pred.kelly) as f64,
        edge_percent: pred.edge,
        kelly: pred.kelly,
        clv: pred.clv,
        tier: if pred.edge >= 6.0 && confidence > 0.60 { 1 } else if pred.edge >= 3.0 { 2 } else { 3 },
        steam: pred.edge >= 2.0 && pred.clv > 0.3,
        home_form,
        away_form,
        analysis,
        created_at: chrono::Utc::now(),
        model_version: pred.model_version,
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
