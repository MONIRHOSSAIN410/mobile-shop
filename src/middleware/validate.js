import { ApiError } from "../utils/ApiError.js";

/** Validates req.body against a zod schema and replaces it with the parsed data. */
export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const details = Object.fromEntries(
      result.error.issues.map((i) => [i.path.join(".") || "_", i.message])
    );
    return next(ApiError.badRequest("Validation failed", details));
  }
  req.body = result.data;
  next();
};
