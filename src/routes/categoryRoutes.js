import { Router } from "express";

import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = Router();

router.get("/", listCategories);
router.get("/:slug", getCategory);

router.post("/", protect, restrictTo("admin"), createCategory);
router.patch("/:id", protect, restrictTo("admin"), updateCategory);
router.delete("/:id", protect, restrictTo("admin"), deleteCategory);

export default router;
