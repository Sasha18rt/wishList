// models/Wishlist.ts
import mongoose from "mongoose";
import User from "./User"; // 👈 гарантує, що модель User зареєстрована

const wishSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  image_url: String,
  image_public_id: String,
  product_url: String,
  price: String,
  currency: {
    type: String,
    trim: true,
    default: "EUR", 
  },
  added_at: { type: Date, default: Date.now },
});

const wishlistSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    theme: { type: String, default: "default" },
    visibility: { type: String, enum: ["public", "private"], default: "private" },
    wishes: [wishSchema],
  },
  { timestamps: true } // 👈 краще, ніж вручну created_at
);

export default mongoose.models.Wishlist || mongoose.model("Wishlist", wishlistSchema);
