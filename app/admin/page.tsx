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
import { Package, Clock, CheckCircle, DollarSign, RefreshCw, AlertCircle, Plus, Edit, Trash2, Calendar, Filter, AlertTriangle, BadgeCheck } from "lucide-react"
import { ensureDate } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { ProductForm } from "@/components/product-form"
import { LocationManager } from "@/components/location-manager"
import Image from "next/image"
import { format } from 'date-fns'
import { useRef } from "react"

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
  phone?: string
  phoneNumber?: string
  customerPhone?: string
  locationId?: string
  locationName?: string
}

interface Analytics {
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  completedOrders: number
  recentOrdersCount: number
  statusBreakdown: Record<string, number>
}

interface Product {
  id: string
  name: string
  description: string
  category?: string
  categoryId?: string
  imageUrl: string
  createdAt: Date
  updatedAt: Date
  locationPrices?: Array<{
    locationId: string
    price: number
    isAvailable: boolean
    status?: 'new' | 'promotion' | null
    discountPrice?: number
  }>
}

// Category type
interface Category {
  id: string
  name: string
  slug: string
}

// Define ProductStatus enum
const PRODUCT_STATUS = [
  { value: 'none', label: 'Aucun' },
  { value: 'new', label: 'Nouveau' },
  { value: 'promotion', label: 'Promotion' },
] as const

// Delivery fee interval type
interface DeliverySetting { min: number; max: number; fee: number }

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [newStatus, setNewStatus] = useState("")
  const [estimatedTime, setEstimatedTime] = useState("")
  const [updating, setUpdating] = useState(false)
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productLoading, setProductLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryName, setCategoryName] = useState("")
  const [categoryLoading, setCategoryLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedLocationFilter, setSelectedLocationFilter] = useState('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null)
  const [serviceFees, setServiceFees] = useState<number | null>(null)
  const [serviceFeesInput, setServiceFeesInput] = useState("")
  const [serviceFeesLoading, setServiceFeesLoading] = useState(false)
  const serviceFeesInputRef = useRef<HTMLInputElement>(null)
  const [promotedProducts, setPromotedProducts] = useState<string[]>([])
  const [promotedLoading, setPromotedLoading] = useState(false)
  // Store settings (business hours)
  const [openTime, setOpenTime] = useState("08:00")
  const [closeTime, setCloseTime] = useState("23:00")
  const [storeSettingsLoading, setStoreSettingsLoading] = useState(false)
  const [isDeliveryAvailable, setIsDeliveryAvailable] = useState(true)
  const [deliverySettings, setDeliverySettings] = useState<DeliverySetting[]>([]);
  const [deliverySettingsLoading, setDeliverySettingsLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newInterval, setNewInterval] = useState<DeliverySetting>({ min: 0, max: 0, fee: 0 });
  const [heroDescription, setHeroDescription] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");

  const fetchOrders = async (date?: string) => {
    try {
      let url = '/api/orders'
      if (date) url += `?date=${date}`
      const response = await fetch(url)
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
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

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    try {
      const previousOrderCount = orders.length
      await Promise.all([fetchOrders(selectedDate), fetchAnalytics(), fetchProducts()])
      
      // Check if new orders were added
      if (orders.length > previousOrderCount) {
        const newOrdersCount = orders.length - previousOrderCount
        toast({
          title: "Nouvelle(s) commande(s) reçue(s)!",
          description: `${newOrdersCount} nouvelle(s) commande(s) ajoutée(s) au tableau de bord.`,
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Error refreshing data:", error)
      toast({
        title: "Erreur de mise à jour",
        description: "Impossible de mettre à jour les données. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories")
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (e) {
      console.error("Error fetching categories", e)
    }
  }

  // Add category
  const handleAddCategory = async () => {
    if (!categoryName.trim()) return
    setCategoryLoading(true)
    const slug = categoryName.trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/\s+/g, "-")
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: categoryName.trim(), slug })
      })
      if (res.ok) {
        setCategoryName("")
        await fetchCategories()
        toast({ title: "Catégorie ajoutée", description: "La catégorie a été ajoutée avec succès." })
      }
    } catch (e) {
      toast({ title: "Erreur", description: "Impossible d'ajouter la catégorie.", variant: "destructive" })
    } finally {
      setCategoryLoading(false)
    }
  }

  // Delete category
  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Supprimer cette catégorie ?")) return
    setCategoryLoading(true)
    try {
      await fetch("/api/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      })
      await fetchCategories()
      toast({ title: "Catégorie supprimée", description: "La catégorie a été supprimée." })
    } catch (e) {
      toast({ title: "Erreur", description: "Impossible de supprimer la catégorie.", variant: "destructive" })
    } finally {
      setCategoryLoading(false)
    }
  }

  // Fetch service fees on mount
  useEffect(() => {
    fetch("/api/config")
      .then(res => res.json())
      .then(data => {
        setServiceFees(data.serviceFees)
        setServiceFeesInput(data.serviceFees?.toString() || "")
      })
      .catch(() => setServiceFees(null))
  }, [])

  const handleUpdateServiceFees = async () => {
    setServiceFeesLoading(true)
    try {
      const value = parseInt(serviceFeesInput, 10)
      if (isNaN(value) || value < 0) {
        toast({ title: "Erreur", description: "Valeur invalide.", variant: "destructive" })
        setServiceFeesLoading(false)
        return
      }
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceFees: value })
      })
      if (res.ok) {
        const data = await res.json()
        setServiceFees(data.serviceFees)
        setServiceFeesInput(data.serviceFees.toString())
        toast({ title: "Frais de service mis à jour", description: `Nouveaux frais: ${data.serviceFees} DA` })
      } else {
        toast({ title: "Erreur", description: "Impossible de mettre à jour les frais.", variant: "destructive" })
      }
    } catch {
      toast({ title: "Erreur", description: "Impossible de mettre à jour les frais.", variant: "destructive" })
    } finally {
      setServiceFeesLoading(false)
    }
  }

  // Fetch promoted products on mount
  useEffect(() => {
    fetch("/api/config?type=promotedProducts")
      .then(res => res.json())
      .then(data => setPromotedProducts(data.promotedProducts || []))
      .catch(() => setPromotedProducts([]))
  }, [])

  const handleTogglePromoted = async (productId: string) => {
    setPromotedLoading(true)
    let newList: string[]
    if (promotedProducts.includes(productId)) {
      newList = promotedProducts.filter(id => id !== productId)
    } else {
      newList = [...promotedProducts, productId]
    }
    setPromotedProducts(newList)
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promotedProducts: newList })
      })
      if (!res.ok) throw new Error()
      toast({ title: "Section promotion mise à jour" })
    } catch {
      toast({ title: "Erreur", description: "Impossible de mettre à jour la promotion.", variant: "destructive" })
    } finally {
      setPromotedLoading(false)
    }
  }

  // Fetch store settings on mount
  useEffect(() => {
    fetch("/api/config?type=storeSettings")
      .then(res => res.json())
      .then(data => {
        if (data.storeSettings) {
          setOpenTime(data.storeSettings.openTime || "08:00")
          setCloseTime(data.storeSettings.closeTime || "23:00")
          setHeroDescription(data.storeSettings.heroDescription || "")
          setHeroSubtitle(data.storeSettings.heroSubtitle || "")
          setIsDeliveryAvailable(
            typeof data.storeSettings.isDeliveryAvailable === 'boolean'
              ? data.storeSettings.isDeliveryAvailable
              : true
          )
        }
      })
      .catch(() => {})
  }, [])

  const handleUpdateDeliveryAvailable = async (value: boolean) => {
    setStoreSettingsLoading(true)
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeSettings: { isDeliveryAvailable: value } })
      })
      if (res.ok) {
        setIsDeliveryAvailable(value)
        toast({ title: value ? "Livraison activée" : "Livraison désactivée", description: value ? "Le service de livraison est disponible." : "Le service de livraison est désactivé." })
      } else {
        toast({ title: "Erreur", description: "Impossible de mettre à jour la livraison.", variant: "destructive" })
      }
    } catch {
      toast({ title: "Erreur", description: "Impossible de mettre à jour la livraison.", variant: "destructive" })
    } finally {
      setStoreSettingsLoading(false)
    }
  }

  const handleUpdateStoreSettings = async () => {
    setStoreSettingsLoading(true)
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeSettings: { openTime, closeTime, heroDescription, heroSubtitle } })
      })
      if (res.ok) {
        toast({ title: "Paramètres mis à jour", description: `Nouvelles heures : ${openTime} – ${closeTime}` })
      } else {
        toast({ title: "Erreur", description: "Impossible de mettre à jour les paramètres.", variant: "destructive" })
      }
    } catch {
      toast({ title: "Erreur", description: "Impossible de mettre à jour les paramètres.", variant: "destructive" })
    } finally {
      setStoreSettingsLoading(false)
    }
  }

  // Fetch delivery settings on mount
  useEffect(() => {
    fetch("/api/config?type=deliverySettings")
      .then(res => res.json())
      .then(data => setDeliverySettings(data.deliverySettings || []))
      .catch(() => setDeliverySettings([]));
  }, []);

  const handleAddInterval = () => {
    if (newInterval.max <= newInterval.min || newInterval.fee < 0) return;
    setDeliverySettings([...deliverySettings, { ...newInterval }]);
    setNewInterval({ min: 0, max: 0, fee: 0 });
  };

  const handleEditInterval = (idx: number) => {
    setEditingIndex(idx);
    setNewInterval(deliverySettings[idx]);
  };

  const handleSaveEdit = () => {
    if (newInterval.max <= newInterval.min || newInterval.fee < 0) return;
    setDeliverySettings(deliverySettings.map((d, i) => (i === editingIndex ? { ...newInterval } : d)));
    setEditingIndex(null);
    setNewInterval({ min: 0, max: 0, fee: 0 });
  };

  const handleRemoveInterval = (idx: number) => {
    if (deliverySettings.length === 1) return;
    setDeliverySettings(deliverySettings.filter((_, i) => i !== idx));
  };

  const handleSaveDeliverySettings = async () => {
    setDeliverySettingsLoading(true);
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliverySettings }),
      });
      if (res.ok) {
        toast({ title: "Frais de livraison mis à jour", description: "Les intervalles ont été enregistrés." });
      } else {
        toast({ title: "Erreur", description: "Impossible d'enregistrer les intervalles.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", description: "Impossible d'enregistrer les intervalles.", variant: "destructive" });
    } finally {
      setDeliverySettingsLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchOrders(selectedDate),
        fetchAnalytics(),
        fetchProducts()
      ])
      setLoading(false)
    }
    loadData()
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      refreshData()
    }, 30000)
    return () => clearInterval(interval)
  }, [mounted, selectedDate])

  // Fetch categories on mount
  useEffect(() => { fetchCategories() }, [])

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
        await refreshData()
        setSelectedOrder(null)
        setNewStatus("")
        setEstimatedTime("")
        toast({
          title: "Statut mis à jour",
          description: `La commande ${selectedOrder?.trackingId} a été mise à jour avec succès.`,
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Error updating order:", error)
      toast({
        title: "Erreur de mise à jour",
        description: "Impossible de mettre à jour le statut de la commande. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  // Product management functions
  const handleCreateProduct = async (productData: { name: string; description: string; categoryId: string; imageUrl: string; locationPrices: Array<{ locationId: string; price: number; isAvailable: boolean; status?: 'new' | 'promotion' | null; discountPrice?: number }> }) => {
    setProductLoading(true)
    try {
      console.log("Sending product data:", productData)
      
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      console.log("Response status:", response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log("Success response:", result)
        await fetchProducts()
        setShowProductForm(false)
        toast({
          title: "Produit ajouté",
          description: "Le produit a été ajouté avec succès.",
          variant: "default",
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error("API Error response:", errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error("Error creating product:", error)
      toast({
        title: "Erreur",
        description: `Impossible d'ajouter le produit: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        variant: "destructive",
      })
    } finally {
      setProductLoading(false)
    }
  }

  const handleUpdateProduct = async (productData: { name: string; description: string; categoryId: string; imageUrl: string; locationPrices: Array<{ locationId: string; price: number; isAvailable: boolean; status?: 'new' | 'promotion' | null; discountPrice?: number }> }) => {
    if (!editingProduct) return

    setProductLoading(true)
    try {
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      if (response.ok) {
        await fetchProducts()
        setEditingProduct(null)
        setShowProductForm(false)
        toast({
          title: "Produit mis à jour",
          description: "Le produit a été mis à jour avec succès.",
          variant: "default",
        })
      } else {
        throw new Error("Failed to update product")
      }
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le produit. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setProductLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchProducts()
        toast({
          title: "Produit supprimé",
          description: "Le produit a été supprimé avec succès.",
          variant: "default",
        })
      } else {
        throw new Error("Failed to delete product")
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit. Veuillez réessayer.",
        variant: "destructive",
      })
    }
  }

  // Replace handleDeleteOrder to not confirm, just delete
  const handleDeleteOrder = async (trackingId: string) => {
    try {
      const response = await fetch(`/api/orders/${trackingId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        await fetchOrders(selectedDate)
        toast({
          title: "Commande supprimée",
          description: "La commande a été supprimée avec succès.",
          variant: "default",
        })
      } else {
        throw new Error("Failed to delete order")
      }
    } catch (error) {
      console.error("Error deleting order:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la commande. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setOrderToDelete(null)
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

  // Filtered orders by status
  const filteredOrders = orders.filter(order => {
    const statusOk = selectedStatus === 'all' || order.status === selectedStatus
    const locationOk = selectedLocationFilter === 'all' || order.locationId === selectedLocationFilter || order.locationName === selectedLocationFilter
    return statusOk && locationOk
  })

  if (!mounted || loading) {
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
        {/* Filter Section */}
        <Card className="mb-6 shadow-md border-0">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Calendar className="w-4 h-4 text-amber-700" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="border rounded px-2 py-1 font-body text-base focus:ring-2 focus:ring-green-200 focus:border-green-400 transition w-full sm:w-auto"
                  max={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-amber-700" />
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className="border rounded px-2 py-1 font-body text-base focus:ring-2 focus:ring-green-200 focus:border-green-400 transition w-full sm:w-auto"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="En préparation">En préparation</option>
                  <option value="En cours de livraison">En cours de livraison</option>
                  <option value="Livré">Livré</option>
                  <option value="Annulé">Annulé</option>
                </select>
              </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-amber-700" />
              <select
                value={selectedLocationFilter}
                onChange={e => setSelectedLocationFilter(e.target.value)}
                className="border rounded px-2 py-1 font-body text-base focus:ring-2 focus:ring-green-200 focus:border-green-400 transition w-full sm:w-auto"
              >
                <option value="all">Tous les emplacements</option>
                {/* Build location options from orders we have */}
                {Array.from(new Set(orders.map(o => `${o.locationId || ''}::${o.locationName || ''}`)))
                  .filter(key => key !== '::')
                  .map(key => {
                    const [id, name] = key.split('::')
                    const value = id || name
                    const label = name || id || 'Sans emplacement'
                    return <option key={key} value={value}>{label}</option>
                  })}
              </select>
            </div>
              <Button
                onClick={refreshData}
                disabled={refreshing}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Actualisation...' : 'Actualiser'}
              </Button>
            </div>
          </CardContent>
        </Card>
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
                  <TableHead>Magasin</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Articles</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.trackingId}</TableCell>
                    <TableCell>{order.locationName || <span className="text-gray-400">-</span>}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>{order.items.length} article(s)</TableCell>
                    <TableCell>{formatPrice(order.totalPrice)}</TableCell>
                    <TableCell>
                      <Badge key={order.id} className={getStatusColor(order.status)}>{order.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {order.customerPhone || order.phone ? (
                        <a href={`tel:${order.customerPhone || order.phone}`} className="text-blue-600 underline">
                          {order.customerPhone || order.phone}
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
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
                      <Button
                        variant="destructive"
                        size="sm"
                        className="ml-2"
                        onClick={() => {
                          setOrderToDelete(order)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        Supprimer
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="ml-2"
                        asChild
                      >
                        <a
                          href={`/suivi?tracking=${order.trackingId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Voir la commande
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {/* Custom Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-w-sm rounded-xl p-6">
            <div className="flex flex-col items-center text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mb-2" />
              <h3 className="text-lg font-bold text-amber-900 mb-2">Confirmer la suppression</h3>
              <p className="text-amber-800 mb-4">Êtes-vous sûr de vouloir supprimer la commande <span className="font-semibold">#{orderToDelete?.trackingId}</span> ? Cette action est irréversible.</p>
              <div className="flex gap-4 mt-2">
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="rounded-full px-6">Annuler</Button>
                <Button variant="destructive" onClick={() => orderToDelete && handleDeleteOrder(orderToDelete.trackingId)} className="rounded-full px-6">Supprimer</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Category Management Section */}
        <div className="my-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestion des Catégories</h2>
          <p className="text-gray-600 mb-4">Ajoutez, supprimez et gérez vos catégories de produits</p>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={categoryName}
              onChange={e => setCategoryName(e.target.value)}
              placeholder="Nom de la catégorie"
              className="border rounded px-3 py-2 w-64"
              disabled={categoryLoading}
            />
            <Button onClick={handleAddCategory} disabled={categoryLoading || !categoryName.trim()}>
              Ajouter
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center bg-gray-100 rounded px-3 py-1">
                <span className="mr-2 font-medium">{cat.name}</span>
                <span className="text-xs text-gray-400 mr-2">({cat.slug})</span>
                <Button size="sm" variant="destructive" onClick={() => handleDeleteCategory(cat.id)} disabled={categoryLoading}>
                  Supprimer
                </Button>
              </div>
            ))}
            {categories.length === 0 && <span className="text-gray-400">Aucune catégorie</span>}
          </div>
        </div>

        {/* Service Fees Management Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Frais de service</CardTitle>
            <CardDescription>Définissez les frais de service appliqués à chaque commande (en DA).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <input
                type="number"
                min="0"
                ref={serviceFeesInputRef}
                value={serviceFeesInput}
                onChange={e => setServiceFeesInput(e.target.value)}
                className="border rounded px-3 py-2 w-32 text-lg font-bold text-green-700"
                disabled={serviceFeesLoading}
              />
              <Button onClick={handleUpdateServiceFees} disabled={serviceFeesLoading} className="bg-green-600 hover:bg-green-700 text-white">
                {serviceFeesLoading ? "Enregistrement..." : "Enregistrer"}
              </Button>
              {serviceFees !== null && (
                <span className="text-gray-500 ml-2">Actuel: <span className="font-semibold text-green-700">{serviceFees} DA</span></span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Store Business Hours Section */}
        <Card className="mb-8 border-2 border-green-600">
          <CardHeader>
            <CardTitle>Heures d'ouverture du magasin</CardTitle>
            <CardDescription>Définissez les heures d'ouverture et de fermeture du magasin (heure locale Algérie, format 24h).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="openTime">Heure d’ouverture</Label>
                <input
                  id="openTime"
                  type="time"
                  value={openTime}
                  onChange={e => setOpenTime(e.target.value)}
                  className="border rounded px-3 py-2 w-28 text-lg font-bold text-green-700"
                  disabled={storeSettingsLoading}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="closeTime">Heure de fermeture</Label>
                <input
                  id="closeTime"
                  type="time"
                  value={closeTime}
                  onChange={e => setCloseTime(e.target.value)}
                  className="border rounded px-3 py-2 w-28 text-lg font-bold text-green-700"
                  disabled={storeSettingsLoading}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="isDeliveryAvailable">Service de livraison disponible</Label>
                <input
                  id="isDeliveryAvailable"
                  type="checkbox"
                  checked={isDeliveryAvailable}
                  onChange={e => handleUpdateDeliveryAvailable(e.target.checked)}
                  className="accent-green-600 w-5 h-5"
                  disabled={storeSettingsLoading}
                />
                {isDeliveryAvailable ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-semibold ml-1">Disponible</span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold ml-1">Indisponible</span>
                )}
              </div>
              <Button onClick={handleUpdateStoreSettings} disabled={storeSettingsLoading} className="bg-green-600 hover:bg-green-700 text-white">
                {storeSettingsLoading ? "Enregistrement..." : "Enregistrer"}
              </Button>
              <span className="text-gray-500 ml-2">Actuel: <span className="font-semibold text-green-700">{openTime} – {closeTime}</span></span>
            </div>
          </CardContent>
        </Card>

        {/* Paramètres du Magasin Section */}
        <Card className="mb-8 border-2 border-green-600 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle>Paramètres du Magasin</CardTitle>
            <CardDescription>Définissez les horaires d'ouverture et le texte de la section héro.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="openTime">Heure d'ouverture</Label>
                <Input id="openTime" type="time" value={openTime} onChange={e => setOpenTime(e.target.value)} className="mb-4" />
                <Label htmlFor="closeTime">Heure de fermeture</Label>
                <Input id="closeTime" type="time" value={closeTime} onChange={e => setCloseTime(e.target.value)} className="mb-4" />
              </div>
              <div>
                <Label htmlFor="heroSubtitle">Sous-titre de la section héro</Label>
                <Input id="heroSubtitle" type="text" value={heroSubtitle} onChange={e => setHeroSubtitle(e.target.value)} className="mb-4" />
                <Label htmlFor="heroDescription">Description de la section héro</Label>
                <textarea id="heroDescription" value={heroDescription} onChange={e => setHeroDescription(e.target.value)} className="w-full min-h-[80px] border rounded p-2" />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={handleUpdateStoreSettings} disabled={storeSettingsLoading} className="bg-green-600 hover:bg-green-700 text-white shadow rounded-lg">
                {storeSettingsLoading ? "Enregistrement..." : "Enregistrer les paramètres"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Paramètres des Frais de Livraison Section */}
        <Card className="mb-8 border-2 border-green-600 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle>Paramètres des Frais de Livraison</CardTitle>
            <CardDescription>Définissez les intervalles de distance et les frais associés (en DA).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border rounded-xl shadow-md overflow-hidden">
                <thead className="bg-gray-100 text-gray-800 font-semibold sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3">De (km)</th>
                    <th className="px-4 py-3">À (km)</th>
                    <th className="px-4 py-3">Frais (DA)</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {deliverySettings.map((interval, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      {editingIndex === idx ? (
                        <>
                          <td className="px-4 py-2"><Input type="number" min={0} value={newInterval.min} onChange={e => setNewInterval({ ...newInterval, min: Number(e.target.value) })} className="w-20" /></td>
                          <td className="px-4 py-2"><Input type="number" min={0} value={newInterval.max} onChange={e => setNewInterval({ ...newInterval, max: Number(e.target.value) })} className="w-20" /></td>
                          <td className="px-4 py-2"><Input type="number" min={0} value={newInterval.fee} onChange={e => setNewInterval({ ...newInterval, fee: Number(e.target.value) })} className="w-24" /></td>
                          <td className="px-4 py-2 text-right space-x-2">
                            <Button size="icon" onClick={handleSaveEdit} className="bg-green-600 hover:bg-green-700 text-white"><Edit className="w-4 h-4" /></Button>
                            <Button size="icon" variant="outline" onClick={() => setEditingIndex(null)}><span className="sr-only">Annuler</span>✕</Button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-2 text-center">{interval.min}</td>
                          <td className="px-4 py-2 text-center">{interval.max}</td>
                          <td className="px-4 py-2 text-center">{interval.fee}</td>
                          <td className="px-4 py-2 text-right space-x-2">
                            <Button size="icon" variant="outline" onClick={() => handleEditInterval(idx)}><Edit className="w-4 h-4" /></Button>
                            <Button size="icon" variant="destructive" onClick={() => handleRemoveInterval(idx)} disabled={deliverySettings.length === 1}><Trash2 className="w-4 h-4" /></Button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                  {editingIndex === null && (
                    <tr className="bg-green-50">
                      <td className="px-4 py-2"><Input type="number" min={0} value={newInterval.min} onChange={e => setNewInterval({ ...newInterval, min: Number(e.target.value) })} className="w-20" /></td>
                      <td className="px-4 py-2"><Input type="number" min={0} value={newInterval.max} onChange={e => setNewInterval({ ...newInterval, max: Number(e.target.value) })} className="w-20" /></td>
                      <td className="px-4 py-2"><Input type="number" min={0} value={newInterval.fee} onChange={e => setNewInterval({ ...newInterval, fee: Number(e.target.value) })} className="w-24" /></td>
                      <td className="px-4 py-2 text-right">
                        <Button size="icon" onClick={handleAddInterval} disabled={newInterval.max <= newInterval.min || newInterval.fee < 0} className="bg-green-600 hover:bg-green-700 text-white"><Plus className="w-4 h-4" /></Button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={handleSaveDeliverySettings} disabled={deliverySettingsLoading} className="bg-green-600 hover:bg-green-700 text-white shadow rounded-lg">
                {deliverySettingsLoading ? "Enregistrement..." : "Enregistrer les intervalles"}
              </Button>
            </div>
            {deliverySettings.length === 0 && (
              <div className="text-red-600 mt-2">Au moins un intervalle est requis.</div>
            )}
          </CardContent>
        </Card>

        {/* Promotion/New Products Management Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Promotion / Nouveaux Produits</CardTitle>
            <CardDescription>Sélectionnez les produits à mettre en avant sur la page d'accueil.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(product => (
                <div key={product.id} className={`relative border rounded-lg p-3 flex flex-col items-center ${promotedProducts.includes(product.id) ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}>
                  {/* Removed product image display */}
                  <div className="text-center mb-2">
                    <div className="font-semibold text-amber-900 text-base truncate w-32">{product.name}</div>
                    <div className="text-xs text-gray-500">
                      {product.locationPrices && product.locationPrices.length > 0 
                        ? `${product.locationPrices.length} emplacement(s)` 
                        : 'Aucun emplacement'}
                    </div>
                    {product.locationPrices && product.locationPrices.every(lp => !lp.isAvailable) && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-gray-200 text-gray-500 text-xs font-semibold">Indisponible</span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant={promotedProducts.includes(product.id) ? "secondary" : "outline"}
                    className="w-full"
                    onClick={() => handleTogglePromoted(product.id)}
                    disabled={promotedLoading}
                  >
                    {promotedProducts.includes(product.id) ? (
                      <span className="flex items-center gap-1 text-green-700"><BadgeCheck className="w-4 h-4" /> Retirer</span>
                    ) : (
                      <span>Mettre en avant</span>
                    )}
                  </Button>
                  {promotedProducts.includes(product.id) && (
                    <span className="absolute top-2 right-2"><Badge className="bg-green-600 text-white">En avant</Badge></span>
                  )}
                </div>
              ))}
              {products.length === 0 && <span className="text-gray-400">Aucun produit</span>}
            </div>
          </CardContent>
        </Card>

        {/* Location Management Section */}
        <div className="mt-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Gestion des Emplacements</h2>
            <p className="text-gray-600">Gérez vos magasins et leurs coordonnées</p>
          </div>
          <LocationManager onLocationsChange={refreshData} />
        </div>

        {/* Product Management Section */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Gestion des Produits</h2>
              <p className="text-gray-600">Ajoutez, modifiez et supprimez vos produits</p>
            </div>
            <Button
              onClick={() => {
                setEditingProduct(null)
                setShowProductForm(true)
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Ajouter un Produit
            </Button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              // Get the first available location for display purposes
              const firstLocation = product.locationPrices?.[0]
              const hasPromotion = product.locationPrices?.some(lp => lp.status === 'promotion')
              const hasNew = product.locationPrices?.some(lp => lp.status === 'new')
              const allUnavailable = product.locationPrices && product.locationPrices.every(lp => !lp.isAvailable)
              return (
                <Card key={product.id} className="overflow-hidden relative">
                  <div className="relative h-48 bg-gray-100">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    {/* BADGES */}
                    {hasNew && (
                      <span className="absolute top-2 left-2 z-10"><Badge className="bg-green-600 text-white">Nouveau</Badge></span>
                    )}
                    {hasPromotion && (
                      <span className="absolute top-2 right-2 z-10"><Badge className="bg-red-600 text-white">Promo</Badge></span>
                    )}
                    {allUnavailable && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-gray-200 text-gray-500 text-xs font-semibold">Indisponible actuellement</span>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                      <div className="flex justify-between items-center">
                        {firstLocation ? (
                          hasPromotion && firstLocation.discountPrice ? (
                            <>
                              <span className="font-bold text-green-600">{firstLocation.discountPrice} DA</span>
                              <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold line-through">{firstLocation.price} DA</span>
                            </>
                          ) : (
                            <span className="font-bold text-green-600">{firstLocation.price} DA</span>
                          )
                        ) : (
                          <span className="text-gray-500 text-sm">Aucun prix</span>
                        )}
                        <Badge key={product.id} variant="secondary">
                          {categories.find(c => c.id === (product.categoryId || product.category))?.name || "Sans catégorie"}
                        </Badge>
                      </div>
                      <div className="flex justify-end space-x-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingProduct(product)
                            setShowProductForm(true)
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )})}
            {products.length === 0 && (
              <Card className="p-8 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun produit</h3>
                <p className="text-gray-600 mb-4">Commencez par ajouter votre premier produit</p>
                <Button
                  onClick={() => {
                    setEditingProduct(null)
                    setShowProductForm(true)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un Produit
                </Button>
              </Card>
            )}
          </div>
        </div>

        {/* Product Form Modal */}
        {showProductForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <ProductForm
                categories={categories}
                onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
                product={editingProduct}
                loading={productLoading}
                onClose={() => setShowProductForm(false)}
              />
            </div>
          </div>
        )}
      </div>
      <Toaster />
    </div>
  )
}
