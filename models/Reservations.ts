import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
  wishlist_id: { type: mongoose.Schema.Types.ObjectId, ref: "Wishlist", required: true },
  wish_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reserved_at: { type: Date, default: Date.now },
});


export default mongoose.models.Reservation || mongoose.model("Reservation", reservationSchema);
