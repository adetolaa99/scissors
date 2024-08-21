import mongoose, { Document } from "mongoose";

export interface IURL extends Document {
  longURL: string;
  shortCode: string;
  customDomain?: string;
  clicks: number;
  userId: mongoose.Types.ObjectId; // Ensure it matches UserType
  createdAt: Date;
}

const urlSchema = new mongoose.Schema<IURL>({
  longURL: { type: String, required: true },
  shortCode: { type: String, required: true, unique: true },
  customDomain: { type: String },
  clicks: { type: Number, default: 0 },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

export const URLModel = mongoose.model<IURL>("URL", urlSchema);
