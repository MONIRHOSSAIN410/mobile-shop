import mongoose from "mongoose";

import { env } from "./env.js";

// Cached across serverless invocations (Vercel/Lambda re-uses the module scope)
let cached = globalThis.__mongooseConn;
if (!cached) {
  cached = globalThis.__mongooseConn = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  mongoose.set("strictQuery", true);

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(env.MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10_000,
      })
      .then((m) => {
        console.log(`  ✅  MongoDB connected → ${m.connection.name}`);
        return m.connection;
      })
      .catch((error) => {
        // Let the next attempt try again instead of caching the failure.
        cached.promise = null;
        throw describeConnectionFailure(error);
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

/**
 * Mongoose's own message ("MongooseServerSelectionError: connect ECONNREFUSED")
 * says almost nothing useful, so translate the common causes.
 */
function describeConnectionFailure(error) {
  const uri = env.MONGODB_URI;
  const isLocal = /(localhost|127\.0\.0\.1)/.test(uri);
  const redacted = uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@");

  const hints = isLocal
    ? [
        "MongoDB does not seem to be running on this machine.",
        "  • Windows: open Services and start “MongoDB Server”, or run  net start MongoDB",
        "  • Or install it: https://www.mongodb.com/try/download/community",
        "  • MongoDB Compass connecting to the same URI is a quick way to confirm.",
      ]
    : [
        "Could not reach your MongoDB Atlas cluster.",
        "  • Check the username and password in MONGODB_URI.",
        "  • In Atlas → Network Access, allow your IP (or 0.0.0.0/0 while testing).",
      ];

  const message = [
    "",
    `  ❌  Cannot connect to MongoDB at ${redacted}`,
    "",
    ...hints,
    "",
    "  The URI comes from MONGODB_URI in backend/.env — run `npm run setup`",
    "  in the project root if that file does not exist yet.",
    "",
    `  Original error: ${error.message}`,
    "",
  ].join("\n");

  const wrapped = new Error(message);
  wrapped.cause = error;
  wrapped.isConnectionError = true;
  return wrapped;
}

export async function disconnectDB() {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}
