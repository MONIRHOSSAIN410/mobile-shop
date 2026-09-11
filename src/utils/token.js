import jwt from "jsonwebtoken";

import { env, isProd } from "../config/env.js";

export function signToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

export function setAuthCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearAuthCookie(res) {
  res.clearCookie("token", { path: "/" });
}
