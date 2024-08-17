import express from "express";
import { URLController } from "../controllers/url.controller";
import { apiLimiter } from "../middleware/rateLimiter";
import { isAuthenticated } from "../middleware/auth.middleware";

const router = express.Router();

console.log("Setting up URL routes");

router.post("/shorten", apiLimiter, URLController.shortenURL);
router.get("/:shortCode", URLController.redirectToLongURL);
router.post("/qrcode", apiLimiter, URLController.generateQRCode);

router.get(
  "/analytics/:shortCode",
  isAuthenticated,
  apiLimiter,
  URLController.getURLAnalytics
);

router.get(
  "/history",
  isAuthenticated,
  apiLimiter,
  URLController.getLinkHistory
);

export default router;
