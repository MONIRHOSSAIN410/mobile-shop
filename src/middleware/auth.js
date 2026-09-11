import { asyncHandler } from "./asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { verifyToken } from "../utils/token.js";
import { User } from "../models/User.js";

function extractToken(req) {
  const header = req.headers.authorization ?? "";
  if (header.startsWith("Bearer ")) return header.slice(7);
  if (req.cookies?.token) return req.cookies.token;
  return null;
}

export const protect = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized("Please log in to continue");

  const decoded = verifyToken(token);
  const user = await User.findById(decoded.id);
  if (!user) throw ApiError.unauthorized("This account no longer exists");

  req.user = user;
  next();
});

export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (token) {
    try {
      const decoded = verifyToken(token);
      req.user = await User.findById(decoded.id);
    } catch {
      req.user = null;
    }
  }
  next();
});

export const restrictTo =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(ApiError.forbidden("You do not have permission for this"));
    }
    next();
  };
