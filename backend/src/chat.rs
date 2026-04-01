// chat.rs — Assistant conversationnel Nexus Prime
// Endpoint POST /api/chat avec SSE streaming Groq + rate limiting double niveau

use axum::{
    extract::{ConnectInfo, State},
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Response, Sse},
    Json,
};
use axum::response::sse::{Event, KeepAlive};
use futures_util::stream::{self, StreamExt};
use governor::{Quota, RateLimiter};
use governor::state::keyed::DefaultKeyedStateStore;
use governor::clock::DefaultClock;
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};
use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::net::SocketAddr;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tokio_stream::wrappers::ReceiverStream;
use tracing::{info, warn, debug};

use crate::types::AppState;

// ─── Structures ─────────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct ChatRequest {
    pub message: String,
    pub context: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct ChatError {
    pub error: String,
    pub code: u16,
}

// ─── JWT Claims ──────────────────────────────────────────────────────────────

#[derive(Debug, Deserialize, Clone)]
struct JwtClaims {
    pub id: Option<String>,
    pub email: Option<String>,
    pub plan: Option<String>,
}

// ─── Rate Limiters ───────────────────────────────────────────────────────────

// Rate limiter par IP : 20 requêtes/heure (global, partagé)
static IP_RATE_LIMITER: Lazy<Arc<RateLimiter<String, DefaultKeyedStateStore<String>, DefaultClock>>> = Lazy::new(|| {
    Arc::new(RateLimiter::keyed(
        Quota::per_hour(std::num::NonZeroU32::new(20).unwrap())
    ))
});

// Compteur journalier par user_id (free : 10/jour)
static DAILY_COUNTER: Lazy<Arc<Mutex<HashMap<String, (u32, Instant)>>>> = Lazy::new(|| {
    Arc::new(Mutex::new(HashMap::new()))
});

fn check_daily_limit(user_id: &str, limit: u32) -> bool {
    let mut map = DAILY_COUNTER.lock().unwrap();
    let now = Instant::now();
    let entry = map.entry(user_id.to_string()).or_insert((0, now));
    // Reset si plus de 24h
    if now.duration_since(entry.1) > Duration::from_secs(86400) {
        *entry = (0, now);
    }
    if entry.0 >= limit {
        return false; // limite atteinte
    }
    entry.0 += 1;
    true
}

// ─── System Prompt ───────────────────────────────────────────────────────────

const SYSTEM_PROMPT: &str = "Tu es l'assistant expert de Nexus Prime. \
Tu analyses les cotes, expliques l'Edge calculé par notre modèle ONNX et conseilles sur la gestion de bankroll Kelly. \
Ton ton est pro, direct et analytique. \
Tu réponds en français, de façon concise et structurée. \
Tu ne donnes jamais de conseils financiers généraux — tu restes dans le domaine des paris sportifs et de la gestion de bankroll mathématique. \
Quand tu cites des chiffres, tu es précis. Tu utilises des termes techniques quand c'est pertinent (Edge, CLV, Kelly, Platt Scaling, EV+).";

// ─── Handler principal ───────────────────────────────────────────────────────

pub async fn chat_handler(
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(payload): Json<ChatRequest>,
) -> Response {
    let ip = addr.ip().to_string();

    // ── 1. Rate limit par IP ─────────────────────────────────────────────────
    if IP_RATE_LIMITER.check_key(&ip).is_err() {
        warn!("Rate limit IP dépassé pour {}", ip);
        return (
            StatusCode::TOO_MANY_REQUESTS,
            Json(ChatError {
                error: "Limite atteinte. Passez Premium pour un accès illimité.".to_string(),
                code: 429,
            }),
        ).into_response();
    }

    // ── 2. Vérification JWT (optionnel) ──────────────────────────────────────
    let user_plan = extract_user_plan(&headers);
    let user_id = extract_user_id(&headers);

    // ── 3. Rate limit par user (free : 10/jour) ──────────────────────────────
    if let Some(ref uid) = user_id {
        let limit = if user_plan.as_deref() == Some("premium") { u32::MAX } else { 10 };
        if limit != u32::MAX && !check_daily_limit(uid, limit) {
            warn!("Daily limit atteint pour user {}", uid);
            return (
                StatusCode::TOO_MANY_REQUESTS,
                Json(ChatError {
                    error: "Limite atteinte. Passez Premium pour un accès illimité.".to_string(),
                    code: 429,
                }),
            ).into_response();
        }
    }

    // ── 4. Validation du message ─────────────────────────────────────────────
    let message = payload.message.trim().to_string();
    if message.is_empty() || message.len() > 2000 {
        return (
            StatusCode::BAD_REQUEST,
            Json(ChatError {
                error: "Message invalide (1-2000 caractères requis).".to_string(),
                code: 400,
            }),
        ).into_response();
    }

    info!("Chat request from {} (plan: {:?}): {} chars", ip, user_plan, message.len());

    // ── 5. Appel Groq en streaming ───────────────────────────────────────────
    let groq_key = state.groq_api_key.clone();
    let http_client = state.http_client.clone();
    let context = payload.context.unwrap_or_default();

    // Construire les messages
    let mut messages = vec![
        serde_json::json!({ "role": "system", "content": SYSTEM_PROMPT }),
    ];

    if !context.is_empty() {
        messages.push(serde_json::json!({
            "role": "system",
            "content": format!("Contexte du pick actuel : {}", context)
        }));
    }

    messages.push(serde_json::json!({ "role": "user", "content": message }));

    let groq_body = serde_json::json!({
        "model": "meta-llama/llama-4-scout-17b-16e-instruct",
        "messages": messages,
        "stream": true,
        "max_tokens": 512,
        "temperature": 0.7
    });

    // Canal tokio pour passer les chunks SSE
    let (tx, rx) = tokio::sync::mpsc::channel::<String>(64);

    // Spawn la tâche de streaming Groq
    tokio::spawn(async move {
        if groq_key.is_empty() {
            // Mode fallback sans clé Groq
            let fallback = "Je suis l'assistant Nexus Prime. La clé Groq n'est pas configurée sur ce serveur. Configurez GROQ_API_KEY sur Render pour activer l'IA conversationnelle complète.";
            for chunk in fallback.split_whitespace() {
                let _ = tx.send(format!("{} ", chunk)).await;
                tokio::time::sleep(Duration::from_millis(50)).await;
            }
            return;
        }

        let resp = http_client
            .post("https://api.groq.com/openai/v1/chat/completions")
            .header("Authorization", format!("Bearer {}", groq_key))
            .header("Content-Type", "application/json")
            .json(&groq_body)
            .send()
            .await;

        match resp {
            Err(e) => {
                warn!("Groq request failed: {}", e);
                let _ = tx.send("[Erreur de connexion à l'IA. Veuillez réessayer.]".to_string()).await;
            }
            Ok(response) => {
                if !response.status().is_success() {
                    let status = response.status();
                    let body = response.text().await.unwrap_or_default();
                    warn!("Groq error {}: {}", status, body);
                    let _ = tx.send(format!("[Erreur Groq {}. Veuillez réessayer.]", status)).await;
                    return;
                }

                // Lire le stream SSE de Groq
                let mut stream = response.bytes_stream();
                let mut buffer = String::new();

                while let Some(chunk) = stream.next().await {
                    match chunk {
                        Err(e) => {
                            warn!("Stream error: {}", e);
                            break;
                        }
                        Ok(bytes) => {
                            buffer.push_str(&String::from_utf8_lossy(&bytes));
                            // Parser les lignes SSE
                            while let Some(pos) = buffer.find('\n') {
                                let line = buffer[..pos].trim().to_string();
                                buffer = buffer[pos + 1..].to_string();

                                if line.starts_with("data: ") {
                                    let data = &line[6..];
                                    if data == "[DONE]" {
                                        debug!("Groq stream complete");
                                        return;
                                    }
                                    if let Ok(json) = serde_json::from_str::<serde_json::Value>(data) {
                                        if let Some(content) = json
                                            .get("choices")
                                            .and_then(|c| c.get(0))
                                            .and_then(|c| c.get("delta"))
                                            .and_then(|d| d.get("content"))
                                            .and_then(|c| c.as_str())
                                        {
                                            if !content.is_empty() {
                                                let _ = tx.send(content.to_string()).await;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    // ── 6. Construire la réponse SSE ─────────────────────────────────────────
    let stream = ReceiverStream::new(rx).map(|chunk| {
        // Encoder le chunk en JSON pour le SSE
        let data = serde_json::json!({ "token": chunk });
        Ok::<Event, std::convert::Infallible>(
            Event::default().data(data.to_string())
        )
    });

    // Ajouter un événement de fin
    let done_event = stream::once(async {
        Ok::<Event, std::convert::Infallible>(
            Event::default().event("done").data("{\"done\":true}")
        )
    });

    let full_stream = stream.chain(done_event);

    Sse::new(full_stream)
        .keep_alive(KeepAlive::default())
        .into_response()
}

// ─── Helpers JWT ─────────────────────────────────────────────────────────────

fn extract_user_plan(headers: &HeaderMap) -> Option<String> {
    let token = get_bearer_token(headers)?;
    let claims = decode_jwt(&token)?;
    claims.plan
}

fn extract_user_id(headers: &HeaderMap) -> Option<String> {
    let token = get_bearer_token(headers)?;
    let claims = decode_jwt(&token)?;
    claims.id
}

fn get_bearer_token(headers: &HeaderMap) -> Option<String> {
    let auth = headers.get("Authorization")?.to_str().ok()?;
    if auth.starts_with("Bearer ") {
        Some(auth[7..].to_string())
    } else {
        None
    }
}

fn decode_jwt(token: &str) -> Option<JwtClaims> {
    let secret = std::env::var("JWT_SECRET")
        .unwrap_or_else(|_| "nexus-prime-elite-2026-super-secret-key-do-not-share".to_string());
    let key = DecodingKey::from_secret(secret.as_bytes());
    let mut validation = Validation::new(Algorithm::HS256);
    validation.validate_exp = false; // On vérifie juste le plan, pas l'expiration
    decode::<JwtClaims>(token, &key, &validation)
        .ok()
        .map(|d| d.claims)
}
