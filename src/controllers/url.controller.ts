import { Request, Response } from "express";
import { URLService } from "../services/url.service";
import mongoose from "mongoose";

export class URLController {
  static async shortenURL(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const { longURL, customDomain } = req.body;
      console.log("Received longURL:", longURL);
      console.log("Received customDomain:", customDomain);

      const userId = (req.user as { userId: mongoose.Types.ObjectId }).userId;
      console.log("User ID:", userId);

      const shortURL = await URLService.shortenURL(
        longURL,
        customDomain,
        userId
      );
      console.log("Generated shortURL:", shortURL);
      res.status(201).json({ shortURL });
    } catch (error) {
      console.error("Error shortening URL:", error);
      res.status(400).json({ error: (error as Error).message });
    }
  }

  static async redirectToLongURL(req: Request, res: Response): Promise<void> {
    const { shortCode } = req.params;
    console.log(`Received shortCode: ${shortCode}`);

    try {
      const longURL = await URLService.getLongURL(shortCode);

      if (longURL) {
        console.log(`Redirecting to: ${longURL}`);
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
      if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      const { shortCode } = req.params;
      const userId = (req.user as { userId: mongoose.Types.ObjectId }).userId;
      const analytics = await URLService.getURLAnalytics(shortCode, userId);
      res.status(200).json(analytics);
    } catch (error) {
      console.error("Error getting URL analytics:", error);
      res.status(404).json({ error: (error as Error).message });
    }
  }

  static async getLinkHistory(req: Request, res: Response): Promise<void> {
    console.log("Entering getLinkHistory controller");

    if (!req.user) {
      console.log("User not authenticated");
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    try {
      const userId = (req.user as { userId: mongoose.Types.ObjectId }).userId;
      console.log("User ID in controller:", userId);

      const history = await URLService.getLinkHistory(userId);
      console.log("Received history:", history);

      res.status(200).json(history);
    } catch (error) {
      console.error("Error in getLinkHistory controller:", error);
      res.status(500).json({ error: "Failed to fetch link history" });
    }
  }
}
