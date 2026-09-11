import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    // Optional: a Google sign-in gives us no phone number. Checkout asks for
    // one, and the account page lets the user fill it in later.
    phone: {
      type: String,
      trim: true,
      match: [/^(\+?88)?01[3-9]\d{8}$/, "Please provide a valid BD mobile number"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },
    providerAccountId: { type: String, default: "" },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    avatar: { type: String, default: "" },
    addresses: [
      {
        label: String,
        line1: String,
        area: String,
        city: String,
        postcode: String,
        isDefault: { type: Boolean, default: false },
      },
    ],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Mongoose 9 removed the `next` callback from middleware: a hook either runs
// synchronously or returns a promise. Taking a `next` argument here throws
// "next is not a function" on every save.
userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = function matchPassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  const { _id, name, email, phone, role, avatar, isVerified, provider, createdAt } =
    this;
  return {
    id: String(_id),
    name,
    email,
    phone: phone ?? "",
    role,
    avatar,
    isVerified,
    provider,
    createdAt,
  };
};

export const User = mongoose.models.User ?? mongoose.model("User", userSchema);
