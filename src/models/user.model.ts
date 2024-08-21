import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";
import { UserType } from "../middleware/types";

const userSchema = new Schema<UserType>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

userSchema.methods.isValidPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model<UserType>("User", userSchema);
