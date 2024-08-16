import { Request, Response } from "express";
import { URLService } from "../services/url.service";

export class URLController {
  static async shortenURL(req: Request, res: Response): Promise<void> {
    try {
      const { longURL, customDomain } = req.body;
      console.log("Received longURL:", longURL);
      console.log("Received customDomain:", customDomain);

      const shortURL = await URLService.shortenURL(longURL, customDomain);
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

    const longURL = await URLService.getLongURL(shortCode);

    if (longURL) {
      console.log(`Redirecting to: ${longURL}`);
      res.redirect(longURL);
    } else {
      console.log("URL not found");
      res.status(404).json({ error: "URL not found" });
    }
  }

  static async generateQRCode(req: Request, res: Response): Promise<void> {
    try {
      const { shortURL } = req.body;
      const qrCode = await URLService.generateQRCode(shortURL);
      res.status(200).json({ qrCode });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  static async getURLAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { shortCode } = req.params;
      const analytics = await URLService.getURLAnalytics(shortCode);
      res.status(200).json(analytics);
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  }

  static async getLinkHistory(req: Request, res: Response): Promise<void> {
    console.log("Entering getLinkHistory controller");
    try {
      console.log("Calling URLService.getLinkHistory");
      const history = await URLService.getLinkHistory();
      console.log("Received history:", history);
      res.status(200).json(history);
    } catch (error) {
      console.error("Error in getLinkHistory controller:", error);
      res.status(500).json({ error: "Failed to fetch link history" });
    }
  }
}
