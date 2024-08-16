"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.URLService = void 0;
const nanoid_1 = require("nanoid");
const validator_1 = __importDefault(require("validator"));
const url_model_1 = require("../models/url.model");
const redis_1 = require("../config/redis");
const qrcode_1 = __importDefault(require("qrcode"));
class URLService {
    static shortenURL(longURL, customDomain) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validator_1.default.isURL(longURL)) {
                throw new Error("Invalid URL");
            }
            const shortCode = (0, nanoid_1.nanoid)(7);
            const baseURL = customDomain || process.env.BASE_URL;
            const shortURL = `${baseURL}/${shortCode}`;
            const urlDoc = new url_model_1.URLModel({
                longURL,
                shortCode,
                customDomain,
            });
            yield urlDoc.save();
            yield redis_1.redisClient.set(shortCode, longURL, {
                EX: 86400, // 24 hours
            });
            return shortURL;
        });
    }
    static getLongURL(shortCode) {
        return __awaiter(this, void 0, void 0, function* () {
            const cachedURL = yield redis_1.redisClient.get(shortCode);
            if (cachedURL)
                return cachedURL;
            const urlDoc = yield url_model_1.URLModel.findOneAndUpdate({ shortCode }, { $inc: { clicks: 1 } }, { new: true });
            if (!urlDoc)
                return null;
            yield redis_1.redisClient.set(shortCode, urlDoc.longURL, {
                EX: 86400, // 24 hours
            });
            return urlDoc.longURL;
        });
    }
    static generateQRCode(shortURL) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield qrcode_1.default.toDataURL(shortURL);
            }
            catch (error) {
                throw new Error("Failed to generate QR code");
            }
        });
    }
    static getURLAnalytics(shortCode) {
        return __awaiter(this, void 0, void 0, function* () {
            const urlDoc = yield url_model_1.URLModel.findOne({ shortCode });
            if (!urlDoc)
                throw new Error("URL not found");
            return {
                longURL: urlDoc.longURL,
                shortURL: `${urlDoc.customDomain || process.env.BASE_URL}/${urlDoc.shortCode}`,
                clicks: urlDoc.clicks,
                createdAt: urlDoc.createdAt,
            };
        });
    }
    static getLinkHistory() {
        return __awaiter(this, void 0, void 0, function* () {
            const urlDocs = yield url_model_1.URLModel.find().sort({ createdAt: -1 }).limit(10);
            return urlDocs.map((doc) => ({
                longURL: doc.longURL,
                shortURL: `${doc.customDomain || process.env.BASE_URL}/${doc.shortCode}`,
                clicks: doc.clicks,
                createdAt: doc.createdAt,
            }));
        });
    }
}
exports.URLService = URLService;
