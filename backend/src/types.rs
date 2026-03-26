use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use tokio::sync::broadcast;
use axum::http::HeaderValue;
use std::sync::Arc;
use crate::odds::OddsManager;
use crate::inference::MultiLeagueInference;

#[derive(Clone)]
pub struct AppState {
    pub tx_signals: broadcast::Sender<LiveSignal>,
    pub dark_theme_header: HeaderValue,
    pub odds_manager: Arc<OddsManager>,
    pub inference_engine: Arc<MultiLeagueInference>,
}

#[derive(Debug, Deserialize)]
pub struct AiPickRequest {
    pub match_id: String,
    pub sport: String,
    pub market: String,
    pub bankroll: f64,
    pub risk_profile: String,
    // Optional odds for single-match inference via POST
    pub home_odds: Option<f32>,
    pub draw_odds: Option<f32>,
    pub away_odds: Option<f32>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AiPickResponse {
    pub id: Uuid,
    pub match_id: String,
    pub sport: String,
    pub market: String,
    pub pick: String,
    pub confidence: f32,
    pub stake: f64,
    pub edge_percent: f32,
    pub kelly: f32,
    pub clv: f32,
    pub tier: u8,
    pub steam: bool,
    pub created_at: DateTime<Utc>,
    pub model_version: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LiveSignal {
    pub id: Uuid,
    pub match_id: String,
    pub sport: String,
    pub pick: String,
    pub confidence: f32,
    pub edge_percent: f32,
    pub tier: u8,
    pub steam: bool,
    pub created_at: DateTime<Utc>,
}

impl LiveSignal {
    pub fn from_response(r: &AiPickResponse) -> Self {
        Self {
            id: r.id,
            match_id: r.match_id.clone(),
            sport: r.sport.clone(),
            pick: r.pick.clone(),
            confidence: r.confidence,
            edge_percent: r.edge_percent,
            tier: r.tier,
            steam: r.steam,
            created_at: r.created_at,
        }
    }
}
