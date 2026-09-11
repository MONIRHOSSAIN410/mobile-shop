import { z } from "zod";

import { User } from "../models/User.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { signToken, setAuthCookie, clearAuthCookie } from "../utils/token.js";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?88)?01[3-9]\d{8}$/, "Enter a valid Bangladeshi mobile number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

/** POST /api/auth/register */
export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  const exists = await User.findOne({ $or: [{ email }, { phone }] });
  if (exists) {
    throw ApiError.conflict(
      exists.email === email
        ? "An account with this email already exists"
        : "An account with this mobile number already exists"
    );
  }

  const user = await User.create({ name, email, phone, password });
  const token = signToken({ id: user._id, role: user.role });
  setAuthCookie(res, token);

  res.status(201).json({
    success: true,
    message: "Account created. An OTP has been sent to your mobile.",
    data: { user: user.toSafeJSON(), token },
  });
});

/** POST /api/auth/login */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    throw ApiError.unauthorized("Email or password is incorrect");
  }

  const token = signToken({ id: user._id, role: user.role });
  setAuthCookie(res, token);

  res.json({
    success: true,
    message: `Welcome back, ${user.name.split(" ")[0]}`,
    data: { user: user.toSafeJSON(), token },
  });
});

/** POST /api/auth/logout */
export const logout = asyncHandler(async (_req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, message: "Logged out" });
});

/** GET /api/auth/me */
export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user.toSafeJSON() });
});

/** PATCH /api/auth/me */
export const updateMe = asyncHandler(async (req, res) => {
  const allowed = ["name", "phone", "avatar", "addresses"];
  for (const key of allowed) {
    if (req.body[key] !== undefined) req.user[key] = req.body[key];
  }
  await req.user.save();
  res.json({ success: true, data: req.user.toSafeJSON() });
});
