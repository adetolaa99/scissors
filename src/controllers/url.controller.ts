import { Request, Response } from "express";
import { URLService } from "../services/url.service";
import mongoose from "mongoose";
import { UserType } from "../middleware/types";

export class URLController {
  static async shortenURL(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      const { longURL, customDomain } = req.body;

      const userId = (req.user as { userId: mongoose.Types.ObjectId }).userId;

      const shortURL = await URLService.shortenURL(
        longURL,
        customDomain,
        userId
      );
      res.status(201).json({ shortURL });
    } catch (error) {
      console.error("Error shortening URL:", error);
      res.status(400).json({ error: (error as Error).message });
    }
  }

  static async redirectToLongURL(req: Request, res: Response): Promise<void> {
    const { shortCode } = req.params;

    try {
      const longURL = await URLService.getLongURL(shortCode);

      if (longURL) {
        res.redirect(longURL);
      } else {
        console.log("URL not found");
        res.status(404).json({ error: "URL not found" });
      }
    } catch (error) {
      console.error("Error redirecting to long URL:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  }

  static async generateQRCode(req: Request, res: Response): Promise<void> {
    try {
      const { shortURL } = req.body;
      const qrCode = await URLService.generateQRCode(shortURL);
      res.status(200).json({ qrCode });
    } catch (error) {
      console.error("Error generating QR code:", error);
      res.status(400).json({ error: (error as Error).message });
    }
  }

  static async getURLAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { shortCode } = req.params;
      const userId = (req.user as UserType).userId;

      const analytics = await URLService.getURLAnalytics(shortCode, userId);
      res.json(analytics);
    } catch (error) {
      console.error("Error in getURLAnalytics:", error);
      res.status(500).json({
        message: (error as Error).message || "Error fetching analytics",
      });
    }
  }

  static async getLinkHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as UserType).userId;

      const history = await URLService.getLinkHistory(userId);
      res.json(history);
    } catch (error) {
      console.error("Error in getLinkHistory:", error);
      res.status(500).json({
        message: (error as Error).message || "Error fetching link history",
      });
    }
  }
}
