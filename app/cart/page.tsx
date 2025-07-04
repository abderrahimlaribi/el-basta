"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCartStore } from "@/lib/cart-store"
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { useEffect, useState } from "react"

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return `${price.toFixed(0)} DA`
  }

  const generateWhatsAppMessage = () => {
    let message = "🍵 *Commande d'ElBasta* 🍵\n\n"

    items.forEach((item) => {
      message += `${item.quantity}x ${item.name}\n`
    })

    message += `\n💰 *Coût Total: ${formatPrice(getTotalPrice())}*\n\n`
    message += "Merci ! 😊"

    return message
  }

  const handleWhatsAppOrder = () => {
    const message = generateWhatsAppMessage()
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/213770224472?text=${encodedMessage}`
    window.open(whatsappUrl, "_blank")
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50 pt-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center py-20">
            <ShoppingBag className="w-24 h-24 text-gray-400 mx-auto mb-8" />
            <h1 className="text-5xl font-accent text-amber-900 mb-4">Votre Panier est Vide</h1>
            <p className="text-lg font-body text-amber-700 mb-8">
              Il semble que vous n'ayez pas encore ajouté d'articles à votre panier.
            </p>
            <Link href="/">
              <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-body">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continuer les Achats
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 pt-24">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="rounded-full bg-transparent font-body">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au Menu
              </Button>
            </Link>
            <h1 className="text-4xl font-accent text-amber-900">Votre Panier</h1>
          </div>
          <Button
            onClick={clearCart}
            variant="outline"
            size="sm"
            className="text-red-600 border-red-600 hover:bg-red-50 rounded-full bg-transparent font-body"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Vider le Panier
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-6">
                    {/* Item Image */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>

                    {/* Item Details */}
                    <div className="flex-grow">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold font-body text-amber-900">{item.name}</h3>
                          <Badge variant="secondary" className="mt-1 font-body">
                            {item.category}
                          </Badge>
                        </div>
                        <Button
                          onClick={() => removeItem(item.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 font-body"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Quantity and Price */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-3">
                          <Button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            variant="outline"
                            size="sm"
                            className="w-8 h-8 rounded-full p-0 font-body"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-lg font-semibold text-amber-900 min-w-[2rem] text-center font-body">
                            {item.quantity}
                          </span>
                          <Button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            variant="outline"
                            size="sm"
                            className="w-8 h-8 rounded-full p-0 font-body"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-amber-700 font-body">{formatPrice(item.price)} chacun</p>
                          <p className="text-lg font-semibold text-amber-900 font-body">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0 sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-3xl font-accent text-amber-900 mb-6">Résumé de Commande</h2>

                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-amber-700 font-body">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="text-amber-900 font-medium font-body">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-amber-900 font-body">Total</span>
                    <span className="text-2xl font-bold text-green-600 font-body">{formatPrice(getTotalPrice())}</span>
                  </div>
                </div>

                <Button
                  onClick={handleWhatsAppOrder}
                  className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-full text-lg font-semibold font-body flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                  </svg>
                  Passer Commande
                </Button>

                <div className="mt-4 text-center">
                  <Link href="/">
                    <Button variant="ghost" className="text-amber-700 hover:text-amber-900 font-body">
                      Continuer les Achats
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
