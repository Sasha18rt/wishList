// models/User.ts
import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const recentlyViewedSchema = new mongoose.Schema(
  {
    wishlistId: { type: mongoose.Schema.Types.ObjectId, ref: "Wishlist", required: true },
    viewedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true, unique: true, required: true },
    image: { type: String },
    googleId: { type: String, unique: true, sparse: true },
    nickname: { type: String, unique: true, required: true, trim: true },
    instagramHandle: { type: String, trim: true },
    role: { type: String, default: "user" },
    premiumStatus: { type: Boolean, default: false },
    customerId: { type: String },
    priceId: { type: String },
    recentlyViewed: {
      type: [recentlyViewedSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

userSchema.plugin(toJSON);

export default mongoose.models.User || mongoose.model("User", userSchema);
