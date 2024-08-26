import express from "express";
import { URLController } from "../controllers/url.controller";
import { apiLimiter } from "../middleware/rateLimiter";
import { isAuthenticated } from "../middleware/auth.middleware";

const router = express.Router();

// Public route for redirection
router.get("/:shortCode", URLController.redirectToLongURL);

// Applying isAuthenticated middleware to all routes
router.use(isAuthenticated);

router.post("/shorten", apiLimiter, URLController.shortenURL);
router.post("/qrcode", apiLimiter, URLController.generateQRCode);
router.get("/analytics/:shortCode", apiLimiter, URLController.getURLAnalytics);
router.get("/history", apiLimiter, URLController.getLinkHistory);

export default router;
