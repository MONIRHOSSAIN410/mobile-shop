import { Router } from "express";

import {
  listProducts,
  featuredProducts,
  dealProducts,
  suggestProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = Router();

// static paths first so they are not swallowed by /:slug
router.get("/featured", featuredProducts);
router.get("/deals", dealProducts);
router.get("/suggest", suggestProducts);

router.get("/", listProducts);
router.get("/:slug", getProduct);

router.post("/", protect, restrictTo("admin"), createProduct);
router.patch("/:id", protect, restrictTo("admin"), updateProduct);
router.delete("/:id", protect, restrictTo("admin"), deleteProduct);

export default router;
