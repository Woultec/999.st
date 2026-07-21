// ─── Order Routes — Mga endpoint para sa orders ─────────
// 📌 ROUTES LAYER — dito naka-set kung sino ang pwedeng pumasok sa bawat endpoint
//    Public, Authenticated (buyer), o Admin lang?

import { Router } from "express";
import orderController from "../controllers/order.controller";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";
import { orderLimiter } from "../middlewares/rateLimit.middleware";

const router = Router();

// ─── Buyer routes (kailangang naka-login) ──────────────
// 📌 Ang buyer ay pwedeng:
//    - Gumawa ng order (POST /)
//    - Tingnan ang sarili niyang orders (GET /my-orders)
//    - I-submit ang GCash ref number (PUT /:id/payment-ref)
//    - Tingnan ang specific order niya (GET /:id)

// 📌 Order limiter — 20 orders lang per 15 minutes (iwas spam!)
router.post("/", authenticate, orderLimiter, orderController.createOrder);
router.get("/my-orders", authenticate, orderController.getMyOrders);

// ⚠️ /sales-summary dapat bago ang /:id para hindi mag-conflict!
router.get("/sales-summary", authenticate, requireAdmin, orderController.getSalesSummary);

router.put("/:id/payment-ref", authenticate, orderController.updatePaymentRef);
router.get("/:id", authenticate, orderController.getOrderById);

// ─── Admin routes ───────────────────────────────────────
// 📌 Ang admin ay pwedeng:
//    - Tingnan lahat ng orders (GET /)
//    - I-update ang status ng order (PUT /:id/status)
//    - I-update ang payment status (PUT /:id/payment)
//    - Burahin ang order (DELETE /:id)

router.get("/", authenticate, requireAdmin, orderController.getOrders);
router.put("/:id/status", authenticate, requireAdmin, orderController.updateOrderStatus);
router.put("/:id/payment", authenticate, requireAdmin, orderController.updatePaymentStatus);
router.delete("/:id", authenticate, requireAdmin, orderController.deleteOrder);

export default router;
