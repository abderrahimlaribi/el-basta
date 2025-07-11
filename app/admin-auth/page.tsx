"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminAuthPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const ADMIN_PASSWORD = "ElBasta2024!"; // Plaintext for testing

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (password === ADMIN_PASSWORD) {
        document.cookie = "admin-session=authenticated; path=/; max-age=3600; secure; samesite=strict"
        router.replace("/admin")
      } else {
        setError("Access denied: Admins only.")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm flex flex-col gap-4"
        autoComplete="off"
      >
        <h1 className="text-2xl font-semibold text-center mb-2">Admin Login</h1>
        <input
          type="password"
          placeholder="Enter admin password"
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={loading}
          required
        />
        <button
          type="submit"
          className="bg-green-600 text-white rounded px-3 py-2 font-medium hover:bg-green-700 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Checking..." : "Login"}
        </button>
        {error && <div className="text-red-600 text-center text-sm mt-2">{error}</div>}
      </form>
    </div>
  )
} 