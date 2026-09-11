import mongoose from "mongoose";

import { slugify } from "../utils/slugify.js";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, unique: true, index: true },
    icon: { type: String, default: "smartphone" },
    description: { type: String, default: "" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    // brand slugs shown in this category's mega-menu column
    menuBrands: [{ type: String }],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Mongoose 9 removed the `next` callback from middleware: a hook either runs
// synchronously or returns a promise. Taking a `next` argument here throws
// "next is not a function" on every save.
categorySchema.pre("validate", function setSlug() {
  if (!this.slug || this.isModified("name")) this.slug = slugify(this.name);
});

export const Category =
  mongoose.models.Category ?? mongoose.model("Category", categorySchema);
