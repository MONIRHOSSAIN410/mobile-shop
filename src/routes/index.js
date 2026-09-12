import { Router } from "express";
import mongoose from "mongoose";

import { cacheJson } from "../middleware/cacheJson.js";
import productRoutes from "./productRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import brandRoutes from "./brandRoutes.js";
import authRoutes from "./authRoutes.js";
import orderRoutes from "./orderRoutes.js";

const router = Router();

/**
 * The API now boots before MongoDB is attached (see server.js), so a data route
 * that runs too early would otherwise sit and time out. Answer straight away
 * with the reason instead — the browser/network tab then shows a real 503 with
 * a message rather than a dead connection.
 */
const requireDb = (_req, res, next) => {
  if (mongoose.connection.readyState === 1) return next();
  return res.status(503).json({
    success: false,
    code: "DB_NOT_CONNECTED",
    message:
      "The API is running but MongoDB is not connected yet. Check MONGODB_URI in backend/.env, then run `npm run db:check` in the backend folder.",
  });
};

const READY_STATES = ["disconnected", "connected", "connecting", "disconnecting"];

router.get("/health", (_req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    success: connected,
    status: connected ? "ok" : "degraded",
    api: "up",
    db: READY_STATES[mongoose.connection.readyState] ?? "unknown",
    dbName: mongoose.connection.name ?? null,
    dbHost: mongoose.connection.host ?? null,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

router.get("/", (_req, res) =>
  res.json({
    success: true,
    message: "Mobile Shop API",
    endpoints: {
      health: "/api/health",
      products: "/api/products",
      productDetail: "/api/products/:slug",
      featured: "/api/products/featured",
      deals: "/api/products/deals",
      suggest: "/api/products/suggest?q=",
      categories: "/api/categories",
      brands: "/api/brands",
      auth: "/api/auth/{register,login,logout,me}",
      orders: "/api/orders",
    },
  })
);

// Read-only catalogue data: safe to hold for 30s (see middleware/cacheJson.js).
router.use("/products", requireDb, cacheJson(30), productRoutes);
router.use("/categories", requireDb, cacheJson(60), categoryRoutes);
router.use("/brands", requireDb, cacheJson(60), brandRoutes);
router.use("/auth", requireDb, authRoutes);
router.use("/orders", requireDb, orderRoutes);

export default router;
