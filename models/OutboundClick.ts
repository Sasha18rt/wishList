import mongoose, { Schema, models, model } from "mongoose";

const OutboundClickSchema = new Schema(
  {
    hostname: { type: String, required: true, index: true },

    // Я рекомендую зберігати URL БЕЗ query, щоб не ловити персональні штуки
    // (amazon links можуть мати купу параметрів)
    url: { type: String, required: true },

    // твої ідентифікатори
    wish_id: { type: String, index: true },
    wishlist_id: { type: String, index: true },

    // мета (не обовʼязково, але корисно)
    referrer: { type: String },
    user_agent: { type: String },
  },
  { timestamps: true } // createdAt / updatedAt
);

// (опційно) індекси для аналітики
OutboundClickSchema.index({ createdAt: -1 });
OutboundClickSchema.index({ wishlist_id: 1, createdAt: -1 });

const OutboundClick =
  models.OutboundClick || model("OutboundClick", OutboundClickSchema);

export default OutboundClick;
