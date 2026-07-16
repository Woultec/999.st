// ─── Payment Routes — PayMongo Endpoints ──────────────────
// 📌 ROUTES LAYER — dito naka-set ang payment endpoints
//
//    POST   /api/payments/create-intent  → Gumawa ng PaymentIntent (buyer)
//    POST   /api/payments/webhook        → Webhook from PayMongo (PUBLIC)
//    GET    /api/payments/intent/:orderId → Check PaymentIntent status
//
// ⚠️ Ang /webhook ay PUBLIC — kasi si PayMongo mismo ang tatawag dito
//    Walang auth para hindi mag-fail ang webhook

import { Router } from "express";
import paymentController from "../controllers/payment.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// ─── Public route (no auth) — PayMongo lang ang tatawag ──
router.post("/webhook", paymentController.handleWebhook);

// ─── Authenticated routes ────────────────────────────────
router.post(
  "/create-intent",
  authenticate,
  paymentController.createIntent
);
router.get(
  "/intent/:orderId",
  authenticate,
  paymentController.getIntentStatus
);

export default router;
