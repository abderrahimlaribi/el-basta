"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import bcrypt from "bcryptjs"

export default function AdminAuthPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Access the hashed password from the environment variable (base64 encoded, then decoded and trimmed)
  const hashedPassword = atob(process.env.NEXT_PUBLIC_ADMIN_HASHED_PASSWORD_BASE64 || "").trim()
  // For security, do not log the hash in production
  console.log("Hashed password:", hashedPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (!hashedPassword) {
        setError("Configuration error: Admin password not set.")
        setLoading(false)
        return
      }
      // bcryptjs compare is sync here
      console.log(password, hashedPassword);
      console.log(bcrypt.compareSync(password, hashedPassword));
      const match = bcrypt.compareSync(password, hashedPassword)
      if (match) {
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