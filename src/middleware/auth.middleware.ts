import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model"; // Use the correct User model
import { UserType } from "./types"; // Adjust the import for the User interface

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as UserType;

    const user = await User.findById(decoded.userId).lean(); // Use the correct User model

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = { ...user, userId: decoded.userId }; // Attach the user object to req.user
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
