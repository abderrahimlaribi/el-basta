"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useCartStore } from "@/lib/cart-store"

export default function CartPage() {
  const router = useRouter()
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore()
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id)
    } else {
      updateQuantity(id, newQuantity)
    }
  }

  const handleSubmitOrder = async () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      alert("Veuillez remplir tous les champs obligatoires")
      return
    }

    if (items.length === 0) {
      alert("Votre panier est vide")
      return
    }

    setLoading(true)

    try {
      // Create order
      const orderData = {
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          category: item.category,
        })),
        deliveryAddress: customerInfo.address,
        totalPrice: getTotalPrice(),
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création de la commande")
      }

      // Create WhatsApp message
      const orderDetails = items
        .map((item) => `• ${item.name} x${item.quantity} - ${(item.price * item.quantity).toFixed(0)} DA`)
        .join("\n")

      const message = `🛍️ *Nouvelle Commande - ElBasta*

📋 *Détails de la commande:*
${orderDetails}

💰 *Total: ${getTotalPrice().toFixed(0)} DA*

👤 *Informations client:*
• Nom: ${customerInfo.name}
• Téléphone: ${customerInfo.phone}
• Adresse: ${customerInfo.address}
${customerInfo.notes ? `• Notes: ${customerInfo.notes}` : ""}

🔍 *ID de suivi: ${data.trackingId}*
📱 *Lien de suivi: ${window.location.origin}/suivi?tracking=${data.trackingId}*

Merci pour votre commande ! 🙏`

      const whatsappUrl = `https://wa.me/213665258642?text=${encodeURIComponent(message)}`

      // Clear cart and redirect
      clearCart()
      window.open(whatsappUrl, "_blank")
      router.push(`/suivi?tracking=${data.trackingId}`)
    } catch (error) {
      console.error("Error submitting order:", error)
      alert("Erreur lors de la commande. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return `${price.toFixed(0)} DA`
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50 pt-24">
        <div className="max-w-2xl mx-auto px-6 py-8 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-accent text-amber-900 mb-2">Panier Vide</h1>
            <p className="text-amber-700 font-body mb-6">
              Votre panier est actuellement vide. Découvrez notre délicieuse sélection !
            </p>
            <Link href="/">
              <Button className="bg-green-600 hover:bg-green-700 text-white font-body">Retour au Menu</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 pt-24">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm" className="rounded-full bg-transparent font-body">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au menu
            </Button>
          </Link>
          <h1 className="text-4xl font-accent text-amber-900">Votre Panier</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cart Items */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-2xl font-accent text-amber-900">Articles sélectionnés</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-900 font-body">{item.name}</h3>
                      <p className="text-sm text-amber-700 font-body">{item.category}</p>
                      <p className="text-sm font-semibold text-green-600 font-body">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-body">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="flex justify-between items-center text-xl font-bold">
                  <span className="text-amber-900 font-body">Total</span>
                  <span className="text-green-600 font-body">{formatPrice(getTotalPrice())}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Information */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-2xl font-accent text-amber-900">Informations de livraison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-amber-900 font-body font-semibold">
                    Nom complet *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="mt-1 font-body"
                    placeholder="Votre nom complet"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-amber-900 font-body font-semibold">
                    Numéro de téléphone *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    className="mt-1 font-body"
                    placeholder="Ex: 0770 22 44 72"
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="text-amber-900 font-body font-semibold">
                    Adresse de livraison *
                  </Label>
                  <Textarea
                    id="address"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                    className="mt-1 font-body"
                    placeholder="Adresse complète de livraison"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="notes" className="text-amber-900 font-body font-semibold">
                    Notes spéciales (optionnel)
                  </Label>
                  <Textarea
                    id="notes"
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                    className="mt-1 font-body"
                    placeholder="Instructions spéciales pour la livraison"
                    rows={2}
                  />
                </div>

                <Button
                  onClick={handleSubmitOrder}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-body text-lg py-3"
                >
                  {loading ? "Commande en cours..." : "Confirmer la commande"}
                </Button>

                <p className="text-sm text-amber-700 font-body text-center">
                  En confirmant, vous serez redirigé vers WhatsApp pour finaliser votre commande.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
