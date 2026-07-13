import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../../services/api"
import type { Product } from "../../types"

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products")
        setProducts(response.data.data)
      } catch (err) {
        setError("Hindi makuha ang products. Naka-run ba ang backend?")
        console.error("Error fetching products:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
          <p className="text-gray-500 text-lg">Naglo-load...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center max-w-md px-6">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Subukan ulit
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* ═══ HERO SECTION ═══ */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-36">
          <div className="max-w-2xl">
            <span className="inline-block text-sm font-medium text-gray-400 uppercase tracking-[0.2em] mb-4">
              Est. 2026
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              Style that
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                speaks volumes
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mt-6 max-w-lg leading-relaxed">
              Discover premium streetwear that blends comfort with attitude. 
              Your story starts here.
            </p>
            <div className="flex gap-4 mt-8">
              <a
                href="#products"
                className="inline-flex items-center px-8 py-3 bg-white text-black font-medium rounded-full hover:bg-gray-100 transition-all duration-300"
              >
                Shop Now
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href="#collections"
                className="inline-flex items-center px-8 py-3 border border-gray-500 text-gray-300 font-medium rounded-full hover:border-white hover:text-white transition-all duration-300"
              >
                Collections
              </a>
            </div>
          </div>
        </div>

        {/* Decorative bottom curve */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* ═══ FEATURED COLLECTIONS ═══ */}
      <section id="collections" className="bg-gray-50 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-sm font-medium text-gray-500 uppercase tracking-[0.2em]">Collections</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Shop by Category</h2>
            <p className="text-gray-500 mt-3 max-w-md mx-auto">
              Explore our curated collections designed for every occasion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category 1 */}
            <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
              <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                <span className="text-8xl group-hover:scale-110 transition-transform duration-500">👕</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900">T-Shirts</h3>
                <p className="text-gray-500 mt-1">Classic and modern designs</p>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
            </div>

            {/* Category 2 */}
            <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
              <div className="aspect-[4/3] bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
                <span className="text-8xl group-hover:scale-110 transition-transform duration-500">🧥</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900">Outerwear</h3>
                <p className="text-gray-500 mt-1">Hoodies, jackets and more</p>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
            </div>

            {/* Category 3 */}
            <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
              <div className="aspect-[4/3] bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
                <span className="text-8xl group-hover:scale-110 transition-transform duration-500">🧢</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900">Accessories</h3>
                <p className="text-gray-500 mt-1">Caps, bags and more</p>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURED PRODUCTS ═══ */}
      {products.length > 0 && (
        <section id="products" className="bg-white py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-[0.2em]">Products</span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Featured</h2>
              </div>
              <span className="text-sm text-gray-400 hidden sm:block">
                {products.length} item{products.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {products.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`}>
                  <ProductCard product={product} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ EMPTY STATE ═══ */}
      {products.length === 0 && (
        <section className="bg-white py-20">
          <div className="text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon</h2>
            <p className="text-gray-500">New arrivals dropping soon. Stay tuned!</p>
          </div>
        </section>
      )}

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-white text-lg font-bold mb-4">999.st</h3>
              <p className="text-sm leading-relaxed">
                Premium streetwear for the modern individual. Est. 2026.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3">Shop</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#products" className="hover:text-white transition-colors">All Products</a></li>
                <li><a href="#collections" className="hover:text-white transition-colors">Collections</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="hover:text-white transition-colors cursor-default">Contact</span></li>
                <li><span className="hover:text-white transition-colors cursor-default">FAQ</span></li>
                <li><span className="hover:text-white transition-colors cursor-default">Shipping</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-3">Connect</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="hover:text-white transition-colors cursor-default">Instagram</span></li>
                <li><span className="hover:text-white transition-colors cursor-default">Facebook</span></li>
                <li><span className="hover:text-white transition-colors cursor-default">Twitter</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-10 pt-8 text-sm text-center">
            &copy; 2026 999.st. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

// ═══ PRODUCT CARD COMPONENT ═══
function ProductCard({ product }: { product: Product }) {
  const formattedPrice = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(product.price)

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="text-gray-300 text-7xl group-hover:scale-110 transition-transform duration-500">
            👕
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
      </div>

      {/* Product Info */}
      <div className="p-5">
        <span className="inline-block text-xs font-medium text-gray-400 uppercase tracking-wider">
          New Arrival
        </span>
        <h3 className="text-base font-bold text-gray-900 mt-1.5 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-gray-400 text-sm mt-1 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <span className="text-lg font-bold text-gray-900">{formattedPrice}</span>
          <span className="text-xs text-green-600 font-medium bg-green-50 px-2.5 py-1 rounded-full">
            In Stock
          </span>
        </div>
      </div>
    </div>
  )
}
