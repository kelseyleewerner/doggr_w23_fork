use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use jsonwebtoken::{DecodingKey, EncodingKey};
use std::fmt;
use std::fmt::Formatter;
use thiserror::Error;

use serde::{Deserialize, Serialize};

// advanced dotenv that lets us directly access .env file options programmically
pub struct EnvOptions {
    database_url: String,
    auth_secret: String,
}

impl EnvOptions {
    pub fn new() -> Self {
        EnvOptions {
            database_url: std::env::var("DATABASE_URL").expect("Missing env var DATABASE_URL"),
            auth_secret: std::env::var("AUTH_SECRET").expect("Missing env var AUTH_SECRET"),
        }
    }
}

// This is where we state what fields we're going to store in the token payload
#[derive(Serialize, Deserialize)]
pub struct Claims {
    pub email: String,
}

// We're being cheeky and handling our own JWT Tokens this time for fun
pub struct JWTKeys {
    pub encoding: EncodingKey,
    pub decoding: DecodingKey,
}

impl JWTKeys {
    pub fn new() -> Self {
        let secret = EnvOptions::new().auth_secret.into_bytes();

        Self {
            encoding: EncodingKey::from_secret(&secret),
            decoding: DecodingKey::from_secret(&secret),
        }
    }
}

// Our database model, just like Typescript
pub mod models {
    use serde::{Deserialize, Serialize};

    #[derive(sqlx::FromRow, Serialize, Deserialize)]
    pub struct User {
        pub email: String,
        pub password: String,
    }

    #[derive(Serialize, Deserialize)]
    pub struct LoggedInUser {
        pub token: String,
    }
}

// Make our own error that wraps `anyhow::Error`.
pub struct AppError(anyhow::Error);

// Tell axum how to convert `AppError` into a response.
impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Something went wrong: {}", self.0),
        )
            .into_response()
    }
}

// This enables using `?` on functions that return `Result<_, anyhow::Error>` to turn them into
// `Result<_, AppError>`. That way you don't need to do that manually.
impl<E> From<E> for AppError
where
    E: Into<anyhow::Error>,
{
    fn from(err: E) -> Self {
        Self(err.into())
    }
}
