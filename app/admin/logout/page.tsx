"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminLogoutPage() {
  const router = useRouter()

  useEffect(() => {
    // Clear admin session cookie
    document.cookie = "admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    
    // Redirect to admin auth page
    router.replace("/admin-auth")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Déconnexion...</h1>
        <p className="text-gray-600">Vous êtes en train de vous déconnecter.</p>
      </div>
    </div>
  )
} 