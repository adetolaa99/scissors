import validator from "validator";
import { URLModel } from "../models/url.model";
import { redisClient } from "../config/redis";
import QRCode from "qrcode";
import crypto from "crypto";
import mongoose from "mongoose";

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
    userId?: mongoose.Types.ObjectId
  ): Promise<string> {
    if (!validator.isURL(longURL)) {
      throw new Error("Invalid URL");
    }

    const baseURL = customDomain
      ? `https://${customDomain}`
      : process.env.BASE_URL || "";

    if (customDomain && !validator.isFQDN(customDomain)) {
      throw new Error(
        "Invalid custom domain. It must be a complete domain like 'example.com'."
      );
    }

    const shortCode = crypto.randomBytes(5).toString("base64url");
    const shortURL = `${baseURL}/${shortCode}`;

    const urlDoc = new URLModel({
      longURL,
      shortCode,
      customDomain,
      userId: userId || null,
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
    return await QRCode.toDataURL(shortURL);
  }

  static async getURLAnalytics(
    shortCode: string,
    userId: mongoose.Types.ObjectId
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

  static async getLinkHistory(
    userId: mongoose.Types.ObjectId
  ): Promise<URLHistory[]> {
    const urlDocs = await URLModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    return urlDocs.map((doc) => ({
      longURL: doc.longURL,
      shortURL: `${doc.customDomain || process.env.BASE_URL}/${doc.shortCode}`,
      clicks: doc.clicks,
      createdAt: doc.createdAt,
    }));
  }
}
