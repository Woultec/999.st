import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="text-2xl font-bold text-white tracking-tight">
              999.st
            </Link>
            <p className="mt-3 text-sm leading-relaxed">
              Premium streetwear para sa mga Pilipinong may puso sa fashion. 
              Quality apparel na abot-kaya.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-sm hover:text-white transition-colors">
                Home
              </Link>
              <Link to="/login" className="text-sm hover:text-white transition-colors">
                Login
              </Link>
              <Link to="/register" className="text-sm hover:text-white transition-colors">
                Register
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <div className="flex flex-col gap-2 text-sm">
              <span>📍 Manila, Philippines</span>
              <span>✉️ hello@999st.com</span>
              <span>📱 +63 912 345 6789</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} 999.st. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
