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
//    - Tingnan ang specific order niya (GET /:id)

// 📌 Order limiter — 20 orders lang per 15 minutes (iwas spam!)
//    Nilagay lang sa POST (create), hindi sa GET para hindi ma-block sa pagtingin
router.post("/", authenticate, orderLimiter, orderController.createOrder);
router.get("/my-orders", authenticate, orderController.getMyOrders);
router.get("/:id", authenticate, orderController.getOrderById);

// ─── Admin routes ───────────────────────────────────────
// 📌 Ang admin ay pwedeng:
//    - Tingnan lahat ng orders (GET /)
//    - I-update ang status ng order (PUT /:id/status)
//    - Burahin ang order (DELETE /:id)

router.get("/", authenticate, requireAdmin, orderController.getOrders);
router.put("/:id/status", authenticate, requireAdmin, orderController.updateOrderStatus);
router.delete("/:id", authenticate, requireAdmin, orderController.deleteOrder);

export default router;
