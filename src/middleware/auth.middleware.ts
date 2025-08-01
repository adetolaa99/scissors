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
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Authorization header missing or incorrect");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as UserType;

    const user = await User.findById(decoded.userId).lean();

    if (!user) {
      console.error("User not found");
      return res.status(401).json({ message: "User not found" });
    }

    req.user = { ...user, userId: decoded.userId };
    next();
  } catch (error) {
    console.error("JWT verification failed", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
