use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct AiPickRequest {
    pub match_id: String,
    pub sport: String,
    pub market: String,
    pub bankroll: f64,
    pub risk_profile: String,
}

#[derive(Debug, Serialize, Clone)]
pub struct AiPickResponse {
    pub id: Uuid,
    pub match_id: String,
    pub sport: String,
    pub market: String,
    pub pick: String,
    pub confidence: f32,
    pub stake: f64,
    pub edge_percent: f32,
    pub created_at: DateTime<Utc>,
    pub model_version: String,
}

impl AiPickResponse {
    pub fn mock_for(req: &AiPickRequest) -> Self {
        let base_conf = match req.risk_profile.as_str() {
            "safe" => 0.78,
            "balanced" => 0.7,
            "degen" => 0.62,
            _ => 0.68,
        };

        let stake = req.bankroll * match req.risk_profile.as_str() {
            "safe" => 0.01,
            "balanced" => 0.02,
            "degen" => 0.05,
            _ => 0.015,
        };

        Self {
            id: Uuid::new_v4(),
            match_id: req.match_id.clone(),
            sport: req.sport.clone(),
            market: req.market.clone(),
            pick: "HOME".into(),
            confidence: base_conf,
            stake,
            edge_percent: 4.2,
            created_at: Utc::now(),
            model_version: "nexus-ia-pronos-2026".into(),
        }
    }
}

#[derive(Debug, Serialize, Clone)]
pub struct LiveSignal {
    pub id: Uuid,
    pub match_id: String,
    pub sport: String,
    pub pick: String,
    pub confidence: f32,
    pub edge_percent: f32,
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
            created_at: r.created_at,
        }
    }
}
