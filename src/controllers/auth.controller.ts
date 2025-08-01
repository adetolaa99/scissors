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
        return res.render("signup", {
          error: "User already exists! Please choose a different username",
          user: req.user,
        });
      }

      if (!password || password.length < 6) {
        return res.render("signup", {
          error: "Password must be at least 6 characters long...",
          user: req.user,
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ username, password: hashedPassword });

      await user.save();

      // Redirect to login with success message
      res.render("login", {
        success: "Account created successfully! Please log in",
        user: req.user,
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.render("signup", {
        error: "An error occurred during signup! Please try again",
        user: req.user,
      });
    }
  }

  static login(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("local", (err: Error, user: UserType, info: any) => {
      if (err) {
        console.error("Login error:", err);
        return res.render("login", {
          error: "An error occurred during login! Please try again",
          user: req.user,
        });
      }
      if (!user) {
        return res.render("login", {
          error: info.message || "Invalid username or password",
          user: req.user,
        });
      }
      req.logIn(user, (err) => {
        if (err) {
          console.error("Session error:", err);
          return res.render("login", {
            error: "An error occurred during login! Please try again",
            user: req.user,
          });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
          expiresIn: "1h",
        });

        // For AJAX requests, return JSON
        if (
          req.headers.accept &&
          req.headers.accept.includes("application/json")
        ) {
          return res.json({ token });
        }

        // For form submissions, redirect
        res.redirect("/shorten-url");
      });
    })(req, res, next);
  }

  static refreshToken(req: Request, res: Response) {
    const { userId } = req.user as UserType;
    const newToken = jwt.sign({ userId }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });
    res.json({ token: newToken });
  }
}
