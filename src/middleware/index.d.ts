// src/types/express/index.d.ts
import { UserType } from "../models/user.model"; // Adjust the path to your model

declare module "express-serve-static-core" {
  interface Request {
    user?: UserType; // or whatever type your User model uses
  }
}
