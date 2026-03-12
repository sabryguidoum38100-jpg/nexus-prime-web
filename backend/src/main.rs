use std::{net::SocketAddr, time::Duration};
use axum::{
    extract::{ws::WebSocketUpgrade, State},
    http::HeaderValue,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use tokio::sync::broadcast;
use tower_http::{cors::CorsLayer, trace::TraceLayer, compression::CompressionLayer};
use tracing::{info, Level};

mod metrics;
mod types;
mod ws;

use crate::metrics::{install_global_recorder, PrometheusHandle, REQUESTS_TOTAL};
use crate::types::{AiPickRequest, AiPickResponse, LiveSignal};
use crate::ws::handle_ws;

#[derive(Clone)]
struct AppState {
    tx_signals: broadcast::Sender<LiveSignal>,
    dark_theme_header: HeaderValue,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    init_tracing()?;
    let prometheus_handle = install_global_recorder()?;
    let (tx_signals, _) = broadcast::channel::<LiveSignal>(1024);
    let state = AppState {
        tx_signals,
        dark_theme_header: HeaderValue::from_static("dark-amoled-2026"),
    };

    let app = Router::new()
        .route("/health", get(health))
        .route("/api/picks", post(api_picks))
        .route("/api/ai/explain", post(api_explain))
        .route("/ws/live", get(ws_upgrade))
        .route("/metrics", get(move || prometheus_metrics(prometheus_handle.clone())))
        .layer(
            CorsLayer::very_permissive()
                .allow_credentials(true)
                .allow_headers([axum::http::header::CONTENT_TYPE]),
        )
        .layer(CompressionLayer::new())
        .layer(TraceLayer::new_for_http())
        .with_state(state);

    let addr: SocketAddr = "0.0.0.0:8080".parse()?;
    info!(%addr, "Nexus Prime Pronos listening");
    axum::serve(tokio::net::TcpListener::bind(addr).await?, app).await?;
    opentelemetry::global::shutdown_tracer_provider();
    Ok(())
}

async fn health() -> impl IntoResponse {
    Json(serde_json::json!({
        "status": "ok",
        "service": "nexus-prime-pronos",
        "version": "0.1.0"
    }))
}

async fn api_picks(
    State(state): State<AppState>,
    Json(payload): Json<AiPickRequest>,
) -> impl IntoResponse {
    REQUESTS_TOTAL.inc();
    let resp = AiPickResponse::mock_for(&payload);
    let _ = state.tx_signals.send(LiveSignal::from_response(&resp));
    ([(axum::http::header::HeaderName::from_static("x-theme"),
        state.dark_theme_header.clone())],
    Json(resp))
}

async fn api_explain(Json(payload): Json<AiPickRequest>) -> impl IntoResponse {
    REQUESTS_TOTAL.inc();
    let explanation = format!(
        "Analyse IA 2026 sur {} – modèle multi-feature (forme, xG, marché live, météo, charge mentale joueurs).",
        payload.match_id
    );
    Json(serde_json::json!({
        "match_id": payload.match_id,
        "explanation": explanation,
        "version": "2026-ai-v1"
    }))
}

async fn ws_upgrade(
    ws: WebSocketUpgrade,
    State(state): State<AppState>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_ws(socket, state))
}

async fn prometheus_metrics(handle: PrometheusHandle) -> impl IntoResponse {
    handle.render()
}

fn init_tracing() -> anyhow::Result<()> {
    use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
    let tracer = opentelemetry_otlp::new_pipeline()
        .tracing()
        .with_exporter(opentelemetry_otlp::new_exporter().tonic())
        .with_trace_config(
            opentelemetry_sdk::trace::Config::default().with_resource(
                opentelemetry_sdk::Resource::new(vec![
                    opentelemetry::KeyValue::new("service.name", "nexus-prime-pronos"),
                    opentelemetry::KeyValue::new("service.version", "0.1.0"),
                ]),
            ),
        )
        .install_batch(opentelemetry_sdk::runtime::Tokio)?;

    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info,tower_http=info".into()),
        )
        .with(tracing_opentelemetry::layer().with_tracer(tracer))
        .with(
            tracing_subscriber::fmt::layer()
                .event_format(tracing_subscriber::fmt::format().json())
                .with_target(false)
                .with_level(true)
                .with_timer(tracing_subscriber::fmt::time::UtcTime::rfc_3339()),
        )
        .init();
    Ok(())
}
