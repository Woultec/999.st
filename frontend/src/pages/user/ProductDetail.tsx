import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProductById } from "../../services/product.service";
import { createOrder } from "../../services/order.service";
import { useAuth } from "../../contexts/AuthContext";
import type { Product } from "../../types";

const PLACEHOLDER_IMAGE = "https://placehold.co/600x600/e2e8f0/64748b?text=999.st";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Payment & shipping state
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "GCASH" | "CARD">("COD");
  const [shippingAddress, setShippingAddress] = useState("");
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const response = await getProductById(Number(id));
        setProduct(response.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load product");
      } finally {
        setIsLoading(false);
      }
    }
    if (id) loadProduct();
  }, [id]);

  async function handleBuyNow() {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    // Show checkout form with payment options
    setShowCheckoutForm(true);
    setError(null);
  }

  async function handlePlaceOrder() {
    if (!product) return;

    setIsAdding(true);
    setError(null);
    try {
      const response = await createOrder({
        items: [{ productId: Number(id), quantity }],
        paymentMethod,
        shippingAddress: paymentMethod === "GCASH" || paymentMethod === "CARD" ? shippingAddress : undefined,
      });
      const orderId = response.data.id;
      setSuccessMsg("Order placed successfully! 🎉");
      setShowCheckoutForm(false);

      // Redirect to order detail page after 1.5s
      setTimeout(() => {
        navigate(`/order/${orderId}`);
      }, 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to place order");
    } finally {
      setIsAdding(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Product not found
        </h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <Link
          to="/"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to products
        </Link>
      </div>
    );
  }

  if (!product) return null;

  const formattedPrice = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(product.price);

  const totalFormatted = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(product.price * quantity);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-blue-600 transition-colors">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Product Image */}
        <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
          <img
            src={product.imageUrl || PLACEHOLDER_IMAGE}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {product.name}
          </h1>
          <p className="text-3xl font-bold text-gray-900 mb-6">
            {formattedPrice}
          </p>
          <p className="text-gray-600 leading-relaxed mb-8">
            {product.description}
          </p>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                −
              </button>
              <span className="w-12 text-center font-semibold text-lg">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Total price display */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total ({quantity} item{quantity > 1 ? 's' : ''})</span>
              <span className="text-2xl font-bold text-gray-900">{totalFormatted}</span>
            </div>
          </div>

          {/* Messages */}
          {successMsg && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
              ✅ {successMsg} — Redirecting to your order...
            </div>
          )}

          {error && !showCheckoutForm && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Buy Now Button */}
          {!showCheckoutForm && (
            <button
              onClick={handleBuyNow}
              className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              Buy Now
            </button>
          )}

          <p className="text-sm text-gray-400 mt-4 text-center">
            Free shipping on orders over ₱1,000
          </p>
        </div>
      </div>

      {/* ===== CHECKOUT FORM MODAL ===== */}
      {showCheckoutForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Complete Your Order
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {product.name} × {quantity} — {totalFormatted}
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Payment Method Selection */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("COD")}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    paymentMethod === "COD"
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-2xl block mb-1">💵</span>
                  <span className="font-semibold text-sm text-gray-900">
                    Cash on Delivery
                  </span>
                  <span className="text-xs text-gray-500 block mt-1">
                    Pay when you receive
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("GCASH")}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    paymentMethod === "GCASH"
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-2xl block mb-1">📱</span>
                  <span className="font-semibold text-sm text-gray-900">
                    GCash
                  </span>
                  <span className="text-xs text-gray-500 block mt-1">
                    Pay via GCash
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CARD")}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    paymentMethod === "CARD"
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-2xl block mb-1">💳</span>
                  <span className="font-semibold text-sm text-gray-900">
                    Credit/Debit Card
                  </span>
                  <span className="text-xs text-gray-500 block mt-1">
                    Visa, Mastercard, JCB
                  </span>
                </button>
              </div>
            </div>

            {/* Shipping Address (required for GCASH) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shipping Address{" "}
                {paymentMethod === "GCASH" && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder={
                  paymentMethod === "GCASH" || paymentMethod === "CARD"
                    ? "Street, Barangay, City, Province, ZIP Code"
                    : "Street, Barangay, City, Province, ZIP Code (optional for COD)"
                }
                rows={3}
                required={paymentMethod === "GCASH" || paymentMethod === "CARD"}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
              />
            </div>

            {/* 🚀 PayMongo Checkout — Automated Payment */}
            {(paymentMethod === "GCASH" || paymentMethod === "CARD") && (
              <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
                <p className="text-sm font-medium text-gray-800 mb-2">
                  {paymentMethod === "GCASH" ? "📱" : "💳"} Secure Checkout
                </p>
                <p className="text-xs text-gray-700 leading-relaxed">
                  🔒 After placing your order, you will be redirected to our
                  secure checkout page powered by <strong>PayMongo</strong>.
                  Choose from:
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  {paymentMethod === "GCASH" && (
                    <>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-lg">📱 GCash</span>
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-lg">🔵 Maya</span>
                    </>
                  )}
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-lg">💳 Credit/Debit Card</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  ✓ No manual reference number needed • Auto-confirmed payment
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handlePlaceOrder}
                disabled={isAdding || ((paymentMethod === "GCASH" || paymentMethod === "CARD") && !shippingAddress.trim())}
                className="flex-1 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAdding ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  `Place Order — ${totalFormatted}`
                )}
              </button>
              <button
                onClick={() => {
                  setShowCheckoutForm(false);
                  setError(null);
                }}
                disabled={isAdding}
                className="px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
