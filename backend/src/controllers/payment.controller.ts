// ─── Payment Controller — PayMongo Payment Flow ──────────
// 📌 CONTROLLER LAYER — humahawak ng payment-related requests
//
// Payment Flow (CARD):
//   1. Buyer places order → POST /api/payments/create-intent
//   2. Backend creates PaymentIntent sa PayMongo
//   3. Frontend displays PayMongo.js card form
//   4. Buyer fills card details → PaymentMethod created
//   5. Frontend attaches PaymentMethod to PaymentIntent
//   6. PayMongo sends webhook → Backend updates order status

import type { Request, Response } from "express";
import prisma from "../prisma/client";
import * as PayMongoService from "../services/paymongo.service";

const paymentController = {
  /** POST /api/payments/create-intent — Gumawa ng PaymentIntent para sa order */
  createIntent: async (req: Request, res: Response): Promise<void> => {
    const { orderId } = req.body;
    const userId = req.user!.id;

    if (!orderId) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Order ID is required",
      });
      return;
    }

    try {
      // Kunin ang order at i-verify na sa user ito
      const order = await prisma.order.findUnique({
        where: { id: Number(orderId) },
      });

      if (!order) {
        res.status(404).json({
          success: false,
          statusCode: 404,
          message: "Order not found",
        });
        return;
      }

      if (order.userId !== userId) {
        res.status(403).json({
          success: false,
          statusCode: 403,
          message: "This order does not belong to you",
        });
        return;
      }

      if (order.paymentMethod !== "CARD") {
        res.status(400).json({
          success: false,
          statusCode: 400,
          message: "This order is not set for card payment",
        });
        return;
      }

      // Kung may existing intent na, i-reuse na lang
      if (order.paymongoIntentId) {
        const existingIntent = await PayMongoService.retrievePaymentIntent(
          order.paymongoIntentId
        );

        res.json({
          success: true,
          data: {
            clientKey: existingIntent.attributes.client_key,
            intentId: existingIntent.id,
            amount: existingIntent.attributes.amount,
            status: existingIntent.attributes.status,
            nextAction: existingIntent.attributes.next_action,
          },
        });
        return;
      }

      // Gumawa ng PaymentIntent via PayMongo
      // I-convert ang amount sa centavos (₱100 = 10000)
      const amountInCentavos = Math.round(order.totalPrice * 100);

      const intent = await PayMongoService.createPaymentIntent({
        amount: amountInCentavos,
        description: `Order #${order.id} - 999.st`,
        orderId: order.id,
      });

      // I-save ang PayMongo Intent ID sa order
      await prisma.order.update({
        where: { id: order.id },
        data: { paymongoIntentId: intent.id },
      });

      res.json({
        success: true,
        data: {
          clientKey: intent.attributes.client_key,
          intentId: intent.id,
          amount: intent.attributes.amount,
          status: intent.attributes.status,
          nextAction: intent.attributes.next_action,
        },
      });
    } catch (error: any) {
      console.error("❌ PayMongo createIntent error:", error.message);
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: error.message || "Failed to create payment intent",
      });
    }
  },

  /** POST /api/payments/webhook — Tanggapin ang webhook from PayMongo */
  handleWebhook: async (req: Request, res: Response): Promise<void> => {
    try {
      const event = req.body as PayMongoService.PayMongoWebhookEvent;
      const signature = req.headers["paymongo-signature"] as string;
      const rawBody = (req as any).rawBody as string;
      const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;

      // ✅ I-verify ang signature (kung may webhook secret)
      if (webhookSecret && signature && rawBody) {
        const isValid = PayMongoService.verifyWebhookSignature(
          rawBody,
          signature,
          webhookSecret
        );
        if (!isValid) {
          console.warn("⚠️ Invalid webhook signature — possible fake request!");
          res.status(401).json({ received: false });
          return;
        }
      }

      // I-process ang event
      const { type, data } = event;

      console.log(`📨 PayMongo webhook received: ${type}`);

      if (type === "payment.paid") {
        // Hanapin ang order gamit ang metadata
        const orderId = data.attributes.metadata?.order_id;
        if (orderId) {
          await prisma.order.update({
            where: { id: Number(orderId) },
            data: {
              paymentStatus: "PAID",
              paymentRef: data.id, // I-save ang PayMongo payment ID
            },
          });
          console.log(`✅ Order #${orderId} marked as PAID via PayMongo`);
        }
      } else if (type === "payment.failed") {
        const orderId = data.attributes.metadata?.order_id;
        if (orderId) {
          console.log(`❌ Payment failed for Order #${orderId}`);
        }
      }

      // ✅ Dapat laging mag-respond ng 200 para hindi i-retry ni PayMongo
      res.json({ received: true });
    } catch (error: any) {
      console.error("❌ Webhook error:", error.message);
      res.status(500).json({ received: false, error: error.message });
    }
  },

  /** GET /api/payments/intent/:orderId — Kunin ang status ng payment intent */
  getIntentStatus: async (req: Request, res: Response): Promise<void> => {
    const { orderId } = req.params;
    const userId = req.user!.id;

    try {
      const order = await prisma.order.findUnique({
        where: { id: Number(orderId) },
      });

      if (!order) {
        res.status(404).json({ success: false, message: "Order not found" });
        return;
      }

      if (order.userId !== userId && req.user!.role !== "ADMIN") {
        res.status(403).json({ success: false, message: "Access denied" });
        return;
      }

      if (!order.paymongoIntentId) {
        res.json({
          success: true,
          data: { status: "no_intent", paymentStatus: order.paymentStatus },
        });
        return;
      }

      const intent = await PayMongoService.retrievePaymentIntent(
        order.paymongoIntentId
      );

      res.json({
        success: true,
        data: {
          intentId: intent.id,
          status: intent.attributes.status,
          nextAction: intent.attributes.next_action,
          paymentStatus: order.paymentStatus,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to retrieve intent status",
      });
    }
  },
};

export default paymentController;
