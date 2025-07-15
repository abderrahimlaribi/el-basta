"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Plus, Sparkles, Percent } from "lucide-react"
import { useCartStore } from "@/lib/cart-store"
import { useState } from "react"
import { gsap } from "gsap"

interface MenuItemCardProps {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  status?: 'new' | 'promotion' | null
  discountPrice?: number
}

export function MenuItemCard({ id, name, description, price, image, category, status, discountPrice }: MenuItemCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = () => {
    setIsAdding(true)

    // Add item to cart
    addItem({
      id,
      name,
      price,
      image,
      category,
    })

    // Animation feedback
    gsap.to(`.card-${id}`, {
      scale: 1.05,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut",
    })

    // Reset button state
    setTimeout(() => {
      setIsAdding(false)
    }, 400)
  }

  return (
    <Card
      className={`menu-card card-${id} group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg`}
    >
      <div className="relative overflow-hidden rounded-t-lg">
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          width={200}
          height={200}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {/* BADGES */}
        {status === 'new' && (
          <span className="absolute top-3 left-3 z-20">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-green-500 to-green-400 text-white shadow-lg text-xs font-bold uppercase tracking-wide animate-bounce">
              <Sparkles className="w-4 h-4 mr-1 -ml-1" /> Nouveau
            </span>
          </span>
        )}
        {status === 'promotion' && (
          <span className="absolute top-3 right-3 z-20">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400 text-white shadow-lg text-xs font-bold uppercase tracking-wide animate-pulse">
              <Percent className="w-4 h-4 mr-1 -ml-1" /> Promo
            </span>
          </span>
        )}
        {/* Price display */}
        {status === 'promotion' && discountPrice ? (
          <div className="absolute bottom-3 right-3 flex flex-col items-end z-10">
            <span className="bg-green-600 text-white font-bold text-lg px-3 py-1 rounded-full shadow-md animate-bounceIn">
              {discountPrice.toLocaleString()} DA
            </span>
            <span className="line-through text-base font-bold text-red-400 bg-white/80 px-2 py-0.5 rounded mt-1 shadow-sm" style={{ textDecorationThickness: 3 }}>
              {price.toLocaleString()} DA
            </span>
          </div>
        ) : (
          <div className="absolute bottom-3 right-3 z-10">
            <Badge className="bg-green-600 text-white font-bold text-base px-3 py-1 rounded-full shadow-md">
              {price.toLocaleString()} DA
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-6">
        <h4 className="text-xl font-semibold text-amber-900 mb-2 font-body">{name}</h4>
        <p className="text-amber-700 mb-4 text-sm leading-relaxed font-body">{description}</p>
        <Button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full transition-all duration-200 font-semibold"
        >
          {isAdding ? <Plus className="w-4 h-4 mr-2 animate-spin" /> : <ShoppingCart className="w-4 h-4 mr-2" />}
          {isAdding ? "Ajout..." : "Ajouter au Panier"}
        </Button>
      </CardContent>
    </Card>
  )
}
