import express, { Request, Response } from "express";
import { AuthController } from "../controllers/auth.controller";
import { isAuthenticated } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/signup", AuthController.signup);
router.post("/login", AuthController.login);
router.post("/verify-token", isAuthenticated, (req: Request, res: Response) => {
  res.status(200).json({ user: req.user, message: "Token is valid" });
});
router.post("/refresh-token", isAuthenticated, AuthController.refreshToken);
router.get("/logout", AuthController.logout);

export default router;
