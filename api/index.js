/**
 * Vercel serverless entry point.
 * `vercel.json` rewrites every request to this file, and Vercel keeps the
 * module warm — so the Mongo connection is cached in src/config/db.js.
 */
import app from "../src/app.js";
import { connectDB } from "../src/config/db.js";

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (error) {
    console.error("DB connection failed:", error);
    res.statusCode = 503;
    res.setHeader("content-type", "application/json");
    return res.end(
      JSON.stringify({ success: false, message: "Database unavailable" })
    );
  }
  return app(req, res);
}
