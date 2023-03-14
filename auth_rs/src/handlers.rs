use anyhow::{anyhow, Result as AnyResult};
use auth_rs::models::{LoggedInUser, User};
use auth_rs::{AppError, Claims, JWTKeys};
use axum::http::StatusCode;
use axum::{Extension, Json};
use jsonwebtoken::{encode, Header};
use serde_derive::{Deserialize, Serialize};
use serde_json::json;
use sqlx::PgPool;
use tracing::log::warn;

#[axum_macros::debug_handler]
pub async fn create_user(Json(credentials): Json<User>) -> (StatusCode, Json<LoggedInUser>) {
    let token = todo!();

    let user = LoggedInUser { token };

    // If we successfully created a user, we can
    // go ahead and "log them in" by generating a token now
    (StatusCode::CREATED, Json(user))
}

#[axum_macros::debug_handler]
pub async fn login(
    Extension(conn): Extension<PgPool>,
    Json(credentials): Json<User>,
) -> Result<(StatusCode, Json<LoggedInUser>), AppError> {
    let res = try_login(&conn, &credentials).await?;
    Ok(res)
}

async fn try_login(
    conn: &PgPool,
    credentials: &User,
) -> Result<(StatusCode, Json<LoggedInUser>), anyhow::Error> {
    if credentials.email.is_empty() {
        anyhow::bail!("Invalid email!")
    }

    if credentials.password.is_empty() {
        anyhow::bail!("Invalid password!")
    }

    let user = sqlx::query_as::<_, User>("SELECT email, password from users where users.email=$1")
        .bind(&credentials.email)
        .fetch_optional(conn)
        .await?;

    // if the user exists
    if let Some(user) = user {
        //check pw
        if let Ok(check) = bcrypt::verify(&credentials.password, &user.password) {
            warn!("Bcrypt verified properly!");
        } else {
            warn!(
                "Bcrypt verify failed between {} and {} ",
                &credentials.password, &user.password
            );
        }
        if user.password != credentials.password {
            // User sent wrong pw
            anyhow::bail!("Invalid password!")
        } else {
            let claims = Claims {
                email: credentials.email.to_owned(),
            };
            let keys = JWTKeys::new();

            let token = encode(&Header::default(), &claims, &keys.encoding)?;

            let new_user = LoggedInUser { token };

            Ok((StatusCode::OK, Json(new_user)))
        }
    } else {
        // user does not exist
        anyhow::bail!("User does not exist!")
    }
}

pub enum ExampleEnum {
    NormalThing,
    AnotherThing(u32),
    WhatTheFuckAmI(),
    IDunnoBroButWeCompile(),
}
