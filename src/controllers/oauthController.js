import crypto from "node:crypto";
import { z } from "zod";

import { User } from "../models/User.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { signToken } from "../utils/token.js";
import { env } from "../config/env.js";

export const oauthSchema = z.object({
  provider: z.enum(["google"]),
  providerAccountId: z.string().min(1),
  email: z.string().trim().toLowerCase().email(),
  name: z.string().trim().min(1),
  image: z.string().url().optional().or(z.literal("")),
});

/**
 * POST /api/auth/oauth
 *
 * Called server-to-server by the Next.js auth layer after Google has verified
 * the user. It upserts the account and hands back OUR token, so a Google
 * sign-in and an email sign-in end up on the same user document — same orders,
 * same wishlist, same everything.
 *
 * Guarded by a shared secret because it trusts the email it is given.
 */
export const oauthUpsert = asyncHandler(async (req, res) => {
  const presented = req.get("x-oauth-secret") ?? "";
  const expected = env.OAUTH_SHARED_SECRET;

  const a = Buffer.from(presented);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw ApiError.unauthorized("Bad OAuth bridge secret");
  }

  const { provider, providerAccountId, email, name, image } = req.body;

  let user = await User.findOne({ email });

  if (user) {
    let dirty = false;
    if (!user.avatar && image) {
      user.avatar = image;
      dirty = true;
    }
    if (!user.isVerified) {
      // Google has already confirmed the address.
      user.isVerified = true;
      dirty = true;
    }
    if (user.provider !== provider) {
      user.provider = provider;
      user.providerAccountId = providerAccountId;
      dirty = true;
    }
    if (dirty) await user.save();
  } else {
    user = await User.create({
      name,
      email,
      avatar: image || "",
      provider,
      providerAccountId,
      isVerified: true,
      // Social accounts have no password; a random one keeps the field valid
      // and makes sure nobody can guess their way in with the email form.
      password: crypto.randomBytes(32).toString("hex"),
      phone: undefined,
    });
  }

  const token = signToken({ id: user._id, role: user.role });

  res.json({
    success: true,
    data: {
      user: user.toSafeJSON(),
      token,
      needsPhone: !user.phone,
    },
  });
});
