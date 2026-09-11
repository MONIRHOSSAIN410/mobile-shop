import { z } from "zod";

import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const DELIVERY_FEE_DHAKA = 80;
const DELIVERY_FEE_OUTSIDE = 130;

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        slug: z.string().min(1),
        quantity: z.number().int().min(1).max(10).default(1),
      })
    )
    .min(1, "Your cart is empty"),
  shipping: z.object({
    fullName: z.string().trim().min(2),
    phone: z.string().trim().regex(/^(\+?88)?01[3-9]\d{8}$/, "Invalid mobile number"),
    address: z.string().trim().min(5),
    area: z.string().trim().optional(),
    city: z.string().trim().min(2),
    postcode: z.string().trim().optional(),
    note: z.string().trim().max(500).optional(),
  }),
  paymentMethod: z.enum(["cod", "sslcommerz", "bkash", "instalment"]).default("cod"),
});

/** POST /api/orders */
export const createOrder = asyncHandler(async (req, res) => {
  const { items, shipping, paymentMethod } = req.body;

  const slugs = items.map((i) => i.slug);
  const products = await Product.find({ slug: { $in: slugs } }).lean();
  if (products.length !== slugs.length) {
    throw ApiError.badRequest("One or more products in your cart are unavailable");
  }

  // Prices always come from the database, never from the client payload.
  const bySlug = Object.fromEntries(products.map((p) => [p.slug, p]));
  const orderItems = items.map(({ slug, quantity }) => {
    const p = bySlug[slug];
    if (p.availability === "out-of-stock") {
      throw ApiError.badRequest(`${p.name} is out of stock`);
    }
    return {
      product: p._id,
      name: p.name,
      slug: p.slug,
      image: p.images?.[0] ?? "",
      price: p.price,
      quantity,
    };
  });

  const itemsTotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = /dhaka/i.test(shipping.city)
    ? DELIVERY_FEE_DHAKA
    : DELIVERY_FEE_OUTSIDE;

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shipping,
    paymentMethod,
    itemsTotal,
    deliveryFee,
    grandTotal: itemsTotal + deliveryFee,
  });

  res.status(201).json({ success: true, data: order });
});

/** GET /api/orders/my */
export const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, data: orders });
});

/** GET /api/orders/:orderNumber */
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber }).lean();
  if (!order) throw ApiError.notFound("Order not found");

  const isOwner = String(order.user) === String(req.user._id);
  if (!isOwner && req.user.role !== "admin") {
    throw ApiError.forbidden("This order belongs to another account");
  }

  res.json({ success: true, data: order });
});

/* ------------------------------ admin ------------------------------ */

export const listOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 20);

  const filter = req.query.status ? { status: req.query.status } : {};
  const [data, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data,
    meta: { total, page, limit, pages: Math.ceil(total / limit) },
  });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  );
  if (!order) throw ApiError.notFound("Order not found");
  res.json({ success: true, data: order });
});
