FROM rust:1.83-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y pkg-config libssl-dev build-essential curl

# Copier tout le projet
COPY . .

# Compiler le backend depuis son dossier spécifique
WORKDIR /app/backend
RUN cargo build --release

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copier le binaire compilé depuis le builder
COPY --from=builder /app/backend/target/release/nexus-prime-pronos /app/nexus-prime-backend

# Copier les modèles ONNX nécessaires pour l'inférence
COPY --from=builder /app/ml/models /app/ml/models

EXPOSE 8080

CMD ["./nexus-prime-backend"]

