import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import routes from "./routes/index.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { env, isProd } from "./config/env.js";

const app = express();

app.set("trust proxy", 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(isProd ? "combined" : "dev"));

app.use(
  cors({
    origin(origin, callback) {
      // allow server-to-server / curl (no Origin header)
      if (!origin) return callback(null, true);
      if (env.CLIENT_URLS.includes("*")) return callback(null, true);
      if (env.CLIENT_URLS.includes(origin)) return callback(null, true);
      // allow any *.vercel.app preview deployment
      if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(
  "/api",
  rateLimit({
    windowMs: 60_000,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, slow down." },
  })
);

app.get("/", (_req, res) =>
  res.json({
    success: true,
    name: "Mobile Shop API",
    version: "1.0.0",
    docs: "/api",
  })
);

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
