import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import api from "../../services/api"
import type { Product } from "../../types"

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`)
        setProduct(response.data.data)
      } catch (err) {
        setError("Product not found")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    )
  }

  // Error / Not found
  if (error || !product) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-500 mb-6">{error || "This product doesn't exist."}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  // Format price
  const formattedPrice = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(product.price)

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-8 group"
      >
        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* ─── Product Image ─── */}
        <div className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-gray-200 text-[12rem]">👕</div>
          )}
        </div>

        {/* ─── Product Info ─── */}
        <div className="flex flex-col justify-center">
          <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
            New Arrival
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 leading-tight">
            {product.name}
          </h1>

          <div className="mt-6">
            <span className="text-3xl font-bold text-gray-900">{formattedPrice}</span>
            <span className="ml-3 text-xs text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
              In Stock
            </span>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-8">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-8">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Details</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Premium quality materials
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Free shipping on orders over ₱1,000
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Easy 30-day returns
              </li>
            </ul>
          </div>

          <button
            onClick={() => navigate("/")}
            className="mt-8 w-full md:w-auto px-10 py-3 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-all duration-300"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  )
}
