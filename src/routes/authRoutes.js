import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  register,
  login,
  logout,
  me,
  updateMe,
  registerSchema,
  loginSchema,
} from "../controllers/authController.js";
import { oauthUpsert, oauthSchema } from "../controllers/oauthController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 25,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again in a few minutes.",
  },
});

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", logout);

// server-to-server: the Next.js auth layer exchanges a verified Google
// identity for one of our tokens
router.post("/oauth", validate(oauthSchema), oauthUpsert);

router.get("/me", protect, me);
router.patch("/me", protect, updateMe);

export default router;
