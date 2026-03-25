use axum::extract::ws::{Message, WebSocket};
use futures_util::{SinkExt, StreamExt};
use tracing::{info, warn};
use crate::types::AppState;

pub async fn handle_ws(mut socket: WebSocket, state: AppState) {
    let mut rx = state.tx_signals.subscribe();

    let hello = serde_json::json!({
        "type": "hello",
        "theme": "dark-amoled-2026",
        "service": "nexus-prime-pronos-live",
        "message": "Connected to live ELITE signals."
    }).to_string();

    if socket.send(Message::Text(hello.into())).await.is_err() {
        return;
    }

    let (mut sender, mut receiver) = socket.split();

    let mut send_task = tokio::spawn(async move {
        while let Ok(sig) = rx.recv().await {
            if sig.tier <= 2 {
                let msg = serde_json::json!({
                    "type": "signal",
                    "payload": sig
                }).to_string();

                if sender.send(Message::Text(msg.into())).await.is_err() {
                    break;
                }
            }
        }
    });

    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(msg)) = receiver.next().await {
            match msg {
                Message::Text(txt) => {
                    info!(%txt, "Client WS message");
                }
                Message::Close(_) => break,
                _ => {}
            }
        }
    });

    tokio::select! {
        _ = &mut send_task => recv_task.abort(),
        _ = &mut recv_task => send_task.abort(),
    }

    warn!("WebSocket client disconnected");
}
