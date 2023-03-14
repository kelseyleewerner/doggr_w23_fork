use anyhow::Result as AnyResult;
use auth_rs::models::User;
use dotenvy::dotenv;
use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;
use std::env;

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
    dotenv().ok();
    tracing_subscriber::fmt::init();
    trace!("Application initialized.");
    run().await.unwrap();
    Ok(())
}

async fn run() -> AnyResult<()> {
    let conn = establish_connection().await?;
    test_conn(&conn).await?;
    let cors = CorsLayer::new().allow_origin(Any);

    let app = routes().layer(cors).layer(Extension(conn));

    let addr = SocketAddr::from(([127, 0, 0, 1], 3333));
    info!("Listening on {}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await?;

    Ok(())
}

pub async fn establish_connection() -> AnyResult<PgPool> {
    dotenv().ok();
    info!("Establishing connection");

    let db_url = env::var("DATABASE_URL")?;

    let pool = PgPoolOptions::new()
        .max_connections(10)
        .connect(&db_url)
        .await?;

    info!("Conn established");

    Ok(pool)
}

async fn test_conn(conn: &PgPool) -> AnyResult<User> {
    info!("Testing connection");
    let row: User = sqlx::query_as::<_, User>("SELECT * from users where users.email=$1")
        .bind("email@email.com")
        .fetch_one(conn)
        .await?;

    info!("User email/pw is: {} - {}", row.email, row.password);
    Ok(row)
}
