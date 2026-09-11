import mongoose from "mongoose";

import { slugify } from "../utils/slugify.js";

const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, unique: true, index: true },
    logo: { type: String, default: "" },
    accent: { type: String, default: "#c9a227" },
    country: { type: String, default: "" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Mongoose 9 removed the `next` callback from middleware: a hook either runs
// synchronously or returns a promise. Taking a `next` argument here throws
// "next is not a function" on every save.
brandSchema.pre("validate", function setSlug() {
  if (!this.slug || this.isModified("name")) this.slug = slugify(this.name);
});

export const Brand =
  mongoose.models.Brand ?? mongoose.model("Brand", brandSchema);
