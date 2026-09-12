import "dotenv/config";

import app from "./src/app.js";
import { connectDB, redactUri } from "./src/config/db.js";
import { env } from "./src/config/env.js";

/**
 * The HTTP server comes up FIRST and the database connects behind it.
 *
 * The old order (connect → then listen) meant one unreachable Atlas cluster
 * took the whole API down with it, and the storefront could only report
 * “cannot reach the API” — which hid the real, much more specific, database
 * error. Now port 5000 always answers: /api/health tells you whether Mongo is
 * attached, and data routes reply 503 with the reason until it is.
 */

const server = app.listen(env.PORT, () => {
  console.log(
    `\n  🚀  API ready on http://localhost:${env.PORT}  (${env.NODE_ENV})` +
      `\n      health → http://localhost:${env.PORT}/api/health\n`
  );
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `\n  ❌  Port ${env.PORT} is already in use.` +
        `\n      Something else is running there — close it, or set a different PORT in backend/.env.` +
        `\n      Windows:  netstat -ano | findstr :${env.PORT}   then   taskkill /PID <pid> /F\n`
    );
  } else {
    console.error("Server error:", error);
  }
  process.exit(1);
});

async function connectWithRetry(attempt = 1) {
  try {
    await connectDB();
  } catch (error) {
    console.error(error.isConnectionError ? error.message : error);
    const delay = Math.min(30_000, attempt * 5_000);
    console.log(
      `  ⏳  Retrying MongoDB (${redactUri(env.MONGODB_URI).split("@").pop()}) in ${
        delay / 1000
      }s — attempt ${attempt + 1}. The API stays up meanwhile.\n`
    );
    setTimeout(() => connectWithRetry(attempt + 1), delay);
  }
}

connectWithRetry();

const shutdown = (signal) => {
  console.log(`\n${signal} received — closing server…`);
  server.close(() => process.exit(0));
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// A dropped Mongo socket must not kill a running API.
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});
