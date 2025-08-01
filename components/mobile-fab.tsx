"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, Clock, X, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/cart-store"
import { useRouter } from "next/navigation"

interface MobileFabProps {
  openTime?: string
  closeTime?: string
  storeClosed?: boolean
}

export function MobileFab({ openTime = "08:00", closeTime = "23:00", storeClosed = false }: MobileFabProps) {
  const [showTiming, setShowTiming] = useState(false)
  const [showDeliveryStatus, setShowDeliveryStatus] = useState(false)
  const [isDeliveryAvailable, setIsDeliveryAvailable] = useState(true)
  const [loading, setLoading] = useState(true)
  const cartItems = useCartStore((state) => state.items)
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const router = useRouter()

  // Fetch delivery availability from admin settings
  useEffect(() => {
    const fetchDeliveryAvailability = async () => {
      try {
        const response = await fetch("/api/config?type=storeSettings")
        const data = await response.json()
        setIsDeliveryAvailable(
          typeof data.storeSettings.isDeliveryAvailable === 'boolean'
            ? data.storeSettings.isDeliveryAvailable
            : true
        )
        setLoading(false)
      } catch (error) {
        console.error("Error fetching delivery availability:", error)
        // Default to true if there's an error
        setIsDeliveryAvailable(true)
        setLoading(false)
      }
    }

    fetchDeliveryAvailability()

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchDeliveryAvailability, 30000)
    return () => clearInterval(interval)
  }, [])

  const toggleTiming = () => {
    setShowTiming(!showTiming)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 md:hidden">
      {/* Timing Display */}
      {showTiming && (
        <div className="mb-4 bg-white rounded-lg shadow-lg border border-green-200 p-3 max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-amber-900">Horaires</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTiming}
              className="p-1 h-auto"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-green-600">
              {openTime} - {closeTime}
            </p>
            {storeClosed && (
              <p className="text-xs text-red-600 font-medium mt-1">Fermé actuellement</p>
            )}
            <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-center space-x-2">
              <Truck className="w-4 h-4 text-amber-900" />
              {loading ? (
                <p className="text-sm font-medium text-gray-500">Chargement...</p>
              ) : (
                <p className={`text-sm font-medium ${isDeliveryAvailable ? 'text-green-600' : 'text-red-600'}`}>
                  {isDeliveryAvailable ? ' Livraison disponible' : ' Livraison non disponible'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FAB Buttons */}
      <div className="flex flex-col space-y-2">
        {/* Timing Button */}
        <Button
          onClick={toggleTiming}
          className="w-12 h-12 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
          aria-label="Voir les horaires et disponibilité de livraison"
          title="Voir les horaires et disponibilité de livraison"
        >
          <Clock className="w-5 h-5" />
        </Button>

        {/* Cart Button */}
        <Button
          onClick={() => {
            // Navigate to cart page
            router.push('/cart')
          }}
          className="w-12 h-12 rounded-full bg-amber-600 hover:bg-amber-700 text-white shadow-lg relative transform hover:scale-105 transition-all duration-200"
          aria-label="Voir le panier"
          title="Voir le panier"
        >
          <ShoppingCart className="w-5 h-5" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {itemCount}
            </span>
          )}
        </Button>
      </div>
    </div>
  )
} 
