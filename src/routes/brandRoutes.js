import { Router } from "express";

import {
  listBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../controllers/brandController.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = Router();

router.get("/", listBrands);
router.get("/:slug", getBrand);

router.post("/", protect, restrictTo("admin"), createBrand);
router.patch("/:id", protect, restrictTo("admin"), updateBrand);
router.delete("/:id", protect, restrictTo("admin"), deleteBrand);

export default router;
