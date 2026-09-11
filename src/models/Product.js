import mongoose from "mongoose";

import { slugify } from "../utils/slugify.js";

export const AVAILABILITY = ["in-stock", "pre-order", "out-of-stock"];
export const NETWORKS = ["5G", "4G", "3G", "2G"];

const specSchema = new mongoose.Schema(
  {
    display: String,
    processor: String,
    ram: String,
    storage: String,
    battery: String,
    rearCamera: String,
    frontCamera: String,
    os: String,
    sim: String,
    weight: String,
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Product name is required"], trim: true },
    slug: { type: String, unique: true, index: true },

    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },
    brandName: { type: String, required: true, index: true },
    brandSlug: { type: String, required: true, index: true },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    categorySlug: { type: String, required: true, index: true },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      index: true,
    },
    oldPrice: { type: Number, default: null },

    images: { type: [String], default: [] },
    // used by the built-in SVG product mock when no photo is uploaded yet
    accent: { type: String, default: "#c9a227" },

    availability: {
      type: String,
      enum: AVAILABILITY,
      default: "in-stock",
      index: true,
    },
    stock: { type: Number, default: 10, min: 0 },

    networks: {
      type: [{ type: String, enum: NETWORKS }],
      default: ["4G"],
      index: true,
    },

    isFeatured: { type: Boolean, default: false, index: true },
    isNewArrival: { type: Boolean, default: false },
    instalment: { type: Boolean, default: false },

    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },

    shortDescription: { type: String, default: "" },
    description: { type: String, default: "" },
    highlights: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    specs: { type: specSchema, default: () => ({}) },
    tags: { type: [String], default: [], index: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

productSchema.index({ name: "text", brandName: "text", tags: "text" });
productSchema.index({ categorySlug: 1, price: 1 });
productSchema.index({ createdAt: -1 });

productSchema.virtual("discountPercent").get(function () {
  if (!this.oldPrice || this.oldPrice <= this.price) return 0;
  return Math.round(((this.oldPrice - this.price) / this.oldPrice) * 100);
});

productSchema.virtual("inStock").get(function () {
  return this.availability === "in-stock" && this.stock > 0;
});

// Mongoose 9 removed the `next` callback from middleware: a hook either runs
// synchronously or returns a promise. Taking a `next` argument here throws
// "next is not a function" on every save.
productSchema.pre("validate", function setSlug() {
  if (!this.slug || this.isModified("name")) {
    this.slug = slugify(this.name);
  }
});

export const Product =
  mongoose.models.Product ?? mongoose.model("Product", productSchema);
