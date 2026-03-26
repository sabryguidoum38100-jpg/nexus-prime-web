use serde::{Deserialize, Serialize};
use tracing::{debug, info, warn};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tokio::sync::RwLock;
use ort::{session::builder::GraphOptimizationLevel, session::Session, value::Tensor};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Prediction {
    pub prob_home: f32,
    pub prob_draw: f32,
    pub prob_away: f32,
    pub pick: String,
    pub pick_odds: f32,
    pub edge: f32,
    pub kelly: f32,
    pub clv: f32,
    pub overround: f32,
    pub lineup_status: String,
    pub model_version: String,
}

pub struct MultiLeagueInference {
    sessions: Arc<RwLock<HashMap<String, Arc<Mutex<Session>>>>>,
}

impl MultiLeagueInference {
    pub fn new(models_dir: String) -> Self {
        let sessions = Arc::new(RwLock::new(HashMap::new()));
        let sessions_clone = sessions.clone();
        
        tokio::spawn(async move {
            info!("Async loading ONNX models from: {}", models_dir);
            let leagues = vec!["bundesliga", "premier_league", "ligue1", "serie_a", "laliga"];
            let mut loaded = HashMap::new();
            
            for league in leagues {
                let model_path = format!("{}/{}.onnx", models_dir, league);
                let path_clone = model_path.clone();
                let league_clone = league.to_string();
                
                let res = tokio::task::spawn_blocking(move || {
                    Session::builder()
                        .unwrap()
                        .with_optimization_level(GraphOptimizationLevel::Level3)
                        .unwrap()
                        .with_intra_threads(1)
                        .unwrap()
                        .commit_from_file(&path_clone)
                }).await;
                
                match res {
                    Ok(Ok(session)) => {
                        info!("Successfully loaded model for {}", league_clone);
                        loaded.insert(league_clone, Arc::new(Mutex::new(session)));
                    },
                    Ok(Err(e)) => {
                        warn!("Failed to load model for {}: {}. Will fallback to market probs.", league_clone, e);
                    },
                    Err(e) => {
                        warn!("Task spawn failed for {}: {}", league_clone, e);
                    }
                }
            }
            
            let mut write_guard = sessions_clone.write().await;
            *write_guard = loaded;
            info!("All available ONNX models loaded asynchronously.");
        });
        
        Self { sessions }
    }

    pub async fn predict(
        &self,
        league: &str,
        match_id: &str,
        features: Vec<f32>,
        opening_odds: f32,
        lineup_missing: bool,
    ) -> Prediction {
        debug!("Inference for league={} match_id={}", league, match_id);

        let home_odds = features[0];
        let draw_odds = features[1];
        let away_odds = features[2];

        let total_implied = (1.0 / home_odds) + (1.0 / draw_odds) + (1.0 / away_odds);
        let overround = total_implied - 1.0;

        let prob_home_market = (1.0 / home_odds) / total_implied;
        let prob_draw_market = (1.0 / draw_odds) / total_implied;
        let prob_away_market = (1.0 / away_odds) / total_implied;

        let mut prob_home_model = prob_home_market;
        let mut prob_draw_model = prob_draw_market;
        let mut prob_away_model = prob_away_market;
        let mut used_model = false;

        let normalized_league = league.to_lowercase().replace(' ', "_");
        let sessions_guard = self.sessions.read().await;
        
        let session_key = if sessions_guard.contains_key(&normalized_league) {
            normalized_league.clone()
        } else {
            "premier_league".to_string()
        };

        if let Some(session_mutex) = sessions_guard.get(&session_key) {
            if let Ok(input_tensor) = Tensor::from_array(([1usize, 3], vec![home_odds, draw_odds, away_odds])) {
                if let Ok(mut session) = session_mutex.lock() {
                    if let Ok(outputs) = session.run(ort::inputs!["float_input" => input_tensor]) {
                        if let Ok(probs_array) = outputs[1].try_extract_array::<f32>() {
                            let probs_slice = probs_array.as_slice().unwrap_or(&[]);
                            if probs_slice.len() >= 3 {
                                prob_home_model = probs_slice[0];
                                prob_draw_model = probs_slice[1];
                                prob_away_model = probs_slice[2];
                                used_model = true;
                            }
                        }
                    }
                }
            }
        }

        if !used_model {
            warn!("ONNX inference failed for {} (match {}), falling back to market probabilities", league, match_id);
        }

        let lineup_penalty = if lineup_missing { -0.04 } else { 0.0 };
        prob_home_model = (prob_home_model + lineup_penalty).max(0.01);
        
        let total_prob = prob_home_model + prob_draw_model + prob_away_model;
        prob_home_model /= total_prob;
        prob_draw_model /= total_prob;
        prob_away_model /= total_prob;

        let edge_home = (prob_home_model - prob_home_market) * 100.0;
        let edge_draw = (prob_draw_model - prob_draw_market) * 100.0;
        let edge_away = (prob_away_model - prob_away_market) * 100.0;

        let (pick, edge, prob, pick_odds) = if edge_home >= edge_draw && edge_home >= edge_away {
            ("HOME", edge_home, prob_home_model, home_odds)
        } else if edge_draw >= edge_home && edge_draw >= edge_away {
            ("DRAW", edge_draw, prob_draw_model, draw_odds)
        } else {
            ("AWAY", edge_away, prob_away_model, away_odds)
        };

        let clv = if opening_odds > 0.0 && (opening_odds - pick_odds).abs() > 0.001 {
            ((1.0 / opening_odds) - (1.0 / pick_odds)) * 100.0
        } else {
            0.0
        };

        let b = pick_odds - 1.0;
        let p = prob;
        let q = 1.0 - p;
        let kelly_full = if b > 0.0 { ((b * p) - q) / b } else { 0.0 };
        let kelly = (kelly_full * 0.25).max(0.0).min(0.05);

        let lineup_status = if lineup_missing {
            "KEY_PLAYERS_ABSENT".to_string()
        } else {
            "CONFIRMED".to_string()
        };

        Prediction {
            prob_home: prob_home_model,
            prob_draw: prob_draw_model,
            prob_away: prob_away_model,
            pick: pick.to_string(),
            pick_odds,
            edge,
            kelly,
            clv,
            overround: overround * 100.0,
            lineup_status,
            model_version: format!("{}-onnx-v5", session_key),
        }
    }
}
