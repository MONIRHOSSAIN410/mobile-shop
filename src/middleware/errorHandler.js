import { isProd } from "../config/env.js";

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let statusCode = err.statusCode ?? 500;
  let message = err.message ?? "Something went wrong";
  let details = err.details;

  // Mongoose: bad ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose: schema validation
  if (err.name === "ValidationError") {
    statusCode = 422;
    message = "Validation failed";
    details = Object.fromEntries(
      Object.entries(err.errors).map(([k, v]) => [k, v.message])
    );
  }

  // Mongo: duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue ?? {})[0] ?? "field";
    message = `That ${field} is already in use`;
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Session expired, please log in again";
  }

  if (statusCode >= 500) console.error(err);

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
    ...(isProd ? {} : { stack: err.stack }),
  });
}
