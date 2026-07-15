import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderById, updatePaymentRef } from "../../services/order.service";
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
  const { user } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gcashRef, setGcashRef] = useState("");
  const [isSubmittingRef, setIsSubmittingRef] = useState(false);
  const [refMsg, setRefMsg] = useState<string | null>(null);

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
              {order.paymentMethod === "GCASH" ? "📱 GCash" : "💵 Cash on Delivery"}
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
            <p className="text-sm font-medium text-blue-800">GCash Number:</p>
            <p className="text-lg font-bold text-blue-900">0917 123 4567</p>
            <p className="text-xs text-blue-700 mt-1">
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
