import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/landing/Home"
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import Admin from "./pages/admin/Admin"
import ProductDetail from "./pages/user/ProductDetail"
import Profile from "./pages/user/Profile"
import MainLayout from "./layouts/MainLayout"
import { AuthProvider } from "./contexts/AuthContext"
import "./index.css"

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/product/:id" element={<ProductDetail />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
