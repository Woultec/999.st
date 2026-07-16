import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderById, updatePaymentRef } from "../../services/order.service";
import { createPaymentIntent, getIntentStatus } from "../../services/payment.service";
import { getActivePaymentSettings } from "../../services/paymentSetting.service";
import { useAuth } from "../../contexts/AuthContext";
import type { Order, PaymentSetting } from "../../types";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const paymentStatusColors: Record<string, string> = {
  UNPAID: "bg-yellow-100 text-yellow-800",
  PAID: "bg-blue-100 text-blue-800",
  VERIFIED: "bg-green-100 text-green-800",
  REFUNDED: "bg-red-100 text-red-800",
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gcashRef, setGcashRef] = useState("");
  const [isSubmittingRef, setIsSubmittingRef] = useState(false);
  const [refMsg, setRefMsg] = useState<string | null>(null);
  const [isProcessingCard, setIsProcessingCard] = useState(false);
  const [cardMsg, setCardMsg] = useState<string | null>(null);
  const [ewallets, setEwallets] = useState<PaymentSetting[]>([]);

  useEffect(() => {
    // Load active e-wallets
    getActivePaymentSettings()
      .then((res) => setEwallets(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function loadOrder() {
      try {
        const response = await getOrderById(Number(id));
        setOrder(response.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load order");
      } finally {
        setIsLoading(false);
      }
    }
    if (id) loadOrder();
  }, [id]);

  async function handleSubmitGcashRef() {
    if (!gcashRef.trim() || !order) return;

    setIsSubmittingRef(true);
    setRefMsg(null);
    try {
      const response = await updatePaymentRef(order.id, gcashRef.trim());
      setOrder(response.data);
      setRefMsg("Payment reference submitted! Waiting for admin verification. ✅");
      setGcashRef("");
    } catch (err: any) {
      setRefMsg(err?.response?.data?.message || "Failed to submit reference");
    } finally {
      setIsSubmittingRef(false);
    }
  }

  async function handlePayWithCard() {
    if (!order) return;
    setIsProcessingCard(true);
    setCardMsg(null);

    try {
      setCardMsg("⏳ Creating secure payment session...");

      // Gumawa ng PaymentIntent via backend
      const intentResponse = await createPaymentIntent(order.id);
      const { clientKey, intentId, nextAction } = intentResponse.data;

      // Kung may 3D Secure redirect
      if (nextAction?.redirect?.url) {
        setCardMsg("↪️ Redirecting to 3D Secure verification...");
        // I-save sa sessionStorage para pagbalik, malalaman natin
        sessionStorage.setItem("paymongo_order_id", order.id.toString());
        sessionStorage.setItem("paymongo_intent_id", intentId);
        // Redirect sa 3D Secure page
        window.location.href = nextAction.redirect.url;
        return;
      }

      // Kung hindi kailangan ng 3DS, i-reload na lang ang order status
      setCardMsg("✅ Redirecting to secure payment form...");

      // Redirect sa PayMongo hosted checkout dahil mas secure
      window.location.href = `https://paymongo.com/payment/${intentId}/${clientKey}`;
    } catch (err: any) {
      setCardMsg(
        err?.response?.data?.message ||
          "❌ Failed to process payment. Please try again."
      );
    } finally {
      setIsProcessingCard(false);
    }
  }

  // ─── Check kung galing sa 3D Secure redirect ────────────
  useEffect(() => {
    const pendingOrderId = sessionStorage.getItem("paymongo_order_id");
    if (pendingOrderId && id && pendingOrderId === id) {
      // I-check ang payment status
      getIntentStatus(Number(id))
        .then((response) => {
          if (response.data.paymentStatus === "PAID") {
            // I-reload ang order para makita ang updated status
            getOrderById(Number(id)).then((res) => {
              setOrder(res.data);
              setCardMsg("🎉 Payment successful! Thank you for your order.");
            });
          }
        })
        .catch(() => {
          // Ignore errors sa redirect check
        })
        .finally(() => {
          sessionStorage.removeItem("paymongo_order_id");
          sessionStorage.removeItem("paymongo_intent_id");
        });
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Order not found
        </h2>
        <p className="text-gray-500 mb-6">{error || "This order doesn't exist."}</p>
        <Link to="/profile" className="text-blue-600 hover:text-blue-700 font-medium">
          ← Back to My Orders
        </Link>
      </div>
    );
  }

  const isBuyer = user?.role === "BUYER";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
      {/* Back link */}
      <Link
        to={isBuyer ? "/profile" : "/admin"}
        className="text-sm text-gray-500 hover:text-gray-700 transition-colors mb-6 inline-block"
      >
        ← Back to {isBuyer ? "My Orders" : "Admin Dashboard"}
      </Link>

      {/* Order Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order.id}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-PH", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="flex gap-2">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                statusColors[order.status] || "bg-gray-100 text-gray-800"
              }`}
            >
              {order.status}
            </span>
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                paymentStatusColors[order.paymentStatus] || "bg-gray-100 text-gray-800"
              }`}
            >
              {order.paymentStatus === "UNPAID"
                ? "Unpaid"
                : order.paymentStatus === "PAID"
                ? "Paid"
                : order.paymentStatus === "VERIFIED"
                ? "Verified"
                : "Refunded"}
            </span>
          </div>
        </div>

        {/* Order Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Payment</p>
            <p className="font-semibold text-gray-900 mt-0.5">
              {order.paymentMethod === "GCASH"
                ? "📱 GCash"
                : order.paymentMethod === "CARD"
                ? "💳 Card (PayMongo)"
                : "💵 Cash on Delivery"}
            </p>
          </div>
          {order.shippingAddress && (
            <div className="col-span-2 sm:col-span-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Shipping</p>
              <p className="text-sm text-gray-900 mt-0.5">{order.shippingAddress}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">
              ₱{order.totalPrice?.toLocaleString() || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Items</h2>
        <div className="divide-y divide-gray-100">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {item.product?.name || `Product #${item.productId}`}
                </p>
                <p className="text-sm text-gray-500">
                  ₱{item.price.toLocaleString()} × {item.quantity}
                </p>
              </div>
              <p className="font-semibold text-gray-900 ml-4">
                ₱{(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-200">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="text-xl font-bold text-gray-900">
            ₱{order.totalPrice?.toLocaleString() || 0}
          </span>
        </div>
      </div>

      {/* GCash Payment Section (Buyer only) */}
      {isBuyer && order.paymentMethod === "GCASH" && order.paymentStatus === "UNPAID" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            📱 Pay via GCash
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Send payment to our GCash number and enter the reference number below.
          </p>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-4">
            <p className="text-sm font-medium text-blue-800 mb-2">Send Payment To:</p>
            {ewallets.length > 0 ? ewallets.map((wallet) => (
              <div key={wallet.id} className="flex items-center gap-3 py-1.5 first:pt-0 last:pb-0">
                <span className="text-2xl">{wallet.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-blue-900">{wallet.name}</p>
                  <p className="text-lg font-bold text-blue-900">{wallet.number.replace(/(\d{4})(?=\d)/g, "$1 ")}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-blue-900 font-semibold">Loading...</p>
            )}
            <p className="text-xs text-blue-700 mt-2">
              Amount to pay: <strong>₱{order.totalPrice?.toLocaleString() || 0}</strong>
            </p>
          </div>

          {refMsg && (
            <div
              className={`mb-4 p-3 rounded-xl text-sm ${
                refMsg.includes("✅")
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-red-50 border border-red-200 text-red-600"
              }`}
            >
              {refMsg}
            </div>
          )}

          <div className="flex gap-3">
            <input
              type="text"
              value={gcashRef}
              onChange={(e) => setGcashRef(e.target.value)}
              placeholder="Enter GCash reference number"
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
            <button
              onClick={handleSubmitGcashRef}
              disabled={isSubmittingRef || !gcashRef.trim()}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmittingRef ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </div>
      )}

      {/* CARD Payment Section (Buyer only) */}
      {isBuyer && order.paymentMethod === "CARD" && order.paymentStatus === "UNPAID" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            💳 Pay via Credit/Debit Card
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Click the button below to proceed to our secure payment page.
            Your payment will be processed securely via PayMongo.
          </p>

          {cardMsg && (
            <div
              className={`mb-4 p-3 rounded-xl text-sm ${
                cardMsg.includes("✅") || cardMsg.includes("🎉")
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : cardMsg.includes("redirect")
                  ? "bg-blue-50 border border-blue-200 text-blue-700"
                  : "bg-red-50 border border-red-200 text-red-600"
              }`}
            >
              {cardMsg}
            </div>
          )}

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl mb-4">
            <p className="text-sm font-medium text-purple-800 mb-1">
              🔒 Secured by PayMongo
            </p>
            <p className="text-xs text-purple-700 leading-relaxed">
              Your card details are encrypted and processed securely. We do
              not store your card information on our servers.
            </p>
          </div>

          <button
            onClick={handlePayWithCard}
            disabled={isProcessingCard}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessingCard ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ₱${order.totalPrice?.toLocaleString() || 0} via Card`
            )}
          </button>

          <p className="text-xs text-gray-400 mt-3 text-center">
            You will be redirected to complete 3D Secure verification if required.
          </p>
        </div>
      )}

      {/* Payment Reference Info */}
      {order.paymentRef && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            💳 Payment Details
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Reference #</p>
              <p className="font-mono text-sm font-semibold text-gray-900 mt-0.5">
                {order.paymentRef}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
              <span
                className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  paymentStatusColors[order.paymentStatus] || "bg-gray-100 text-gray-800"
                }`}
              >
                {order.paymentStatus}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
