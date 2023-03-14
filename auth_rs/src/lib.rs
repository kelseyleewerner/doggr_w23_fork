use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use jsonwebtoken::{DecodingKey, EncodingKey};
use serde::{Deserialize, Serialize};

// advanced dotenv that lets us directly access .env file options programmically
pub struct EnvOptions {
    pub database_url: String,
    pub auth_secret: String,
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
    // This will be how we encode the token
    pub encoding: EncodingKey,
    // This is how we'd decrypt, but we actually don't validate them here ever, so this will go unused
    pub decoding: DecodingKey,
}

impl JWTKeys {
    pub fn new() -> Self {
        // Just like our auth.ts secret...MUST be the same!
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
    // This will hold our actual user info corresponding to the database info
    pub struct User {
        pub email: String,
        pub password: String,
    }

    // This is our type which we return, having filled it with a token produced from JWTKeys
    #[derive(Serialize, Deserialize)]
    pub struct LoggedInUser {
        pub token: String,
    }
}

// IGNORE ALL BELOW THIS, I REPEAT IGNORE ME ABANDON HOPE ALL YE WHO ENTER HERE
// THIS IS THE ONLY PLACE IN THE MICROSERVICE WHERE RUST'S COMPLEXITY ISN'T HIDDEN
// LAST WARNING GO BACK NOW
// Error type wrapper for convenience
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
