import { Router } from "express";

import {
  createOrder,
  myOrders,
  getOrder,
  listOrders,
  updateOrderStatus,
  createOrderSchema,
} from "../controllers/orderController.js";
import { protect, restrictTo } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(protect);

router.post("/", validate(createOrderSchema), createOrder);
router.get("/my", myOrders);
router.get("/:orderNumber", getOrder);

router.get("/", restrictTo("admin"), listOrders);
router.patch("/:id/status", restrictTo("admin"), updateOrderStatus);

export default router;
