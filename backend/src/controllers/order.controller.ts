// ─── Order Controller — Humahawak ng mga request ─────────
// 📌 CONTROLLER LAYER — dito pinapatunayan ang data (validation)
//    Bago ipasa sa Service layer

import type { Request, Response } from "express";
import * as OrderService from "../services/order.service";

// ─── Supported order statuses ──────────────────────────
export type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const VALID_STATUSES: OrderStatus[] = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
const VALID_PAYMENT_STATUSES = ["UNPAID", "PAID", "VERIFIED", "REFUNDED"];

const orderController = {
  /** POST /api/orders — Gumawa ng bagong order (buyer) */
  createOrder: async (req: Request, res: Response): Promise<void> => {
    const { items, paymentMethod, shippingAddress } = req.body;
    const userId = req.user!.id;

    // ✅ Validation: Dapat may items
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Order must contain at least one item",
      });
      return;
    }

    // ✅ Validation: Bawat item ay dapat may productId at quantity
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        res.status(400).json({
          success: false,
          statusCode: 400,
          message: "Each item must have a valid productId and quantity (minimum 1)",
        });
        return;
      }
    }

    // ✅ Validation: Payment method dapat COD, GCASH, o CARD
    if (paymentMethod && !["COD", "GCASH", "CARD"].includes(paymentMethod)) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Payment method must be COD, GCASH, or CARD",
      });
      return;
    }

    // ✅ Validation: Shipping address required for GCASH
    if (paymentMethod === "GCASH" && !shippingAddress) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Shipping address is required for GCASH payments",
      });
      return;
    }

    try {
      const newOrder = await OrderService.createOrder({
        userId,
        items,
        paymentMethod,
        shippingAddress,
      });

      res.status(201).json({
        success: true,
        data: newOrder,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: error.message || "Failed to create order",
      });
    }
  },

  /** GET /api/orders — Kunin ang lahat ng orders (admin) */
  getOrders: async (_req: Request, res: Response): Promise<void> => {
    const orders = await OrderService.getOrders();

    res.json({
      success: true,
      data: orders,
    });
  },

  /** GET /api/orders/my-orders — Kunin ang orders ng current user (buyer) */
  getMyOrders: async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const orders = await OrderService.getUserOrders(userId);

    res.json({
      success: true,
      data: orders,
    });
  },

  /** GET /api/orders/:id — Kunin ang isang order */
  getOrderById: async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const order = await OrderService.getOrderById(id);

    if (!order) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: `Order with ID ${id} not found`,
      });
      return;
    }

    // ✅ Security: Buyer ay makikita lang ang sarili niyang order
    if (userRole !== "ADMIN" && order.userId !== userId) {
      res.status(403).json({
        success: false,
        statusCode: 403,
        message: "Access denied. You can only view your own orders.",
      });
      return;
    }

    res.json({
      success: true,
      data: order,
    });
  },

  /** PUT /api/orders/:id/status — I-update ang status ng order (admin) */
  updateOrderStatus: async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const { status } = req.body;

    // ✅ Validation: Dapat valid ang status
    if (!status || !VALID_STATUSES.includes(status)) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      });
      return;
    }

    const updatedOrder = await OrderService.updateOrderStatus(id, status);

    if (!updatedOrder) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: `Order with ID ${id} not found`,
      });
      return;
    }

    res.json({
      success: true,
      data: updatedOrder,
    });
  },

  /** PUT /api/orders/:id/payment — I-update ang payment status (admin) */
  updatePaymentStatus: async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const { paymentStatus, paymentRef } = req.body;

    if (!paymentStatus || !VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: `Invalid payment status. Must be one of: ${VALID_PAYMENT_STATUSES.join(", ")}`,
      });
      return;
    }

    const updatedOrder = await OrderService.updatePaymentStatus(id, paymentStatus, paymentRef);

    if (!updatedOrder) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: `Order with ID ${id} not found`,
      });
      return;
    }

    res.json({
      success: true,
      data: updatedOrder,
    });
  },

  /** PUT /api/orders/:id/payment-ref — Buyer magbigay ng GCash ref number */
  updatePaymentRef: async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const userId = req.user!.id;
    const { paymentRef } = req.body;

    if (!paymentRef || paymentRef.trim().length === 0) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Payment reference number is required",
      });
      return;
    }

    const updatedOrder = await OrderService.updatePaymentRef(id, userId, paymentRef.trim());

    if (!updatedOrder) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Unable to update payment. Make sure this is a GCASH order and belongs to you.",
      });
      return;
    }

    res.json({
      success: true,
      data: updatedOrder,
    });
  },

  /** GET /api/orders/sales-summary — Sales stats para sa admin dashboard */
  getSalesSummary: async (_req: Request, res: Response): Promise<void> => {
    const summary = await OrderService.getSalesSummary();

    res.json({
      success: true,
      data: summary,
    });
  },

  /** DELETE /api/orders/:id — Burahin ang order (admin) */
  deleteOrder: async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);

    const deletedOrder = await OrderService.deleteOrder(id);

    if (!deletedOrder) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: `Order with ID ${id} not found`,
      });
      return;
    }

    res.json({
      success: true,
      data: deletedOrder,
    });
  },
};

export default orderController;
