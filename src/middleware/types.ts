import { Document, Types } from "mongoose";

export interface UserType extends Document {
  userId: Types.ObjectId;
  username: string;
  password: string;
}
