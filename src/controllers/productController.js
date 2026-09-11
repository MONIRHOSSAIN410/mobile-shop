import { Product } from "../models/Product.js";
import { Brand } from "../models/Brand.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { buildProductQuery, omitKeys } from "../utils/queryFeatures.js";
import { serializeProduct, serializeProducts } from "../utils/serialize.js";

const PRICE_BUCKETS = [
  { key: "under-10k", label: "Under ৳10,000", min: 0, max: 9999 },
  { key: "10k-20k", label: "৳10K - ৳20K", min: 10000, max: 20000 },
  { key: "20k-40k", label: "৳20K - ৳40K", min: 20000, max: 40000 },
  { key: "40k-80k", label: "৳40K - ৳80K", min: 40000, max: 80000 },
  { key: "80k-plus", label: "৳80K+", min: 80000, max: null },
];

/**
 * GET /api/products
 * Listing + facet counts for the sidebar, in a single round-trip.
 */
export const listProducts = asyncHandler(async (req, res) => {
  const { filter, sort, page, limit, skip, sortKey } = buildProductQuery(
    req.query
  );

  // For facets, drop the dimension being counted so the user can still switch.
  const brandFacetFilter = omitKeys(filter, ["brandSlug"]);
  const networkFacetFilter = omitKeys(filter, ["networks"]);
  const availabilityFacetFilter = omitKeys(filter, ["availability"]);
  const priceFacetFilter = omitKeys(filter, ["price"]);

  const [items, total, brandFacets, networkFacets, availabilityFacets, range] =
    await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
      Product.aggregate([
        { $match: brandFacetFilter },
        {
          $group: {
            _id: { slug: "$brandSlug", name: "$brandName" },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1, "_id.name": 1 } },
      ]),
      Product.aggregate([
        { $match: networkFacetFilter },
        { $unwind: "$networks" },
        { $group: { _id: "$networks", count: { $sum: 1 } } },
        { $sort: { _id: -1 } },
      ]),
      Product.aggregate([
        { $match: availabilityFacetFilter },
        { $group: { _id: "$availability", count: { $sum: 1 } } },
      ]),
      Product.aggregate([
        { $match: priceFacetFilter },
        { $group: { _id: null, min: { $min: "$price" }, max: { $max: "$price" } } },
      ]),
    ]);

  res.json({
    success: true,
    data: serializeProducts(items),
    meta: {
      total,
      page,
      limit,
      pages: Math.max(1, Math.ceil(total / limit)),
      sort: sortKey,
      from: total === 0 ? 0 : skip + 1,
      to: Math.min(skip + limit, total),
    },
    facets: {
      brands: brandFacets.map((b) => ({
        slug: b._id.slug,
        name: b._id.name,
        count: b.count,
      })),
      networks: networkFacets.map((n) => ({ value: n._id, count: n.count })),
      availability: availabilityFacets.map((a) => ({
        value: a._id,
        count: a.count,
      })),
      price: {
        min: range[0]?.min ?? 0,
        max: range[0]?.max ?? 0,
        buckets: PRICE_BUCKETS,
      },
    },
  });
});

/** GET /api/products/featured */
export const featuredProducts = asyncHandler(async (req, res) => {
  const limit = Math.min(24, Number(req.query.limit) || 8);
  const data = await Product.find({ isFeatured: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  res.json({ success: true, data: serializeProducts(data) });
});

/** GET /api/products/deals — biggest discounts first */
export const dealProducts = asyncHandler(async (req, res) => {
  const limit = Math.min(24, Number(req.query.limit) || 8);
  const data = await Product.aggregate([
    { $match: { oldPrice: { $gt: 0 } } },
    {
      $addFields: {
        off: {
          $cond: [
            { $gt: ["$oldPrice", "$price"] },
            {
              $multiply: [
                { $divide: [{ $subtract: ["$oldPrice", "$price"] }, "$oldPrice"] },
                100,
              ],
            },
            0,
          ],
        },
      },
    },
    { $match: { off: { $gt: 0 } } },
    { $sort: { off: -1 } },
    { $limit: limit },
  ]);

  res.json({
    success: true,
    data: data.map((p) => ({
      ...serializeProduct(p),
      discountPercent: Math.round(p.off),
    })),
  });
});

/** GET /api/products/search-suggest?q= */
export const suggestProducts = asyncHandler(async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  if (q.length < 2) return res.json({ success: true, data: [] });

  const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const data = await Product.find({ $or: [{ name: rx }, { brandName: rx }] })
    .select("name slug price images accent brandName categorySlug")
    .limit(8)
    .lean();

  res.json({ success: true, data });
});

/** GET /api/products/:slug */
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate("brand", "name slug logo")
    .populate("category", "name slug")
    .lean();

  if (!product) throw ApiError.notFound("That product does not exist");

  const related = await Product.find({
    categorySlug: product.categorySlug,
    _id: { $ne: product._id },
  })
    .sort({ isFeatured: -1, createdAt: -1 })
    .limit(8)
    .lean();

  res.json({
    success: true,
    data: {
      product: serializeProduct(product),
      related: serializeProducts(related),
    },
  });
});

/* -------------------------------------------------------------------- */
/*  Admin                                                                */
/* -------------------------------------------------------------------- */

export const createProduct = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.body.brand);
  if (!brand) throw ApiError.badRequest("Unknown brand");

  const product = await Product.create({
    ...req.body,
    brandName: brand.name,
    brandSlug: brand.slug,
  });

  res.status(201).json({ success: true, data: product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) throw ApiError.notFound("That product does not exist");
  res.json({ success: true, data: product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw ApiError.notFound("That product does not exist");
  res.json({ success: true, message: "Product deleted" });
});
