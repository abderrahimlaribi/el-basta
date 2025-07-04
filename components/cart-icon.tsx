"use client"

import { ShoppingCart } from "lucide-react"
import { useCartStore } from "@/lib/cart-store"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function CartIcon() {
  const totalItems = useCartStore((state) => state.getTotalItems())

  return (
    <Link href="/cart" className="relative">
      <div className="p-2 hover:bg-green-100 rounded-full transition-colors duration-200">
        <ShoppingCart className="w-6 h-6 text-amber-900" />
        {totalItems > 0 && (
          <Badge className="absolute -top-1 -right-1 bg-green-600 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
            {totalItems}
          </Badge>
        )}
      </div>
    </Link>
  )
}
