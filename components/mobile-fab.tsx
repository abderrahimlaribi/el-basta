"use client"

import { ShoppingCart, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/cart-store"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function MobileFAB() {
  const totalItems = useCartStore((state) => state.getTotalItems())

  return (
    <div className="md:hidden fixed bottom-6 right-6 z-40">
      <div className="flex flex-col space-y-3">
        {/* Cart FAB */}
        <Link href="/cart">
          <Button
            size="lg"
            className="w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg relative"
          >
            <ShoppingCart className="w-6 h-6 text-white" />
            {totalItems > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
                {totalItems}
              </Badge>
            )}
          </Button>
        </Link>

        {/* Menu FAB */}
        <Button
          size="lg"
          className="w-14 h-14 rounded-full bg-amber-600 hover:bg-amber-700 shadow-lg"
          onClick={() => {
            const menuSection = document.getElementById("menu")
            if (menuSection) {
              menuSection.scrollIntoView({ behavior: "smooth" })
            }
          }}
        >
          <Menu className="w-6 h-6 text-white" />
        </Button>
      </div>
    </div>
  )
} 