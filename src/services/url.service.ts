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

    let baseURL: string;

    if (!process.env.BASE_URL) {
      throw new Error("❌ BASE_URL is not defined in environment variables.");
    }

    if (customDomain) {
      // Remove protocol if user included it
      customDomain = customDomain.replace(/^https?:\/\//, "");

      if (!validator.isFQDN(customDomain)) {
        throw new Error(
          "Invalid custom domain. It must be a complete domain like 'example.com'."
        );
      }
      baseURL = `https://${customDomain}`;
    } else {
      baseURL = process.env.BASE_URL!;
    }

    const shortCode = crypto.randomBytes(5).toString("base64url");
    const shortURL = `${baseURL}/${shortCode}`;

    const urlDoc = new URLModel({
      longURL,
      shortCode,
      customDomain: customDomain || undefined,
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
    if (cachedURL) {
      const urlDoc = await URLModel.findOneAndUpdate(
        { shortCode },
        { $inc: { clicks: 1 } },
        { new: true }
      );
      console.log(`Updated clicks in DB (cached): ${urlDoc?.clicks}`);
      return cachedURL;
    }

    const urlDoc = await URLModel.findOneAndUpdate(
      { shortCode },
      { $inc: { clicks: 1 } },
      { new: true }
    );

    if (!urlDoc) {
      console.log(`No document found for shortCode: ${shortCode}`); //
      return null;
    }

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
    if (!urlDoc) throw new Error("URL not found!");

    const updatedDoc = await URLModel.findOne({ shortCode });

    return {
      longURL: urlDoc.longURL,
      shortURL: `${urlDoc.customDomain || process.env.BASE_URL}/${urlDoc.shortCode}`,
      clicks: updatedDoc?.clicks || 0,
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
