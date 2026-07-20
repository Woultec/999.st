import { useState, useEffect, useRef } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { getOrderById } from "../../services/order.service";
import { createCheckoutSession } from "../../services/payment.service";
import { useAuth } from "../../contexts/AuthContext";
import type { Order } from "../../types";

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
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [payMsg, setPayMsg] = useState<string | null>(null);
  const [isWaitingForPayment, setIsWaitingForPayment] = useState(false);

  // ─── Check kung galing sa PayMongo redirect ─────────────
  const paymentStatus = searchParams.get("payment");
  const isPaymentSuccess = paymentStatus === "success";
  const isPaymentCancelled = paymentStatus === "cancelled";

  // ─── Polling: kapag galing sa PayMongo, hintayin ang webhook ──
  const pollCountRef = useRef(0);

  useEffect(() => {
    async function loadOrder() {
      try {
        const response = await getOrderById(Number(id));
        setOrder(response.data);

        // Kapag galing sa successful payment pero hindi pa PAID ang status
        // Ibig sabihin hindi pa nag-fifire ang webhook — mag-poll tayo!
        if (isPaymentSuccess && response.data.paymentStatus !== "PAID") {
          setIsWaitingForPayment(true);
          startPolling(Number(id));
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load order");
      } finally {
        setIsLoading(false);
      }
    }

    function startPolling(orderId: number) {
      pollCountRef.current = 0;
      const interval = setInterval(async () => {
        pollCountRef.current++;
        // Stop after 15 tries (30 seconds)
        if (pollCountRef.current > 15) {
          clearInterval(interval);
          setIsWaitingForPayment(false);
          return;
        }

        try {
          const res = await getOrderById(orderId);
          if (res.data.paymentStatus === "PAID") {
            setOrder(res.data);
            setIsWaitingForPayment(false);
            clearInterval(interval);
          }
        } catch {
          // Ignore polling errors
        }
      }, 2000); // Every 2 seconds
    }

    if (id) loadOrder();

    return () => {
      pollCountRef.current = 999; // Stop polling on unmount
    };
  }, [id]);

  // 🚀 NEW: Unified Pay Now via PayMongo Checkout Session!
  async function handlePayNow() {
    if (!order) return;
    setIsProcessing(true);
    setPayMsg(null);

    try {
      setPayMsg("⏳ Creating secure checkout session...");

      // Gumawa ng Checkout Session via backend
      const response = await createCheckoutSession(order.id);
      const { checkoutUrl } = response.data;

      // Redirect sa PayMongo hosted checkout page!
      // May GCash QR, Maya, Card UI na — si PayMongo na bahala!
      window.location.href = checkoutUrl;
    } catch (err: any) {
      setPayMsg(
        err?.response?.data?.message ||
          "❌ Failed to create payment session. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  }

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

      {/* 🚀 UNIFIED PAYMENT SECTION — PayMongo Checkout Session */}
      {/* Gumagana ito para sa GCASH at CARD orders — same button! */}
      {isBuyer && (order.paymentMethod === "GCASH" || order.paymentMethod === "CARD") && order.paymentStatus === "UNPAID" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {order.paymentMethod === "GCASH" ? "📱" : "💳"} Complete Your Payment
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Click the button below to proceed to our secure checkout page.
            You can pay using any of the following methods:
          </p>

          {/* Payment method icons */}
          <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📱</span>
              <span className="text-sm font-medium text-gray-700">GCash</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔵</span>
              <span className="text-sm font-medium text-gray-700">Maya</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💳</span>
              <span className="text-sm font-medium text-gray-700">Card</span>
            </div>
          </div>

          {/* Payment amount */}
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-800 mb-1">
              Amount to pay:
            </p>
            <p className="text-2xl font-bold text-blue-900">
              ₱{order.totalPrice?.toLocaleString() || 0}
            </p>
          </div>

          {payMsg && (
            <div
              className={`mb-4 p-3 rounded-xl text-sm ${
                payMsg.includes("🎉")
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : payMsg.includes("⏳")
                  ? "bg-blue-50 border border-blue-200 text-blue-700"
                  : "bg-red-50 border border-red-200 text-red-600"
              }`}
            >
              {payMsg}
            </div>
          )}

          <button
            onClick={handlePayNow}
            disabled={isProcessing}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating secure session...
              </>
            ) : (
              <>
                <span>🔒</span>
                Pay ₱{order.totalPrice?.toLocaleString() || 0}
              </>
            )}
          </button>

          <p className="text-xs text-gray-400 mt-3 text-center">
            🔐 Secured by PayMongo. Your payment details are encrypted.
            You will be redirected to a secure checkout page.
          </p>
        </div>
      )}

      {/* ✅ Payment Success Message */}
      {isPaymentSuccess && order?.paymentStatus === "PAID" && (
        <div className="bg-white rounded-2xl shadow-sm border border-green-200 p-6 mb-6">
          <div className="text-center">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Payment Successful!
            </h2>
            <p className="text-sm text-gray-600">
              Thank you for your order! Your payment has been confirmed.
            </p>
          </div>
        </div>
      )}

      {/* ⏳ Waiting for Payment Confirmation */}
      {isWaitingForPayment && (
        <div className="bg-white rounded-2xl shadow-sm border border-yellow-200 p-6 mb-6">
          <div className="text-center">
            <div className="mb-3 flex justify-center">
              <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Confirming Your Payment...
            </h2>
            <p className="text-sm text-gray-600">
              We're waiting for payment confirmation. This usually takes a few seconds.
              Please don't close this page.
            </p>
          </div>
        </div>
      )}

      {/* 😅 Payment Cancelled Message */}
      {isPaymentCancelled && (
        <div className="bg-white rounded-2xl shadow-sm border border-yellow-200 p-6 mb-6">
          <div className="text-center">
            <div className="text-5xl mb-3">😅</div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Payment Cancelled
            </h2>
            <p className="text-sm text-gray-600">
              You cancelled the payment. You can try again whenever you're ready!
            </p>
          </div>
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
