use auth_rs::models::{LoggedInUser, User};
use auth_rs::{AppError, Claims, JWTKeys};
use axum::http::StatusCode;
use axum::{Extension, Json};
use jsonwebtoken::{encode, Header};

use sqlx::PgPool;
use tracing::log::{error, info};

#[axum_macros::debug_handler]
pub async fn create_user(
    // Collect our database connection pool from establish_connection()
    Extension(conn): Extension<PgPool>,
    // This is similar to IPostUserRequest typing in Fastify and deserializes the request into a
    // 'credentials' object
    Json(credentials): Json<User>,
) -> Result<StatusCode, AppError> {
    // Try creating a new user
    let res = try_create_user(&conn, &credentials).await?;
    // Return our result if it worked
    Ok(res)
}

async fn try_create_user(conn: &PgPool, credentials: &User) -> Result<StatusCode, anyhow::Error> {
    if credentials.email.is_empty() {
        anyhow::bail!("Invalid email!")
    }

    if credentials.password.is_empty() {
        anyhow::bail!("Invalid password!")
    }

    // Query the database to create the new user
    let new_user = sqlx::query("INSERT INTO users (name, email, password) VALUES ($1, $2, $3)")
        .bind(&credentials.email) // $1
        .bind(&credentials.email) // $2
        .bind(&credentials.password) // $3
        .execute(conn)
        .await?;

    // If we affected 0 rows, clearly we didn't add one
    return if new_user.rows_affected() < 1 {
        anyhow::bail!("Unable to create new user account!")
    } else {
        Ok(StatusCode::CREATED)
    };
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

    // Note here we're supplying User as the type of response we're expecting from this query.
    // SQLx will connect to our real database AT COMPILE TIME to verify this is safe!  Amazing!
    let user = sqlx::query_as::<_, User>("SELECT email, password from users where users.email=$1")
        .bind(&credentials.email)
        .fetch_optional(conn)
        .await?;

    // if the user exists
    if let Some(user) = user {
        //check pw
        if let Ok(_check) = bcrypt::verify(&credentials.password, &user.password) {
            info!("Bcrypt verified properly!");
        } else {
            error!(
                "Bcrypt verify failed between {} and {} ",
                &credentials.password, &user.password
            );
        }
        if user.password != credentials.password {
            // User sent wrong pw
            anyhow::bail!("Invalid password!")
        } else {
            // Claims are our "payload" from fastify
            let claims = Claims {
                email: credentials.email.to_owned(),
            };
            // This is the piece we had a lib handle for us in Fastify
            let keys = JWTKeys::new();
            // Actually encrypt the token from raw parts
            let token = encode(&Header::default(), &claims, &keys.encoding)?;
            // Create our proper response type from the token
            let new_user = LoggedInUser { token };

            // Send response, including our freshly generated and encrypted token
            Ok((StatusCode::OK, Json(new_user)))
        }
    } else {
        // user does not exist
        anyhow::bail!("User does not exist!")
    }
}
