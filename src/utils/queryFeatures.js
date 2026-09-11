/**
 * Turns the storefront's querystring into a Mongo filter + sort + pagination.
 * Mirrors the sidebar in the UI: price range, availability, brand, network, search.
 */

export const SORT_MAP = {
  default: { isFeatured: -1, createdAt: -1 },
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  "name-asc": { name: 1 },
  "name-desc": { name: -1 },
  popular: { sold: -1, rating: -1 },
  rating: { rating: -1, numReviews: -1 },
};

const toArray = (value) =>
  value === undefined || value === null || value === ""
    ? []
    : Array.isArray(value)
      ? value.flatMap((v) => String(v).split(","))
      : String(value).split(",");

export function buildProductQuery(query = {}) {
  const filter = {};

  if (query.category && query.category !== "all") {
    filter.categorySlug = query.category;
  }

  const brands = toArray(query.brand)
    .map((b) => b.trim().toLowerCase())
    .filter(Boolean);
  if (brands.length) filter.brandSlug = { $in: brands };

  const networks = toArray(query.network)
    .map((n) => n.trim().toUpperCase())
    .filter((n) => n !== "ALL");
  if (networks.length) filter.networks = { $in: networks };

  const min = Number(query.minPrice);
  const max = Number(query.maxPrice);
  if (Number.isFinite(min) || Number.isFinite(max)) {
    filter.price = {};
    if (Number.isFinite(min)) filter.price.$gte = min;
    if (Number.isFinite(max)) filter.price.$lte = max;
  }

  if (query.availability && query.availability !== "all") {
    filter.availability = query.availability;
  }

  if (query.featured === "true") filter.isFeatured = true;
  if (query.instalment === "true") filter.instalment = true;

  const search = (query.q ?? query.search ?? "").trim();
  if (search) {
    const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: rx }, { brandName: rx }, { tags: rx }];
  }

  const sortKey = String(query.sort ?? "default").toLowerCase();
  const sort = SORT_MAP[sortKey] ?? SORT_MAP.default;

  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(60, Math.max(1, Number.parseInt(query.limit, 10) || 24));
  const skip = (page - 1) * limit;

  return { filter, sort, page, limit, skip, sortKey };
}

/** Same filter, minus one dimension — so facet counts stay useful while filtering. */
export function omitKeys(filter, keys) {
  const clone = { ...filter };
  for (const key of keys) delete clone[key];
  return clone;
}
