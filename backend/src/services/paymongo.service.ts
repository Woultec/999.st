// ─── PayMongo Service — Payment Gateway API ──────────────
// 📌 Ito ang kausap ng PayMongo API para sa Visa/Mastercard payments
//    May 3-step flow:
//    1. Backend: Create PaymentIntent (amount, currency)
//    2. Frontend: Collect card details via PayMongo.js → create PaymentMethod
//    3. Frontend: Attach PaymentMethod to PaymentIntent
//
// ⚠️ Kailangan ng PAYMONGO_SECRET_KEY sa .env!
//    Kunin sa https://dashboard.paymongo.com/settings/keys

import crypto from "crypto";

const PAYMONGO_API = "https://api.paymongo.com/v1";

function getSecretKey(): string {
  const key = process.env.PAYMONGO_SECRET_KEY;
  if (!key) {
    throw new Error("PAYMONGO_SECRET_KEY is not set in environment");
  }
  return key;
}

function getHeaders() {
  return {
    Authorization: `Basic ${Buffer.from(getSecretKey() + ":").toString("base64")}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

// ─── Interfaces ──────────────────────────────────────────

// 📌 Shape ng response ng PayMongo API
interface PayMongoResponse<T> {
  data: T;
}

export interface PayMongoPaymentIntent {
  id: string;
  type: "payment_intent";
  attributes: {
    amount: number;          // In centavos (₱100 = 10000)
    currency: string;        // "PHP"
    status: string;          // "awaiting_payment_method", "awaiting_next_action", "processing", "succeeded", "failed"
    client_key: string;      // 👉 Ipapasa sa frontend
    payment_method_allowed: string[];
    next_action: {
      type: string;
      redirect: {
        url: string;         // 👉 3D Secure redirect URL (kung kailangan)
      };
    } | null;
    payments: {
      id: string;
      attributes: {
        status: string;      // "paid", "failed"
        paid_at: string | null;
      };
    }[];
    metadata: Record<string, any>;
    created_at: number;
    updated_at: number;
  };
}

export interface PayMongoWebhookEvent {
  type: string;              // "payment.paid", "payment.failed"
  data: {
    id: string;
    type: string;
    attributes: {
      amount: number;
      currency: string;
      status: string;
      metadata: {
        order_id?: string;   // 👉 Ito ang link sa Order natin!
      };
    };
  };
}

// ─── 1. Create Payment Intent ────────────────────────────
// 📌 Tawag ito mula sa backend pagkatapos gumawa ng Order
//    Amount = totalPrice × 100 (kasi centavos ang gamit ni PayMongo)

export async function createPaymentIntent(params: {
  amount: number;        // In centavos (e.g., 59900 for ₱599)
  currency?: string;
  description?: string;
  orderId: number;
}): Promise<PayMongoPaymentIntent> {
  const response = await fetch(`${PAYMONGO_API}/payment_intents`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      data: {
        attributes: {
          amount: params.amount,
          currency: params.currency || "PHP",
          payment_method_allowed: ["card"],
          description: params.description || `Order #${params.orderId} - 999.st`,
          metadata: {
            order_id: params.orderId.toString(),
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PayMongo API error: ${error}`);
  }

  const result = (await response.json()) as PayMongoResponse<PayMongoPaymentIntent>;
  return result.data;
}

// ─── 2. Retrieve Payment Intent ──────────────────────────
// 📌 Para ma-check ang status ng payment

export async function retrievePaymentIntent(
  intentId: string
): Promise<PayMongoPaymentIntent> {
  const response = await fetch(`${PAYMONGO_API}/payment_intents/${intentId}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PayMongo retrieve error: ${error}`);
  }

  const result = (await response.json()) as PayMongoResponse<PayMongoPaymentIntent>;
  return result.data;
}

// ─── 3. Verify Webhook Signature ─────────────────────────
// 📌 Para siguraduhin na galing sa PayMongo ang webhook (hindi hacker!)

export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  webhookSecret: string
): boolean {
  try {
    // Parse ang signature header: "t=...,te=...,li=..."
    const parts = signature.split(",");
    const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2) || "";
    const testSig = parts.find((p) => p.startsWith("te="))?.slice(3) || "";
    const liveSig = parts.find((p) => p.startsWith("li="))?.slice(3) || "";

    // Compute HMAC: timestamp + "." + rawBody
    const signedPayload = `${timestamp}.${rawBody}`;
    const expected = crypto
      .createHmac("sha256", webhookSecret)
      .update(signedPayload)
      .digest("hex");

    // Compare (constant-time comparison para iwas timing attack)
    const sigToCheck = testSig || liveSig;
    if (!sigToCheck) return false;

    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(sigToCheck)
    );
  } catch {
    return false;
  }
}
