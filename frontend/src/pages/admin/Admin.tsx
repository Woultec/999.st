import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../services/product.service";
import {
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
  getSalesSummary,
} from "../../services/order.service";
import type { Product, Order, SalesSummary } from "../../types";

type Tab = "dashboard" | "products" | "orders";

type ProductForm = {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
};

const emptyProductForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  imageUrl: "",
};

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

export default function Admin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  // ─── Dashboard state ───────────────────────────
  const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

  // ─── Products state ────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm);
  const [productError, setProductError] = useState<string | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // ─── Orders state ──────────────────────────────
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [orderError, setOrderError] = useState<string | null>(null);

  // ─── Load Dashboard ────────────────────────────
  async function loadDashboard() {
    setIsLoadingSummary(true);
    try {
      const response = await getSalesSummary();
      setSalesSummary(response.data);
    } catch {
      // Silently fail
    } finally {
      setIsLoadingSummary(false);
    }
  }

  // ─── Load Products ─────────────────────────────
  async function loadProducts() {
    setIsLoadingProducts(true);
    try {
      const response = await getProducts();
      setProducts(response.data);
    } catch {
      setProductError("Failed to load products");
    } finally {
      setIsLoadingProducts(false);
    }
  }

  // ─── Load Orders ───────────────────────────────
  async function loadOrders() {
    setIsLoadingOrders(true);
    try {
      const response = await getAllOrders();
      setOrders(response.data);
    } catch {
      setOrderError("Failed to load orders");
    } finally {
      setIsLoadingOrders(false);
    }
  }

  useEffect(() => {
    loadDashboard();
    loadProducts();
    loadOrders();
  }, []);

  // ─── Product Handlers ──────────────────────────
  function openCreateForm() {
    setEditingProduct(null);
    setProductForm(emptyProductForm);
    setShowProductForm(true);
    setProductError(null);
  }

  function openEditForm(product: Product) {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      imageUrl: product.imageUrl || "",
    });
    setShowProductForm(true);
    setProductError(null);
  }

  async function handleProductSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingProduct(true);
    setProductError(null);

    try {
      const data = {
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        ...(productForm.imageUrl ? { imageUrl: productForm.imageUrl } : {}),
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
      } else {
        await createProduct(data);
      }

      setShowProductForm(false);
      loadProducts();
    } catch (err: any) {
      setProductError(
        err?.response?.data?.message || "Failed to save product"
      );
    } finally {
      setIsSavingProduct(false);
    }
  }

  async function handleDeleteProduct(id: number) {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await deleteProduct(id);
      loadProducts();
    } catch {
      setProductError("Failed to delete product");
    }
  }

  // ─── Order Handlers ────────────────────────────
  async function handleUpdateOrderStatus(id: number, status: string) {
    try {
      await updateOrderStatus(id, status);
      loadOrders();
      loadDashboard();
    } catch {
      setOrderError("Failed to update order status");
    }
  }

  async function handleUpdatePaymentStatus(
    id: number,
    paymentStatus: string
  ) {
    try {
      await updatePaymentStatus(id, paymentStatus);
      loadOrders();
      loadDashboard();
    } catch {
      setOrderError("Failed to update payment status");
    }
  }

  async function handleDeleteOrder(id: number) {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await deleteOrder(id);
      loadOrders();
      loadDashboard();
    } catch {
      setOrderError("Failed to delete order");
    }
  }

  // ─── Render ────────────────────────────────────
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "products", label: "Products", icon: "📦" },
    { id: "orders", label: "Orders", icon: "🛒" },
  ];

  const orderStatuses = [
    "PENDING",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ];

  const paymentStatuses = ["UNPAID", "PAID", "VERIFIED", "REFUNDED"];

  // Helper para makuha ang count ng orders by status
  function getStatusCount(status: string): number {
    if (!salesSummary) return 0;
    const found = salesSummary.ordersByStatus.find((s) => s.status === status);
    return found?._count?.id || 0;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {user?.name || "Admin"} 👋
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeTab === tab.id
                ? "bg-gray-900 text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ===== DASHBOARD TAB ===== */}
      {activeTab === "dashboard" && (
        <div>
          {isLoadingSummary ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : salesSummary ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <p className="text-sm text-gray-500 mb-1">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {salesSummary.totalOrders}
                  </p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-600">
                    ₱{salesSummary.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <p className="text-sm text-gray-500 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {getStatusCount("PENDING")}
                  </p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <p className="text-sm text-gray-500 mb-1">Delivered</p>
                  <p className="text-3xl font-bold text-green-600">
                    {getStatusCount("DELIVERED")}
                  </p>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Orders
                </h2>
                {salesSummary.recentOrders.length === 0 ? (
                  <p className="text-gray-500 text-center py-6">No orders yet.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {salesSummary.recentOrders.map((order: any) => (
                      <Link
                        key={order.id}
                        to={`/order/${order.id}`}
                        className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
                      >
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            #{order.id} — {order.user?.name || order.user?.email || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {order.items?.length} item(s)
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            ₱{order.totalPrice?.toLocaleString() || 0}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <span className="text-5xl block mb-3">📊</span>
              <p className="text-gray-500">
                No data available yet. Start by adding products and receiving orders!
              </p>
            </div>
          )}
        </div>
      )}

      {/* ===== PRODUCTS TAB ===== */}
      {activeTab === "products" && (
        <div>
          {/* ... same as before ... */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              All Products ({products.length})
            </h2>
            <button
              onClick={openCreateForm}
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl text-sm transition-all"
            >
              + Add Product
            </button>
          </div>

          {/* Product Form Modal */}
          {showProductForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingProduct ? "Edit Product" : "New Product"}
                </h3>

                {productError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {productError}
                  </div>
                )}

                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) =>
                        setProductForm({ ...productForm, name: e.target.value })
                      }
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          description: e.target.value,
                        })
                      }
                      required
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₱)
                    </label>
                    <input
                      type="number"
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm({ ...productForm, price: e.target.value })
                      }
                      required
                      min={1}
                      step="0.01"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL (optional)
                    </label>
                    <input
                      type="url"
                      value={productForm.imageUrl}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          imageUrl: e.target.value,
                        })
                      }
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSavingProduct}
                      className="flex-1 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSavingProduct ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : editingProduct ? (
                        "Update Product"
                      ) : (
                        "Create Product"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowProductForm(false)}
                      className="px-6 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Products List */}
          {isLoadingProducts ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <span className="text-5xl block mb-3">📦</span>
              <p className="text-gray-500">No products yet. Add your first product!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between hover:shadow-sm transition-shadow"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                      ₱{product.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => openEditForm(product)}
                      className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== ORDERS TAB ===== */}
      {activeTab === "orders" && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            All Orders ({orders.length})
          </h2>

          {orderError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {orderError}
            </div>
          )}

          {isLoadingOrders ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <span className="text-5xl block mb-3">🛒</span>
              <p className="text-gray-500">No orders yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-gray-100 p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Link
                        to={`/order/${order.id}`}
                        className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        Order #{order.id}
                      </Link>
                      <span className="text-sm text-gray-500 ml-3">
                        by {order.user?.name || order.user?.email || "Unknown"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleUpdateOrderStatus(order.id, e.target.value)
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border-0 cursor-pointer outline-none ${
                          statusColors[order.status] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {orderStatuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="text-sm text-gray-600 mb-3">
                    {order.items?.map((item, idx) => (
                      <span key={idx}>
                        {item.product?.name || `Product #${item.productId}`} x
                        {item.quantity}
                        {idx < order.items.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </div>

                  {/* Payment Info + Pricing */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">
                        {order.paymentMethod === "GCASH" ? "📱" : "💵"}{" "}
                        {order.paymentMethod || "COD"}
                      </span>
                      <select
                        value={order.paymentStatus}
                        onChange={(e) =>
                          handleUpdatePaymentStatus(order.id, e.target.value)
                        }
                        className={`px-2 py-1 rounded-lg text-xs font-medium border-0 cursor-pointer outline-none ${
                          paymentStatusColors[order.paymentStatus] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {paymentStatuses.map((ps) => (
                          <option key={ps} value={ps}>
                            {ps}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString("en-PH", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        ₱{order.totalPrice?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>

                  {/* GCash Ref Number */}
                  {order.paymentRef && (
                    <div className="mt-2 pt-2 border-t border-gray-50 text-xs text-gray-400">
                      GCash Ref: <span className="font-mono">{order.paymentRef}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
