import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import { UserType } from "../middleware/types";

export class AuthController {
  static async signup(req: Request, res: Response) {
    const { username, password } = req.body;

    try {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ username, password: hashedPassword });

      await user.save();

      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Server error", error: (error as Error).message });
    }
  }

  static login(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("local", (err: Error, user: UserType, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res
          .status(400)
          .json({ message: info.message || "Invalid username or password" });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
          expiresIn: "1h",
        });
        res.cookie("token", token, { httpOnly: true });
        return res.json({ message: "Logged in successfully", token });
      });
    })(req, res, next);
  }

  static logout(req: Request, res: Response) {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
  }

  static refreshToken(req: Request, res: Response) {
    const { userId } = req.user as UserType;
    const newToken = jwt.sign({ userId }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });
    res.json({ token: newToken });
  }
}
