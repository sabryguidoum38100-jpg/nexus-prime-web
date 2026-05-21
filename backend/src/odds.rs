use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use std::time::{Duration, Instant};
use tracing::{info, debug, warn};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MatchOdds {
    pub match_id: String,
    pub league: String,
    pub home_team: String,
    pub away_team: String,
    pub home_odds: f32,
    pub draw_odds: f32,
    pub away_odds: f32,
    pub bookmaker: String,
    pub opening_odds_pinnacle: Option<f32>,
    pub closing_odds_pinnacle: Option<f32>,
    pub timestamp: i64,
}

#[derive(Debug, Deserialize)]
struct OddsApiResponse {
    id: String,
    sport_key: String,
    home_team: String,
    away_team: String,
    commence_time: String,
    bookmakers: Vec<Bookmaker>,
}

#[derive(Debug, Deserialize)]
struct Bookmaker {
    key: String,
    markets: Vec<Market>,
}

#[derive(Debug, Deserialize)]
struct Market {
    key: String,
    outcomes: Vec<Outcome>,
}

#[derive(Debug, Deserialize)]
struct Outcome {
    name: String,
    price: f32,
}

pub struct OddsCache {
    pub data: HashMap<String, MatchOdds>,
    pub last_update: Instant,
}

pub struct OddsManager {
    client: Client,
    cache: Arc<RwLock<OddsCache>>,
    odds_api_key: String,
}

impl OddsManager {
    pub fn new(odds_key: String) -> Self {
        Self {
            client: Client::new(),
            cache: Arc::new(RwLock::new(OddsCache {
                data: HashMap::new(),
                last_update: Instant::now() - Duration::from_secs(86400),
            })),
            odds_api_key: odds_key,
        }
    }

    pub async fn get_odds(&self) -> anyhow::Result<Vec<MatchOdds>> {
        let mut cache = self.cache.write().await;
        
        if cache.last_update.elapsed() < Duration::from_secs(3600) && !cache.data.is_empty() {
            debug!("Returning odds from 1h cache...");
            return Ok(cache.data.values().cloned().collect());
        }

        info!("Fetching fresh odds from The Odds API...");
        let leagues = ["soccer_france_ligue_one", "soccer_epl", "soccer_spain_la_liga", "soccer_germany_bundesliga", "soccer_italy_serie_a"];
        let mut all_odds = Vec::new();

        if self.odds_api_key.is_empty() || self.odds_api_key == "YOUR_ODDS_API_KEY" {
            warn!("Missing ODDS_API_KEY, using cache only.");
            return Ok(cache.data.values().cloned().collect());
        }

        for sport in leagues {
            match self.fetch_league_odds(sport).await {
                Ok(odds) => all_odds.extend(odds),
                Err(e) => warn!("Failed to fetch odds for {}: {}", sport, e),
            }
        }

        if all_odds.is_empty() && !cache.data.is_empty() {
            return Ok(cache.data.values().cloned().collect());
        }

        for mut o in all_odds.clone() {
            if let Some(existing) = cache.data.get(&o.match_id) {
                o.opening_odds_pinnacle = existing.opening_odds_pinnacle.or(Some(o.home_odds));
            } else {
                o.opening_odds_pinnacle = Some(o.home_odds);
            }
            cache.data.insert(o.match_id.clone(), o);
        }

        if !all_odds.is_empty() {
            cache.last_update = Instant::now();
        }

        Ok(cache.data.values().cloned().collect())
    }

    async fn fetch_league_odds(&self, sport: &str) -> anyhow::Result<Vec<MatchOdds>> {
        let url = format!(
            "https://api.the-odds-api.com/v4/sports/{}/odds/?apiKey={}&regions=eu&markets=h2h&bookmakers=pinnacle",
            sport, self.odds_api_key
        );
        
        let response = self.client.get(url).timeout(Duration::from_secs(10)).send().await?;
        if !response.status().is_success() {
            return Err(anyhow::anyhow!("API Error: {}", response.status()));
        }

        let raw_matches: Vec<OddsApiResponse> = response.json().await?;
        let mut processed = Vec::new();

        for m in raw_matches {
            if let Some(pinnacle) = m.bookmakers.iter().find(|b| b.key == "pinnacle") {
                if let Some(market) = pinnacle.markets.iter().find(|mk| mk.key == "h2h") {
                    let home = market.outcomes.iter().find(|o| o.name == m.home_team).map(|o| o.price).unwrap_or(1.0);
                    let away = market.outcomes.iter().find(|o| o.name == m.away_team).map(|o| o.price).unwrap_or(1.0);
                    let draw = market.outcomes.iter().find(|o| o.name == "Draw").map(|o| o.price).unwrap_or(1.0);

                    processed.push(MatchOdds {
                        match_id: m.id,
                        league: self.map_sport_key(&m.sport_key),
                        home_team: m.home_team,
                        away_team: m.away_team,
                        home_odds: home,
                        draw_odds: draw,
                        away_odds: away,
                        bookmaker: "Pinnacle".into(),
                        opening_odds_pinnacle: None,
                        closing_odds_pinnacle: None,
                        timestamp: chrono::Utc::now().timestamp(),
                    });
                }
            }
        }
        Ok(processed)
    }

    fn map_sport_key(&self, key: &str) -> String {
        match key {
            "soccer_france_ligue_one" => "ligue1".into(),
            "soccer_epl" => "premier_league".into(),
            "soccer_spain_la_liga" => "laliga".into(),
            "soccer_germany_bundesliga" => "bundesliga".into(),
            "soccer_italy_serie_a" => "serie_a".into(),
            _ => "unknown".into(),
        }
    }
}
