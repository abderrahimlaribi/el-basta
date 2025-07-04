"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Plus } from "lucide-react"
import { useCartStore } from "@/lib/cart-store"
import { useState } from "react"
import { gsap } from "gsap"

interface MenuItemCardProps {
  id: string
  name: string
  description: string
  price: string
  image: string
  category: string
}

export function MenuItemCard({ id, name, description, price, image, category }: MenuItemCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = () => {
    setIsAdding(true)

    // Add item to cart
    addItem({
      id,
      name,
      price: Number.parseFloat(price.replace(" DA", "")),
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
      className={`menu-card card-${id} group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg`}
    >
      <div className="relative overflow-hidden rounded-t-lg">
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          width={200}
          height={200}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4">
          <Badge className="bg-green-600 text-white">{price}</Badge>
        </div>
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
