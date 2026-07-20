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

const PAYMONGO_V1_API = "https://api.paymongo.com/v1";
const PAYMONGO_V2_API = "https://api.paymongo.com/v2";

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

// 📌 Checkout Session — ang gamit natin para sa GCash/Maya/Card hosted payment page!
export interface CheckoutSession {
  id: string;
  type: "checkout_session";
  attributes: {
    checkout_url: string;       // 👉 Ito ang iri-redirect ng buyer!
    reference_number: string;
    status: string;
    payment_intent: {
      id: string;
    } | null;
    payments: {
      id: string;
      attributes: {
        status: string;         // "paid", "failed"
        paid_at: string | null;
      };
    }[];
    metadata: {
      order_id?: string;
    };
    created_at: number;
    updated_at: number;
  };
}

export interface PayMongoWebhookEvent {
  type: string;              // "payment.paid", "payment.failed", "checkout_session.payment.paid"
  data: {
    id: string;
    type: string;
    attributes: {
      amount?: number;
      currency?: string;
      status?: string;
      reference_number?: string;
      checkout_url?: string;
      metadata: {
        order_id?: string;   // 👉 Ito ang link sa Order natin!
      };
      payments?: {
        id: string;
        attributes: {
          status: string;
          amount: number;
          paid_at: string | null;
        };
      }[];
    };
  };
}

// ─── 1. Create Checkout Session (v2) ─────────────────────
// 📌 ITO ANG GAGAMITIN NATIN! 🎉
//    Sa halip na manual GCash (type ref #) o complex PaymentIntent flow,
//    gagawa tayo ng Checkout Session — may GCash QR, Maya, at Card na!
//
//    Ang buyer ay iri-redirect sa PayMongo hosted checkout page →
//    Pumili ng payment method → Magbayad → Auto-redirect sa order page
//    Webhook ang bahala mag-update ng order status to PAID!
//
//    API: POST https://api.paymongo.com/v2/checkout_sessions

export async function createCheckoutSession(params: {
  lineItems: Array<{
    name: string;
    amount: number;        // In centavos (e.g., 59900 for ₱599)
    currency?: string;
    quantity: number;
  }>;
  paymentMethodTypes?: string[];  // ["gcash", "card", "paymaya"]
  orderId: number;
  successUrl: string;
  cancelUrl: string;
}): Promise<CheckoutSession> {
  const response = await fetch(`${PAYMONGO_V2_API}/checkout_sessions`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      data: {
        attributes: {
          line_items: params.lineItems,
          payment_method_types: params.paymentMethodTypes || ["gcash", "card"],
          success_url: params.successUrl,
          cancel_url: params.cancelUrl,
          reference_number: `ORDER-${params.orderId}`,
          metadata: {
            order_id: params.orderId.toString(),
          },
          send_email_receipt: false,
        },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PayMongo Checkout Session error: ${error}`);
  }

  const result = (await response.json()) as PayMongoResponse<CheckoutSession>;
  return result.data;
}

// ─── 2. Create Payment Intent ────────────────────────────
// 📌 Tawag ito mula sa backend pagkatapos gumawa ng Order
//    Amount = totalPrice × 100 (kasi centavos ang gamit ni PayMongo)

export async function createPaymentIntent(params: {
  amount: number;        // In centavos (e.g., 59900 for ₱599)
  currency?: string;
  description?: string;
  orderId: number;
}): Promise<PayMongoPaymentIntent> {
  const response = await fetch(`${PAYMONGO_V1_API}/payment_intents`, {
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
  const response = await fetch(`${PAYMONGO_V1_API}/payment_intents/${intentId}`, {
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
