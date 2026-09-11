import { Router } from "express";
import mongoose from "mongoose";

import productRoutes from "./productRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import brandRoutes from "./brandRoutes.js";
import authRoutes from "./authRoutes.js";
import orderRoutes from "./orderRoutes.js";

const router = Router();

router.get("/health", (_req, res) =>
  res.json({
    success: true,
    status: "ok",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  })
);

router.get("/", (_req, res) =>
  res.json({
    success: true,
    message: "Mobile Shop API",
    endpoints: {
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

router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/brands", brandRoutes);
router.use("/auth", authRoutes);
router.use("/orders", orderRoutes);

export default router;
