"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Package, Clock, CheckCircle, DollarSign } from "lucide-react"
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

interface Analytics {
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  completedOrders: number
  recentOrdersCount: number
  statusBreakdown: Record<string, number>
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [newStatus, setNewStatus] = useState("")
  const [estimatedTime, setEstimatedTime] = useState("")
  const [updating, setUpdating] = useState(false)

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics")
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error("Error fetching analytics:", error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchOrders(), fetchAnalytics()])
      setLoading(false)
    }
    loadData()
  }, [])

  const updateOrderStatus = async () => {
    if (!selectedOrder || !newStatus) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/orders/${selectedOrder.trackingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          estimatedTime: estimatedTime || undefined,
        }),
      })

      if (response.ok) {
        await fetchOrders()
        await fetchAnalytics()
        setSelectedOrder(null)
        setNewStatus("")
        setEstimatedTime("")
      }
    } catch (error) {
      console.error("Error updating order:", error)
    } finally {
      setUpdating(false)
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
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatPrice = (price: number) => {
    return `${price.toFixed(0)} DA`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de Bord Admin</h1>
          <p className="text-gray-600">Gérez vos commandes et suivez vos performances</p>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Commandes</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalOrders}</div>
                <p className="text-xs text-muted-foreground">+{analytics.recentOrdersCount} cette semaine</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chiffre d'Affaires</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(analytics.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">Total des ventes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Préparation</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.pendingOrders}</div>
                <p className="text-xs text-muted-foreground">Commandes en cours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Livrées</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.completedOrders}</div>
                <p className="text-xs text-muted-foreground">Commandes terminées</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Commandes Récentes</CardTitle>
            <CardDescription>Gérez et suivez toutes vos commandes</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Suivi</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Articles</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.trackingId}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>{order.items.length} article(s)</TableCell>
                    <TableCell>{formatPrice(order.totalPrice)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order)
                              setNewStatus(order.status)
                              setEstimatedTime(order.estimatedTime || "")
                            }}
                          >
                            Modifier
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Modifier la commande #{order.trackingId}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="status">Statut</Label>
                              <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner un statut" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="En préparation">En préparation</SelectItem>
                                  <SelectItem value="En cours de livraison">En cours de livraison</SelectItem>
                                  <SelectItem value="Livré">Livré</SelectItem>
                                  <SelectItem value="Annulé">Annulé</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="estimated-time">Temps estimé (optionnel)</Label>
                              <Input
                                id="estimated-time"
                                value={estimatedTime}
                                onChange={(e) => setEstimatedTime(e.target.value)}
                                placeholder="Ex: 30 minutes"
                              />
                            </div>
                            <Button onClick={updateOrderStatus} disabled={updating} className="w-full">
                              {updating ? "Mise à jour..." : "Mettre à jour"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
