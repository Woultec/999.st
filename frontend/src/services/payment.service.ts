// ─── Payment Service — PayMongo Frontend Integration ─────
// 📌 Ito ang tawag ng frontend sa ating backend para sa PayMongo payments
//    Pati na rin ang PayMongo.js para sa secure card form

import api from "./api";
import type { Order } from "../types";

/** Create Payment Intent — tawag sa backend para gumawa ng PayMongo PaymentIntent */
export async function createPaymentIntent(orderId: number) {
  const response = await api.post<{
    success: boolean;
    data: {
      clientKey: string;
      intentId: string;
      amount: number;
      status: string;
      nextAction: { type: string; redirect: { url: string } } | null;
    };
  }>("/payments/create-intent", { orderId });
  return response.data;
}

/** Get Payment Intent Status — check status ng payment */
export async function getIntentStatus(orderId: number) {
  const response = await api.get<{
    success: boolean;
    data: {
      intentId?: string;
      status: string;
      nextAction: { type: string; redirect: { url: string } } | null;
      paymentStatus: string;
    };
  }>(`/payments/intent/${orderId}`);
  return response.data;
}

// ─── PayMongo.js Helper ─────────────────────────────────
// 📌 Ito ang function na mag-la-load ng PayMongo.js sa browser

declare global {
  interface Window {
    PayMongo: {
      init: (publicKey: string) => {
        createPaymentMethod: (data: {
          type: "card";
          details: {
            cardNumber: string;
            expMonth: number;
            expYear: number;
            cvc: string;
          };
        }) => Promise<{
          id: string;
          type: "payment_method";
          attributes: {
            livemode: boolean;
            created_at: number;
            updated_at: number;
          };
        }>;
      };
    };
    paymongoClient?: ReturnType<typeof initPayMongoClient>;
  }
}

// Public key — gagamitin sa frontend (safe ilantad)
// Default: test key (palitan kapag nasa production na)
const PAYMONGO_PUBLIC_KEY =
  import.meta.env.VITE_PAYMONGO_PUBLIC_KEY || "pk_test_xxxxxxxxxxxxx";

/** Load PayMongo.js script */
export function loadPayMongoScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById("paymongo-js")) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = "paymongo-js";
    script.src = "https://js.paymongo.com/v1/paymongo.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load PayMongo.js"));
    document.head.appendChild(script);
  });
}

/** Initialize PayMongo client */
function initPayMongoClient() {
  if (!window.PayMongo) {
    throw new Error("PayMongo.js not loaded");
  }
  return window.PayMongo.init(PAYMONGO_PUBLIC_KEY);
}

/** Get or create PayMongo client */
export function getPayMongoClient() {
  if (!window.paymongoClient) {
    window.paymongoClient = initPayMongoClient();
  }
  return window.paymongoClient;
}

/** Create a PaymentMethod from card details */
export async function createCardPaymentMethod(data: {
  cardNumber: string;
  expMonth: number;
  expYear: number;
  cvc: string;
}) {
  if (!window.paymongoClient) {
    getPayMongoClient();
  }

  const result = await window.paymongoClient!.createPaymentMethod({
    type: "card",
    details: {
      cardNumber: data.cardNumber,
      expMonth: data.expMonth,
      expYear: data.expYear,
      cvc: data.cvc,
    },
  });

  return result;
}

/** Attach PaymentMethod to PaymentIntent via PayMongo API */
export async function attachPaymentIntent(
  intentId: string,
  paymentMethodId: string,
  clientKey: string
) {
  const response = await fetch(
    `https://api.paymongo.com/v1/payment_intents/${intentId}/attach`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        data: {
          attributes: {
            payment_method: paymentMethodId,
            client_key: clientKey,
          },
        },
      }),
    }
  );

  const result = await response.json();
  return result.data;
}
