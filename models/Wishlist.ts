import mongoose from "mongoose";

const wishSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  image_url: { type: String },
  image_public_id: { type: String },
  product_url: { type: String },
  price: { type: String }, 
  added_at: { type: Date, default: Date.now },
});

const wishlistSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  theme: { type: String, default: "default" },
  visibility: { type: String, enum: ["public", "private"], default: "private" },
  created_at: { type: Date, default: Date.now },
  wishes: [wishSchema], 
});

export default mongoose.models.Wishlist || mongoose.model("Wishlist", wishlistSchema);
