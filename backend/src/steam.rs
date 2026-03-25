use std::collections::VecDeque;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use crate::odds::MatchOdds;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OddsMove {
    pub match_id: String,
    pub bookmaker: String,
    pub old_odds: f32,
    pub new_odds: f32,
    pub move_type: String, // "STEAM", "REVERSE", "INFO"
    pub timestamp: DateTime<Utc>,
}

pub struct SteamDetector {
    history: VecDeque<OddsMove>,
    max_history: usize,
}

impl SteamDetector {
    pub fn new() -> Self {
        Self {
            history: VecDeque::new(),
            max_history: 100,
        }
    }

    pub fn detect_steam_moves(&mut self, current_odds: &Vec<MatchOdds>, previous_odds: &Vec<MatchOdds>) -> Vec<OddsMove> {
        let mut moves = Vec::new();
        for current in current_odds {
            if let Some(prev) = previous_odds.iter().find(|o| o.match_id == current.match_id && o.bookmaker == current.bookmaker) {
                let diff = (current.home_odds - prev.home_odds).abs();
                if diff > 0.10 {
                    let m = OddsMove {
                        match_id: current.match_id.clone(),
                        bookmaker: current.bookmaker.clone(),
                        old_odds: prev.home_odds,
                        new_odds: current.home_odds,
                        move_type: "STEAM".to_string(),
                        timestamp: Utc::now(),
                    };
                    moves.push(m.clone());
                    self.history.push_back(m);
                    if self.history.len() > self.max_history {
                        self.history.pop_front();
                    }
                }
            }
        }
        moves
    }

    pub fn get_recent_moves(&self, limit: usize) -> Vec<OddsMove> {
        self.history.iter().rev().take(limit).cloned().collect()
    }
}
