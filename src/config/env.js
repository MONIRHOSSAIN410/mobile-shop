import "dotenv/config";

const required = (key, fallback) => {
  const value = process.env[key] ?? fallback;
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const list = (value, fallback = "") =>
  (value ?? fallback)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 5000),
  MONGODB_URI: required(
    "MONGODB_URI",
    "mongodb://127.0.0.1:27017/mobile-shop"
  ).replace(/^["']|["']$/g, ""),
  // How long to wait for a server before giving up on a connection attempt.
  DB_TIMEOUT_MS: Number(process.env.DB_TIMEOUT_MS ?? 15_000),
  // Optional override for the SRV fallback resolver (see src/config/db.js).
  DNS_SERVERS: list(process.env.DNS_SERVERS),
  JWT_SECRET: required("JWT_SECRET", "change-this-secret-in-production"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "30d",
  // Shared with the Next.js auth layer so only it can call /api/auth/oauth.
  OAUTH_SHARED_SECRET: required(
    "OAUTH_SHARED_SECRET",
    "change-this-oauth-bridge-secret"
  ),
  CLIENT_URLS: list(process.env.CLIENT_URLS, "http://localhost:3000"),
};

export const isProd = env.NODE_ENV === "production";
