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

    /// Calibration Platt Scaling : blende prob modèle + prob marché (α=0.15)
    /// Empêche les dérives irréalistes (edge 30%+)
    fn calibrate(prob_model: f32, prob_market: f32) -> f32 {
        const ALPHA: f32 = 0.15;
        let blended = (1.0 - ALPHA) * prob_market + ALPHA * prob_model;
        blended.clamp(0.01, 0.99)
    }

    /// Edge institutionnel : Edge = (prob_IA × cote) - 1, clampé [0%, 10%]
    fn compute_edge(prob: f32, odds: f32) -> f32 {
        let raw_edge = (prob * odds) - 1.0;
        (raw_edge * 100.0).clamp(0.0, 10.0)
    }

    /// Quarter-Kelly : Mise = Edge / (cote - 1) × 0.25, cap 5%
    fn compute_quarter_kelly(edge_pct: f32, odds: f32) -> f32 {
        let b = odds - 1.0;
        if b <= 0.0 || edge_pct <= 0.0 { return 0.0; }
        (edge_pct / 100.0 / b * 0.25).clamp(0.0, 0.05)
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

        // Pénalité lineup
        if lineup_missing {
            prob_home_model = (prob_home_model - 0.04).max(0.01);
        }

        // === CALIBRATION PLATT SCALING ===
        let prob_home_cal = Self::calibrate(prob_home_model, prob_home_market);
        let prob_draw_cal = Self::calibrate(prob_draw_model, prob_draw_market);
        let prob_away_cal = Self::calibrate(prob_away_model, prob_away_market);

        // Renormalisation
        let total_cal = prob_home_cal + prob_draw_cal + prob_away_cal;
        prob_home_model = prob_home_cal / total_cal;
        prob_draw_model = prob_draw_cal / total_cal;
        prob_away_model = prob_away_cal / total_cal;

        // === EDGE INSTITUTIONNEL : Edge = (prob_IA × cote) - 1 ===
        let edge_home = Self::compute_edge(prob_home_model, home_odds);
        let edge_draw = Self::compute_edge(prob_draw_model, draw_odds);
        let edge_away = Self::compute_edge(prob_away_model, away_odds);

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

        // === QUARTER-KELLY : Mise = Edge / (cote - 1) × 0.25 ===
        let kelly = Self::compute_quarter_kelly(edge, pick_odds);
        let _ = prob; // prob utilisé pour sélection pick

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
            model_version: format!("{}-onnx-v6-calibrated", session_key),
        }
    }
}
