"use client"

import { useState } from "react"
import { ShoppingCart, Clock, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/cart-store"

interface MobileFabProps {
  openTime?: string
  closeTime?: string
  storeClosed?: boolean
}

export function MobileFab({ openTime = "08:00", closeTime = "23:00", storeClosed = false }: MobileFabProps) {
  const [showTiming, setShowTiming] = useState(false)
  const cartItems = useCartStore((state) => state.items)
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0)

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
          </div>
        </div>
      )}

      {/* FAB Buttons */}
      <div className="flex flex-col space-y-2">
        {/* Timing Button */}
        <Button
          onClick={toggleTiming}
          className="w-12 h-12 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg"
        >
          <Clock className="w-5 h-5" />
        </Button>

        {/* Cart Button */}
        <Button
          onClick={() => {
            // Scroll to cart or open cart modal
            const cartSection = document.getElementById('cart')
            if (cartSection) {
              cartSection.scrollIntoView({ behavior: 'smooth' })
            }
          }}
          className="w-12 h-12 rounded-full bg-amber-600 hover:bg-amber-700 text-white shadow-lg relative"
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