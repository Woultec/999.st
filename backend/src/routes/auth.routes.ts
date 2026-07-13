// ─── Auth Routes ─────────────────────────────────────────
import { Router } from "express";
import authController from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authLimiter } from "../middlewares/rateLimit.middleware";

const router = Router();

// 📌 Auth limiter — 10 attempts lang per 15 minutes (iwas brute force!)
//    Nilagay lang sa POST (login/register), hindi sa GET /me o PUT /profile
router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.get("/me", authenticate, authController.getMe);
router.put("/profile", authenticate, authController.updateProfile);
router.put("/password", authenticate, authController.changePassword);

export default router;
