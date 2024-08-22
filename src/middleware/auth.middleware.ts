import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { UserType } from "./types";

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    console.log("Authorization Header:", req.headers.authorization);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as UserType;
    console.log("Decoded Token:", decoded);

    const user = await User.findById(decoded.userId).lean();
    console.log("User:", user);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = { ...user, userId: decoded.userId };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
