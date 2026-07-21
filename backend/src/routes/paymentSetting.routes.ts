// ─── Payment Setting Routes — E-wallet Management ────────
// 📌 PUBLIC:
//    GET  /api/payment-settings  → Active e-wallets (checkout)
//
// 📌 ADMIN:
//    GET  /api/payment-settings/admin  → All e-wallets
//    POST /api/payment-settings        → Add new
//    PUT  /api/payment-settings/:id     → Update
//    DELETE /api/payment-settings/:id   → Delete

import { Router } from "express";
import paymentSettingController from "../controllers/paymentSetting.controller";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

// ─── Public route ───────────────────────────────────────
router.get("/", paymentSettingController.getActive);

// ─── Admin routes ───────────────────────────────────────
router.get("/admin", authenticate, requireAdmin, paymentSettingController.getAll);
router.post("/", authenticate, requireAdmin, paymentSettingController.create);
router.put("/:id", authenticate, requireAdmin, paymentSettingController.update);
router.delete("/:id", authenticate, requireAdmin, paymentSettingController.delete);

export default router;
