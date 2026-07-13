import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import api from "../services/api"
import type { User } from "../types"

// ─── Auth Context Type ─────────────────────────────────
interface AuthContextType {
  user: User | null
  token: string | null
  isLoggedIn: boolean
  isLoading: boolean
  login: (token: string) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

// ─── Create Context ────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null)

// ─── Auth Provider Component ───────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"))
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(!!token)

  // Fetch user data from /api/auth/me pag may token
  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem("token")
    if (!storedToken) {
      setUser(null)
      return
    }

    try {
      const response = await api.get("/auth/me")
      setUser(response.data.data)
    } catch {
      // Token expired or invalid — clear auth state
      localStorage.removeItem("token")
      setToken(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Auto-fetch user on mount kung may token
  useEffect(() => {
    if (token) {
      refreshUser()
    } else {
      setIsLoading(false)
    }
  }, [token, refreshUser])

  const login = (newToken: string) => {
    localStorage.setItem("token", newToken)
    setToken(newToken)
    // User data will be fetched by refreshUser via useEffect on [token]
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn: !!token, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Custom Hook ───────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
