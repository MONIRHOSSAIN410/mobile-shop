import { Brand } from "../models/Brand.js";
import { Product } from "../models/Product.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * GET /api/brands?category=phones
 * Powers the brand chip row ("All, Samsung, Honor … More brands (3)").
 */
export const listBrands = asyncHandler(async (req, res) => {
  const match = {};
  if (req.query.category && req.query.category !== "all") {
    match.categorySlug = req.query.category;
  }

  const [brands, counts] = await Promise.all([
    Brand.find({ isActive: true }).sort({ order: 1, name: 1 }).lean(),
    Product.aggregate([
      { $match: match },
      { $group: { _id: "$brandSlug", count: { $sum: 1 } } },
    ]),
  ]);

  const countBySlug = Object.fromEntries(counts.map((c) => [c._id, c.count]));

  const data = brands
    .map((b) => ({ ...b, productCount: countBySlug[b.slug] ?? 0 }))
    .filter((b) => (req.query.category ? b.productCount > 0 : true))
    .sort((a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name));

  res.json({ success: true, data });
});

export const getBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findOne({ slug: req.params.slug }).lean();
  if (!brand) throw ApiError.notFound("That brand does not exist");
  res.json({ success: true, data: brand });
});

export const createBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.create(req.body);
  res.status(201).json({ success: true, data: brand });
});

export const updateBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!brand) throw ApiError.notFound("That brand does not exist");
  res.json({ success: true, data: brand });
});

export const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findByIdAndDelete(req.params.id);
  if (!brand) throw ApiError.notFound("That brand does not exist");
  res.json({ success: true, message: "Brand deleted" });
});
