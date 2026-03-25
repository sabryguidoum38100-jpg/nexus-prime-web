#[cfg(test)]
mod tests {
    use crate::odds::MatchOdds;
    use crate::steam::SteamDetector;
    use chrono::Utc;

    #[test]
    fn test_kelly_criterion() {
        let p: f32 = 0.55;
        let b: f32 = 2.0 - 1.0;
        let q: f32 = 1.0 - p;
        let kelly_full: f32 = ((b * p) - q) / b;
        let kelly_25: f32 = kelly_full * 0.25;
        
        assert!((kelly_25 - 0.025).abs() < 1e-6);
        
        let p_high: f32 = 0.90;
        let b_high: f32 = 2.0 - 1.0;
        let q_high: f32 = 1.0 - p_high;
        let kelly_full_high: f32 = ((b_high * p_high) - q_high) / b_high;
        let kelly_25_high: f32 = (kelly_full_high * 0.25).min(0.05);
        
        assert!(kelly_25_high <= 0.05);
    }

    #[test]
    fn test_edge_calculation() {
        let prob_modèle: f32 = 0.60;
        let cote_bookmaker: f32 = 1.80;
        let prob_implicite: f32 = 1.0 / cote_bookmaker;
        let edge: f32 = (prob_modèle - prob_implicite) * 100.0;
        
        assert!((edge - 4.44444).abs() < 1e-4);
    }

    #[test]
    fn test_steam_detection() {
        let mut detector = SteamDetector::new();
        let match_id = "TEST_MATCH".to_string();
        
        let prev = vec![MatchOdds {
            match_id: match_id.clone(),
            league: "PL".into(),
            home_team: "H".into(),
            away_team: "A".into(),
            home_odds: 2.00,
            draw_odds: 3.0,
            away_odds: 3.0,
            bookmaker: "Pinnacle".into(),
            opening_odds_pinnacle: None,
            closing_odds_pinnacle: None,
            timestamp: Utc::now().timestamp(),
        }];
        
        let current_steam = vec![MatchOdds {
            match_id: match_id.clone(),
            league: "PL".into(),
            home_team: "H".into(),
            away_team: "A".into(),
            home_odds: 1.85,
            draw_odds: 3.0,
            away_odds: 3.0,
            bookmaker: "Pinnacle".into(),
            opening_odds_pinnacle: None,
            closing_odds_pinnacle: None,
            timestamp: Utc::now().timestamp(),
        }];
        
        let moves = detector.detect_steam_moves(&current_steam, &prev);
        assert_eq!(moves.len(), 1);
        assert_eq!(moves[0].move_type, "STEAM");
    }
}
