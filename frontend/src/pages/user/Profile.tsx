import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import api from "../../services/api"
import type { User } from "../../types"

type TabKey = "info" | "edit" | "password" | "orders"

export default function Profile() {
  const { user, isLoading, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState<TabKey>("info")

  // Tab navigation
  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: "info", label: "Profile", icon: "👤" },
    { key: "edit", label: "Edit Profile", icon: "✏️" },
    { key: "password", label: "Password", icon: "🔒" },
    { key: "orders", label: "Orders", icon: "📦" },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
          <p className="text-gray-500 text-lg">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Please sign in</h2>
          <p className="text-gray-500 mb-6">You need to be logged in to view your profile.</p>
          <a
            href="/login"
            className="inline-flex px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* ─── Header ─── */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl md:text-4xl font-bold shadow-lg shadow-blue-500/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 border-2 border-white rounded-full" />
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-500 mt-1">{user.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium ${
                user.role === "ADMIN"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-blue-100 text-blue-700"
              }`}>
                {user.role === "ADMIN" ? "👑 Admin" : "🛒 Buyer"}
              </span>
              {user.createdAt && (
                <span className="text-xs text-gray-400">
                  Member since {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ─── Tab Navigation ─── */}
        <div className="flex gap-1 border-b border-gray-200 mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-black text-black"
                  : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300"
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Tab Content ─── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          {activeTab === "info" && <ProfileInfoTab user={user} />}
          {activeTab === "edit" && <EditProfileTab user={user} onUpdate={refreshUser} />}
          {activeTab === "password" && <ChangePasswordTab />}
          {activeTab === "orders" && <OrdersTab />}
        </div>
      </div>
    </div>
  )
}

// ═══ PROFILE INFO TAB ═══
function ProfileInfoTab({ user }: { user: User }) {
  const details = [
    { label: "Full Name", value: user.name },
    { label: "Email", value: user.email },
    { label: "Role", value: user.role === "ADMIN" ? "Administrator" : "Buyer" },
    {
      label: "Member Since",
      value: user.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "N/A",
    },
    { label: "User ID", value: `#${String(user.id).padStart(4, "0")}` },
  ]

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Account Information</h2>
      <p className="text-gray-500 text-sm mb-6">Your account details and settings</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {details.map((detail) => (
          <div
            key={detail.label}
            className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors"
          >
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              {detail.label}
            </span>
            <p className="text-gray-900 font-medium mt-1.5">{detail.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══ EDIT PROFILE TAB ═══
function EditProfileTab({
  user,
  onUpdate,
}: {
  user: User
  onUpdate: () => Promise<void>
}) {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !email) {
      setError("Name and email are required")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await api.put("/auth/profile", { name, email })
      setSuccess(true)
      // Refresh user data mula sa API — silent fail kung network blip lang
      try { await onUpdate() } catch { /* profile already saved */ }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Edit Profile</h2>
      <p className="text-gray-500 text-sm mb-6">Update your personal information</p>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <span>⚠️</span>
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <span>✅</span>
            Profile updated successfully!
          </div>
        )}

        <div>
          <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1.5">
            Full Name
          </label>
          <input
            id="edit-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
          />
        </div>

        <div>
          <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email
          </label>
          <input
            id="edit-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-black text-white font-medium rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  )
}

// ═══ CHANGE PASSWORD TAB ═══
function ChangePasswordTab() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await api.put("/auth/password", { currentPassword, newPassword })
      setSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to change password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Change Password</h2>
      <p className="text-gray-500 text-sm mb-6">Update your account password</p>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <span>⚠️</span>
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <span>✅</span>
            Password changed successfully!
          </div>
        )}

        <div>
          <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1.5">
            Current Password
          </label>
          <input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
          />
        </div>

        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1.5">
            New Password
          </label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
          />
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1.5">
            Confirm New Password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-black text-white font-medium rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? "Updating..." : "Change Password"}
        </button>
      </form>
    </div>
  )
}

// ═══ ORDERS TAB ═══
function OrdersTab() {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Order History</h2>
      <p className="text-gray-500 text-sm mb-6">View your past orders and their status</p>

      {/* Empty state — wala pang orders */}
      <div className="text-center py-16">
        <div className="text-7xl mb-6">📦</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">No orders yet</h3>
        <p className="text-gray-500 max-w-sm mx-auto mb-6">
          You haven't placed any orders yet. Start shopping to see your order history here!
        </p>
        <a
          href="/"
          className="inline-flex px-6 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-all"
        >
          Start Shopping
        </a>
      </div>
    </div>
  )
}
