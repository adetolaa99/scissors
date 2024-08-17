import validator from "validator";
import { URLModel, IURL } from "../models/url.model";
import { redisClient } from "../config/redis";
import QRCode from "qrcode";
import crypto from "crypto";
import { Document } from "mongoose";

// Interface for the return type
interface URLHistory {
  longURL: string;
  shortURL: string;
  clicks: number;
  createdAt: Date;
}
export class URLService {
  static async shortenURL(
    longURL: string,
    customDomain?: string,
    userId?: string
  ): Promise<string> {
    if (!validator.isURL(longURL)) {
      throw new Error("Invalid URL");
    }

    let baseURL: string;

    if (customDomain) {
      if (!validator.isFQDN(customDomain)) {
        throw new Error(
          "Invalid custom domain. It must be a complete domain like 'example.com'."
        );
      }
      baseURL = `https://${customDomain}`;
    } else {
      baseURL = process.env.BASE_URL || "";
    }

    const shortCode = crypto.randomBytes(5).toString("base64url");

    const shortURL = `${baseURL}/${shortCode}`;

    const urlDoc = new URLModel({
      longURL,
      shortCode,
      customDomain,
      userId,
    });

    await urlDoc.save();

    await redisClient.set(shortCode, longURL, {
      EX: 86400, // 24 hours
    });

    return shortURL;
  }

  static async getLongURL(shortCode: string): Promise<string | null> {
    const cachedURL = await redisClient.get(shortCode);
    if (cachedURL) return cachedURL;

    const urlDoc = await URLModel.findOneAndUpdate(
      { shortCode },
      { $inc: { clicks: 1 } },
      { new: true }
    );
    if (!urlDoc) return null;

    await redisClient.set(shortCode, urlDoc.longURL, {
      EX: 86400, // 24 hours
    });

    return urlDoc.longURL;
  }

  static async generateQRCode(shortURL: string): Promise<string> {
    try {
      return await QRCode.toDataURL(shortURL);
    } catch (error) {
      throw new Error("Failed to generate QR code");
    }
  }

  static async getURLAnalytics(
    shortCode: string,
    userId: string
  ): Promise<{
    longURL: string;
    shortURL: string;
    clicks: number;
    createdAt: Date;
  }> {
    const urlDoc = await URLModel.findOne({ shortCode, userId });
    if (!urlDoc) throw new Error("URL not found or unauthorized");

    return {
      longURL: urlDoc.longURL,
      shortURL: `${urlDoc.customDomain || process.env.BASE_URL}/${urlDoc.shortCode}`,
      clicks: urlDoc.clicks,
      createdAt: urlDoc.createdAt,
    };
  }

  static async getLinkHistory(userId: string): Promise<URLHistory[]> {
    console.log("Entering URLService.getLinkHistory");
    try {
      console.log("Querying database");
      const urlDocs = await URLModel.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10);

      console.log("Query result:", urlDocs);

      if (urlDocs.length === 0) {
        console.log("No documents found");
        return [];
      }

      const result: URLHistory[] = urlDocs.map((doc: IURL) => ({
        longURL: doc.longURL,
        shortURL: `${doc.customDomain || process.env.BASE_URL}/${doc.shortCode}`,
        clicks: doc.clicks,
        createdAt: doc.createdAt,
      }));

      console.log("Mapped result:", result);
      return result;
    } catch (error) {
      console.error("Error fetching link history:", error);
      throw new Error("Failed to fetch link history");
    }
  }
}
