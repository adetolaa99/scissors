"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const url_controller_1 = require("../controllers/url.controller");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = express_1.default.Router();
router.post("/shorten", rateLimiter_1.apiLimiter, url_controller_1.URLController.shortenURL);
router.get("/:shortCode", url_controller_1.URLController.redirectToLongURL);
router.post("/qrcode", rateLimiter_1.apiLimiter, url_controller_1.URLController.generateQRCode);
router.get("/analytics/:shortCode", rateLimiter_1.apiLimiter, url_controller_1.URLController.getURLAnalytics);
router.get("/history", rateLimiter_1.apiLimiter, url_controller_1.URLController.getLinkHistory);
exports.default = router;
