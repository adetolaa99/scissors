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
Object.defineProperty(exports, "__esModule", { value: true });
exports.URLController = void 0;
const url_service_1 = require("../services/url.service");
class URLController {
    static shortenURL(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { longURL, customDomain } = req.body;
                const shortURL = yield url_service_1.URLService.shortenURL(longURL, customDomain);
                res.status(201).json({ shortURL });
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
    }
    static redirectToLongURL(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { shortCode } = req.params;
            const longURL = yield url_service_1.URLService.getLongURL(shortCode);
            if (longURL) {
                res.redirect(longURL);
            }
            else {
                res.status(404).json({ error: "URL not found" });
            }
        });
    }
    static generateQRCode(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { shortURL } = req.body;
                const qrCode = yield url_service_1.URLService.generateQRCode(shortURL);
                res.status(200).json({ qrCode });
            }
            catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
    }
    static getURLAnalytics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { shortCode } = req.params;
                const analytics = yield url_service_1.URLService.getURLAnalytics(shortCode);
                res.status(200).json(analytics);
            }
            catch (error) {
                res.status(404).json({ error: error.message });
            }
        });
    }
    static getLinkHistory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const history = yield url_service_1.URLService.getLinkHistory();
                res.status(200).json(history);
            }
            catch (error) {
                res.status(500).json({ error: "Internal server error" });
            }
        });
    }
}
exports.URLController = URLController;
