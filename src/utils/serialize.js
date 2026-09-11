/**
 * `.lean()` skips Mongoose virtuals, so we re-attach the two the storefront
 * needs. Keeping it here means the API shape is identical for lean and
 * hydrated documents.
 */
export function serializeProduct(product) {
  if (!product) return product;

  const price = Number(product.price ?? 0);
  const oldPrice = Number(product.oldPrice ?? 0);
  const discountPercent =
    oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  return {
    ...product,
    id: String(product._id ?? product.id ?? ""),
    discountPercent,
    inStock: product.availability === "in-stock" && (product.stock ?? 0) > 0,
  };
}

export const serializeProducts = (list = []) => list.map(serializeProduct);
