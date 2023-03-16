FROM rust:buster as builder

ENV DATABASE_URL=postgres://doggr:doggr@postgres/doggr
# This HAS to match our backend!
ENV AUTH_SECRET=superSecret

WORKDIR /app/src
RUN USER=root cargo new --bin auth_rs
COPY Cargo.toml Cargo.lock ./auth_rs/

WORKDIR /app/src/auth_rs
RUN cargo build

COPY ./ ./
RUN cargo build

FROM debian:stable-slim
RUN apt update \
    && apt install -y openssl ca-certificates \
    && apt clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /app
ENV DATABASE_URL=postgres://doggr:doggr@postgres/doggr
ENV AUTH_SECRET=superSecret

EXPOSE 3333

COPY --from=builder /app/src/auth_rs/target/debug/auth_rs ./

CMD ["/app/auth_rs"]
