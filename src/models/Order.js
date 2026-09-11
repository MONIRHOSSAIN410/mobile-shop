import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    image: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: {
      type: [orderItemSchema],
      validate: [(v) => v.length > 0, "An order needs at least one item"],
    },
    shipping: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      area: String,
      city: { type: String, required: true },
      postcode: String,
      note: String,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "sslcommerz", "bkash", "instalment"],
      default: "cod",
    },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    itemsTotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, default: 80 },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

// Mongoose 9 removed the `next` callback from middleware: a hook either runs
// synchronously or returns a promise. Taking a `next` argument here throws
// "next is not a function" on every save.
orderSchema.pre("validate", function setOrderNumber() {
  if (!this.orderNumber) {
    const stamp = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    this.orderNumber = `MB-${stamp}${rand}`;
  }
});

export const Order =
  mongoose.models.Order ?? mongoose.model("Order", orderSchema);
