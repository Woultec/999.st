import { useState, useEffect } from "react"
import { Navigate, Link } from "react-router-dom"
import api from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import type { Product } from "../../types"

export default function Admin() {
  // ─── Check if logged in AND admin (reactive — uses AuthContext) ─
  const { user, isLoggedIn } = useAuth()

  // Not logged in → login page
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  // Logged in but not admin → home page with message
  if (user && user.role !== "ADMIN") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500 mb-6">
            Sorry, only store admins can access this page.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  // ─── States ───────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<number | null>(null)

  // ─── Fetch products ──────────────────────────────────
  const fetchProducts = async () => {
    try {
      const response = await api.get("/products")
      setProducts(response.data.data)
    } catch (err) {
      setError("Hindi makuha ang products")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // ─── Open form for Add ───────────────────────────────
  const openAddForm = () => {
    setEditProduct(null)
    setName("")
    setDescription("")
    setPrice("")
    setFormError(null)
    setShowForm(true)
  }

  // ─── Open form for Edit ──────────────────────────────
  const openEditForm = (product: Product) => {
    setEditProduct(product)
    setName(product.name)
    setDescription(product.description)
    setPrice(String(product.price))
    setFormError(null)
    setShowForm(true)
  }

  // ─── Close form ──────────────────────────────────────
  const closeForm = () => {
    setShowForm(false)
    setEditProduct(null)
    setFormError(null)
  }

  // ─── Save (Add or Update) ────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!name.trim() || !description.trim() || !price) {
      setFormError("Please fill in all fields")
      return
    }

    const priceNum = Number(price)
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError("Price must be a positive number")
      return
    }

    setSaving(true)
    setFormError(null)

    try {
      if (editProduct) {
        // UPDATE existing product
        await api.put(`/products/${editProduct.id}`, {
          name: name.trim(),
          description: description.trim(),
          price: priceNum,
        })
      } else {
        // CREATE new product
        await api.post("/products", {
          name: name.trim(),
          description: description.trim(),
          price: priceNum,
        })
      }

      closeForm()
      fetchProducts() // Refresh the list
    } catch (err: any) {
      const message = err.response?.data?.message || "Error saving product"
      setFormError(message)
    } finally {
      setSaving(false)
    }
  }

  // ─── Delete product ──────────────────────────────────
  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/products/${id}`)
      setDeleteId(null)
      fetchProducts() // Refresh the list
    } catch (err: any) {
      const message = err.response?.data?.message || "Error deleting product"
      alert(message)
    }
  }

  // ─── Loading ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    )
  }

  // ─── Error ───────────────────────────────────────────
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Subukan ulit
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your products</p>
        </div>
        <button
          onClick={openAddForm}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Product
        </button>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Name</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 hidden sm:table-cell">
                Description
              </th>
              <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Price</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-500">
                  No products yet. Click "Add Product" to get started!
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm hidden sm:table-cell max-w-xs truncate">
                    {product.description}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-900 font-medium">
                    ₱{product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditForm(product)}
                        className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(product.id)}
                        className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Add/Edit Product Modal ─────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editProduct ? "Edit Product" : "Add Product"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Form error */}
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {formError}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Product name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Product description"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₱)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? "Saving..." : editProduct ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ──────────────────── */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
            <div className="text-5xl mb-4">🗑️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Product?</h2>
            <p className="text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
