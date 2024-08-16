import { Request, Response } from "express";
import { User } from "../models/user.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class AuthController {
  static async signup(req: Request, res: Response) {
    const { username, password } = req.body;

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const user = new User({ username, password: hashedPassword });
      await user.save();

      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Server error", error: (error as Error).message });
    }
  }

  static async login(req: Request, res: Response) {
    const { username, password } = req.body;

    try {
      // Check if user exists
      const user = await User.findOne({ username });
      if (!user) {
        return res
          .status(400)
          .json({ message: "Invalid username or password" });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Invalid username or password" });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
        expiresIn: "1h",
      });

      res.json({ message: "Logged in successfully", token });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Server error", error: (error as Error).message });
    }
  }
}
