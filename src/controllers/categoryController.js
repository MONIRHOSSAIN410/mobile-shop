import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

/** GET /api/categories — with a live product count for the nav */
export const listCategories = asyncHandler(async (_req, res) => {
  const [categories, counts] = await Promise.all([
    Category.find({ isActive: true }).sort({ order: 1, name: 1 }).lean(),
    Product.aggregate([
      { $group: { _id: "$categorySlug", count: { $sum: 1 } } },
    ]),
  ]);

  const countBySlug = Object.fromEntries(counts.map((c) => [c._id, c.count]));

  res.json({
    success: true,
    data: categories.map((c) => ({ ...c, productCount: countBySlug[c.slug] ?? 0 })),
  });
});

/** GET /api/categories/:slug */
export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug }).lean();
  if (!category) throw ApiError.notFound("That category does not exist");
  res.json({ success: true, data: category });
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) throw ApiError.notFound("That category does not exist");
  res.json({ success: true, data: category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw ApiError.notFound("That category does not exist");
  res.json({ success: true, message: "Category deleted" });
});
