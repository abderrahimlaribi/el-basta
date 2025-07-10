"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, Package, Clock, MapPin, CheckCircle, XCircle, Truck, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ensureDate } from "@/lib/firebase"

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  category: string
}

interface Order {
  id: string
  trackingId: string
  items: OrderItem[]
  deliveryAddress: string
  totalPrice: number
  status: "En préparation" | "En cours de livraison" | "Livré" | "Annulé"
  estimatedTime?: string
  createdAt: string | Date
  updatedAt: string | Date
}

export default function TrackingPage() {
  const searchParams = useSearchParams()
  const [trackingId, setTrackingId] = useState(searchParams.get("tracking") || "")
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = async () => {
    if (!trackingId.trim()) {
      setError("Veuillez entrer un numéro de suivi")
      return
    }

    setLoading(true)
    setError("")
    setOrder(null)

    try {
      const response = await fetch(`/api/orders/${trackingId.trim()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la recherche")
      }

      setOrder(data.order)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la recherche")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchParams.get("tracking")) {
      handleSearch()
    }
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "En préparation":
        return <Clock className="h-5 w-5 text-orange-500" />
      case "En cours de livraison":
        return <Truck className="h-5 w-5 text-blue-500" />
      case "Livré":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "Annulé":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Package className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "En préparation":
        return "bg-orange-100 text-orange-800"
      case "En cours de livraison":
        return "bg-blue-100 text-blue-800"
      case "Livré":
        return "bg-green-100 text-green-800"
      case "Annulé":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (date: string | Date) => {
    const dateObj = ensureDate(date)
    return dateObj.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatPrice = (price: number) => {
    return `${price.toFixed(0)} DA`
  }

  return (
    <div className="min-h-screen bg-cream-50 pt-24">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm" className="rounded-full bg-transparent font-body">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>
          <h1 className="text-4xl font-accent text-amber-900">Suivi de Commande</h1>
        </div>

        {/* Search Section */}
        <Card className="shadow-lg border-0 mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-accent text-amber-900 flex items-center">
              <Package className="w-6 h-6 mr-2" />
              Rechercher votre commande
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tracking-id" className="text-amber-900 font-body font-semibold">
                  ID de suivi
                </Label>
                <Input
                  id="tracking-id"
                  type="text"
                  placeholder="Ex: ELB1234"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                  className="mt-2 font-body"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>

              <Button
                onClick={handleSearch}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-body"
              >
                <Search className="w-4 h-4 mr-2" />
                {loading ? "Recherche..." : "Rechercher"}
              </Button>

              {error && <div className="text-red-600 text-sm font-body bg-red-50 p-3 rounded-lg">{error}</div>}
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            {/* Status Card */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-accent text-amber-900">Commande #{order.trackingId}</CardTitle>
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(order.status)}
                    <Badge className={`${getStatusColor(order.status)} font-body text-sm px-3 py-1`}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
                <p className="text-amber-700 font-body">Commandé le {formatDate(order.createdAt)}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.estimatedTime && (
                  <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                    <Clock className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-800 font-body">Temps estimé</p>
                      <p className="text-green-700 font-body text-sm">{order.estimatedTime}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card className="shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <MapPin className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <p className="font-semibold text-blue-800 font-body">Adresse de livraison</p>
                    <p className="text-blue-700 font-body mt-1">{order.deliveryAddress}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-xl font-accent text-amber-900">Articles commandés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-amber-900 font-body">{item.name}</p>
                        <p className="text-sm text-amber-700 font-body">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-amber-900 font-body">
                          {item.quantity}x {formatPrice(item.price)}
                        </p>
                        <p className="text-sm text-amber-700 font-body">= {formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between items-center text-xl font-bold">
                  <span className="text-amber-900 font-body">Total</span>
                  <span className="text-green-600 font-body">{formatPrice(order.totalPrice)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Progress Timeline */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-xl font-accent text-amber-900">Progression de la commande</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { status: "En préparation", label: "Commande reçue et en préparation" },
                    { status: "En cours de livraison", label: "En route vers votre adresse" },
                    { status: "Livré", label: "Commande livrée avec succès" },
                  ].map((step, index) => {
                    const statusOrder = ["En préparation", "En cours de livraison", "Livré"]
                    const currentIndex = statusOrder.indexOf(order.status)
                    const isCompleted = currentIndex >= index
                    const isCurrent = currentIndex === index

                    return (
                      <div key={step.status} className="flex items-center space-x-4">
                        <div
                          className={`w-4 h-4 rounded-full ${
                            isCompleted ? "bg-green-500" : "bg-gray-300"
                          } flex-shrink-0`}
                        />
                        <div>
                          <p
                            className={`font-body ${
                              isCurrent
                                ? "font-semibold text-green-600"
                                : isCompleted
                                  ? "text-green-600"
                                  : "text-gray-500"
                            }`}
                          >
                            {step.label}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="shadow-lg border-0">
              <CardContent className="p-6">
                <div className="bg-amber-50 p-4 rounded-lg">
                  <p className="text-amber-800 font-body text-sm">
                    <strong>Besoin d'aide ?</strong> Contactez-nous au{" "}
                    <a href="tel:0770224472" className="text-green-600 hover:underline">
                      0770 22 44 72
                    </a>{" "}
                    ou via{" "}
                    <a
                      href="https://wa.me/213770224472"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline"
                    >
                      WhatsApp
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Help Section */}
        <Card className="shadow-lg border-0 mt-8">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-amber-900 font-body mb-4">Comment utiliser le suivi ?</h3>
            <div className="space-y-2 text-amber-700 font-body">
              <p>• Saisissez votre ID de suivi (ex: ELB1234) dans le champ ci-dessus</p>
              <p>• Votre ID de suivi vous a été envoyé par WhatsApp après votre commande</p>
              <p>• Vous pouvez suivre l'évolution de votre commande en temps réel</p>
              <p>• En cas de problème, contactez-nous directement</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
