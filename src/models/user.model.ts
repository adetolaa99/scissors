import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

userSchema.methods.isValidPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model("User", userSchema);
