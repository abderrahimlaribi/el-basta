"use client"

import { ShoppingCart } from "lucide-react"
import { useCartStore } from "@/lib/cart-store"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useEffect, useState } from "react"

export function CartIcon() {
  const totalItems = useCartStore((state) => state.getTotalItems())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Link href="/cart" className="relative">
      <div className="p-2 hover:bg-green-100 rounded-full transition-colors duration-200 relative">
        <ShoppingCart className="w-6 h-6 text-amber-900 drop-shadow-sm" />
        {mounted && totalItems > 0 && (
          <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
            {totalItems}
          </Badge>
        )}
      </div>
    </Link>
  )
}
