use anyhow::Result as AnyResult;

use dotenvy::dotenv;
use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;

use auth_rs::EnvOptions;
use axum::Extension;
use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer};
use tracing::log::info;
use tracing::trace;
use tracing_subscriber;

mod handlers;
mod routes;
use routes::routes;

#[tokio::main]
async fn main() -> AnyResult<()> {
    // Just like javascript!
    dotenv().ok();
    // This inits our logging
    tracing_subscriber::fmt::init();
    trace!("Application initialized.");

    // This runs our listen server
    run().await.unwrap();
    Ok(())
}

async fn run() -> AnyResult<()> {
    // Create a database connection
    let conn = establish_connection().await?;
    // Same CORS middleware we've seen in express and Fastify
    let cors = CorsLayer::new().allow_origin(Any);
    // Same as our fastify Register plugins
    let app = routes().layer(cors).layer(Extension(conn));

    // Since this is a microservice hidden behind docker, we can force it to
    // bind to ANYTHING we want safely
    let addr = SocketAddr::from(([0, 0, 0, 0], 3333));
    info!("Listening on {}", addr);
    // Same as our Node listen...
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await?;

    Ok(())
}

pub async fn establish_connection() -> AnyResult<PgPool> {
    info!("Establishing database connection...");

    let env_opts = EnvOptions::new();
    // Create a "pool" of multiple connections that will sit around waiting for work
    let pool = PgPoolOptions::new()
        .max_connections(10)
        .connect(&env_opts.database_url)
        .await?;

    info!("Database connection established!");

    Ok(pool)
}
