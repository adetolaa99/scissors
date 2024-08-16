import mongoose from "mongoose";

const urlSchema = new mongoose.Schema({
  longURL: { type: String, required: true },
  shortCode: { type: String, required: true, unique: true },
  customDomain: { type: String },
  createdAt: { type: Date, default: Date.now },
  clicks: { type: Number, default: 0 },
});

export const URLModel = mongoose.model("URL", urlSchema);
