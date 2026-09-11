/**
 * Wraps an async route handler so rejected promises reach the error middleware.
 * Express 5 forwards rejections automatically, but this keeps the intent explicit
 * and works identically if the project is ever downgraded to Express 4.
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
