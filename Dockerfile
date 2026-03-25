FROM rust:1.80-slim as builder
WORKDIR /app
RUN apt-get update && apt-get install -y pkg-config libssl-dev build-essential curl
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y libssl3 curl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/target/release/nexus-prime-pronos .
COPY .env .
EXPOSE 8080
CMD ["./nexus-prime-pronos"]
