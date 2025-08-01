"use client"

import { useState, useEffect, useRef } from "react"
import dynamic from 'next/dynamic'

// Import structured data as a dynamic component with SSR enabled
const CartStructuredData = dynamic(() => import('./structured-data'), { ssr: true })
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, MapPin, Truck, Store, Pencil, ArrowDown, Clock } from "lucide-react"
import Link from "next/link"
import { useCartStore } from "@/lib/cart-store"
import type { CartItem } from "@/lib/cart-store"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"
import { fetchStoreHours, isStoreClosed, getDistanceKm } from '@/lib/utils'
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface DeliverySetting { min: number; max: number; fee: number }

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
  const [validationError, setValidationError] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [deliveryMethod, setDeliveryMethod] = useState<'livraison' | 'surplace'>('surplace')
  const [locationUrl, setLocationUrl] = useState("")
  const [locationError, setLocationError] = useState("")
  const [locationLoading, setLocationLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<CartItem | null>(null)
  const [serviceFees, setServiceFees] = useState(0);
  const [openTime, setOpenTime] = useState('08:00');
  const [closeTime, setCloseTime] = useState('23:00');
  const [storeClosed, setStoreClosed] = useState(false);
  const [isDeliveryAvailable, setIsDeliveryAvailable] = useState(true);
  const STORE_COORDS = { lat: 36.7338212, lon: 3.1742928 };
  const [deliverySettings, setDeliverySettings] = useState<DeliverySetting[]>([]);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const { toast } = useToast();
  const [showReview, setShowReview] = useState(false);
  const [showScrollArrow, setShowScrollArrow] = useState(false);
  const scrollArrowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getHoursAndFees = async () => {
      const hours = await fetchStoreHours()
      setOpenTime(hours.openTime)
      setCloseTime(hours.closeTime)
      setStoreClosed(isStoreClosed(hours.openTime, hours.closeTime))
      // Also fetch service fees, delivery availability, and delivery settings
      const res = await fetch("/api/config");
      const data = await res.json();
      setServiceFees(data.serviceFees || 0);
      setIsDeliveryAvailable(
        typeof data.storeSettings?.isDeliveryAvailable === "boolean"
          ? data.storeSettings.isDeliveryAvailable
          : true
      );
      setDeliverySettings(data.deliverySettings || []);
    };
    getHoursAndFees();
    const interval = setInterval(getHoursAndFees, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const getHours = async () => {
      const hours = await fetchStoreHours()
      setOpenTime(hours.openTime)
      setCloseTime(hours.closeTime)
      setStoreClosed(isStoreClosed(hours.openTime, hours.closeTime))
    }
    getHours()
    const interval = setInterval(getHours, 60000)
    return () => clearInterval(interval)
  }, []);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id)
    } else {
      updateQuantity(id, newQuantity)
    }
  }

  const validatePhone = (phone: string) => {
    const phonePattern = /^0[5-7]\d{8}$/;
    if (!phonePattern.test(phone.trim())) {
      setPhoneError("Numéro invalide. Veuillez entrer un numéro à 10 chiffres commençant par 05, 06 ou 07.");
      return false;
    }
    setPhoneError("");
    return true;
  };


  // Show toast when switching to livraison
  const handleDeliveryMethodChange = (method: 'livraison' | 'surplace') => {
    setDeliveryMethod(method);
    if (method === 'livraison') {
      toast({
        title: 'Information',
        description: 'Vous devez partager votre position pour la livraison.',
        duration: Infinity,
      });
    }
  };

  // Show toast when user shares location and delivery fee is set
  const handleShareLocation = () => {
    setLocationError("");
    setLocationLoading(true);
    if (!navigator.geolocation) {
      setLocationError("La géolocalisation n'est pas supportée par votre navigateur.");
      setLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lon: longitude });
        const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setLocationUrl(url);
        setLocationLoading(false);
        if (deliverySettings.length >= 0) {
          const distance = getDistanceKm(latitude, longitude, STORE_COORDS.lat, STORE_COORDS.lon);
          const found = deliverySettings.find((d) => distance >= d.min && distance < d.max);
          if (found) {
            setDeliveryFee(found.fee);
            setLocationError("");
            toast({
              title: 'Livraison',
              description: `Frais de livraison ajoutés au total : ${found.fee} DA`,
              duration: Infinity,
            });
          } else {
            setDeliveryFee(0);
            setLocationError("La distance dépasse notre zone de livraison.");
          }
        }
      },
      (error) => {
        setLocationError("Impossible de récupérer votre position. Veuillez autoriser l'accès à la localisation.");
        setLocationLoading(false);
      }
    );
  };

  useEffect(() => {
    // If userCoords or deliverySettings change, recalculate delivery fee
    if (userCoords && deliverySettings.length > 0 && deliveryMethod === "livraison") {
      const distance = getDistanceKm(userCoords.lat, userCoords.lon, STORE_COORDS.lat, STORE_COORDS.lon);
      console.log("User position:", userCoords.lat, userCoords.lon);
      console.log("Calculated distance (km):", distance);
      console.log("Delivery intervals from DB:", deliverySettings);
      const found = deliverySettings.find((d) => distance >= d.min && distance < d.max);
      console.log("Matched interval:", found);
      if (found) {
        setDeliveryFee(found.fee);
        setLocationError("");
        console.log("Applied delivery fee:", found.fee);
      } else {
        setDeliveryFee(0);
        setLocationError("La distance dépasse notre zone de livraison.");
        console.log("No interval matched. Delivery not available.");
      }
    } else if (deliveryMethod === "surplace") {
      setDeliveryFee(0);
      setLocationError("");
    }
  }, [userCoords, deliverySettings, deliveryMethod]);

  const validateForm = () => {
    if (!customerInfo.name.trim() || !customerInfo.phone.trim() || (deliveryMethod === 'livraison' && !locationUrl)) {
      setValidationError("Veuillez remplir tous les champs obligatoires.")
      return false
    }
    if (!validatePhone(customerInfo.phone)) {
      setValidationError("")
      return false
    }
    setValidationError("")
    return true
  }

  const isFormValid =
    customerInfo.name.trim() &&
    customerInfo.phone.trim() &&
    (deliveryMethod === 'surplace' || locationUrl) &&
    !phoneError &&
    termsAccepted &&
    !loading

  const totalWithFees = getTotalPrice() + serviceFees + (deliveryMethod === "livraison" ? deliveryFee : 0);

  const handleSubmitOrder = async () => {
    // Re-check storeClosed before submitting
    const hours = await fetchStoreHours()
    if (isStoreClosed(hours.openTime, hours.closeTime)) {
      setValidationError(`Le magasin est actuellement fermé. Heures d’ouverture : ${hours.openTime} – ${hours.closeTime}.`)
      return
    }
    if (!termsAccepted) {
      setValidationError("terms")
      return
    }
    if (!validateForm()) return
    if (items.length === 0) {
      setValidationError("Votre panier est vide.")
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
          image: item.image,
        })),
        deliveryAddress: deliveryMethod === "surplace" ? "Sur place" : locationUrl,
        totalPrice: totalWithFees,
        serviceFees,
        deliveryFee: deliveryMethod === "livraison" ? deliveryFee : 0,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerNotes: customerInfo.notes,
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
        .join("\n");
      const addressText = deliveryMethod === "surplace" ? "Sur place (à retirer chez ElBasta)" : locationUrl ? locationUrl : "[Adresse non fournie]";
      const feeLines = [
        `Sous-total : ${getTotalPrice()} DA`,
        deliveryMethod === "livraison" ? `Frais de livraison : ${deliveryFee} DA` : null,
        `Frais de service : ${serviceFees} DA`,
        `Total : ${totalWithFees} DA`,
      ].filter(Boolean).join("\n");
      const message = `🛍️ *Nouvelle Commande - ElBasta*\n\n🆔 *Code de commande: ${data.trackingId}*\n\n📋 *Détails de la commande:*\n${orderDetails}\n\n${feeLines}\n\n👤 *Informations client:*\n• Nom: ${customerInfo.name}\n• Téléphone: ${customerInfo.phone}\n• Adresse: ${addressText}\n${customerInfo.notes ? `• Notes: ${customerInfo.notes}` : ""}\n\n🔍 *ID de suivi: ${data.trackingId}*\n📱 *Lien de suivi: ${typeof window !== "undefined" ? window.location.origin : ""}/suivi?tracking=${data.trackingId} *\n\nMerci pour votre commande ! 🙏`;

      const whatsappUrl = `https://wa.me/213665258642?text=${encodeURIComponent(message)}`

      // Clear cart
      clearCart()

      // Detect mobile
      const isMobile = typeof window !== 'undefined' && /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(window.navigator.userAgent)
      if (typeof window !== "undefined") {
        if (isMobile) {
          window.location.href = whatsappUrl
        } else {
          window.open(whatsappUrl, "_blank")
        }
        setTimeout(() => {
          router.push(`/suivi?tracking=${data.trackingId}`)
        }, 2500)
      }
    } catch (error) {
      console.error("Error submitting order:", error)
      setValidationError("Erreur lors de la commande. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return `${price.toFixed(0)} DA`
  }

  // Helper for display
  const deliveryMethodLabel = deliveryMethod === 'surplace' ? 'Commande sur place' : 'Livraison à domicile';

  // Only allow review if form is valid
  const handleShowReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) setShowReview(true);
  };

  // Modified submit: only runs after review confirm
  const handleConfirmOrder = async () => {
    await handleSubmitOrder();
    setShowReview(false);
  };

  // Scroll arrow logic
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      // Show arrow if not at bottom (with 40px threshold)
      setShowScrollArrow(scrollY + windowHeight < docHeight - 40);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const handleScrollArrowClick = () => {
    // Scroll to next section or bottom
    const y = window.scrollY;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    // Try to scroll to next section (review card or bottom)
    let nextY = y + windowHeight * 0.8;
    if (nextY > docHeight - windowHeight) nextY = docHeight;
    window.scrollTo({ top: nextY, behavior: 'smooth' });
  };

  // Enhanced arrow style
  const arrowGradient = "bg-gradient-to-b from-green-100 via-white to-green-50";
  const arrowShadow = "shadow-xl";
  const arrowGlow = "ring-2 ring-green-300/40";
  const arrowAnim = "animate-bounce-slow";
  // Custom bounce animation
  // Add this to your global CSS if not present:
  // @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
  // .animate-bounce-slow { animation: bounce-slow 1.6s infinite; }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream-50 pt-24">
        <div className="max-w-2xl mx-auto px-6 py-8 text-center">
          {storeClosed && (
            <div className="bg-red-100 text-red-800 text-center py-2 font-semibold mb-4">
              Le magasin est actuellement fermé. Heures d’ouverture : {openTime} – {closeTime}.
            </div>
          )}
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
      {/* Structured Data */}
      <CartStructuredData />

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

        {/* Store Timing Display */}
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-amber-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-amber-900 font-body">Horaires d'Ouverture</h3>
              <p className="text-xl font-bold text-green-600 font-body">
                {openTime} - {closeTime}
                {storeClosed && (
                  <span className="ml-3 text-red-600 font-semibold">(Fermé actuellement)</span>
                )}
              </p>
            </div>
          </div>
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
                  <div key={item.id} className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="relative overflow-hidden rounded-lg shadow-md border border-gray-200 w-24 h-24 flex-shrink-0 mb-2 sm:mb-0">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                        priority
                      />
                    </div>
                    <div className="flex-1 w-full">
                      <h3 className="font-semibold text-amber-900 font-body text-base sm:text-lg">{item.name}</h3>
                      <p className="text-sm text-amber-700 font-body">{item.category}</p>
                      <p className="text-sm font-semibold text-green-600 font-body">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center space-x-2 mt-2 sm:mt-0">
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
                        onClick={() => {
                          setItemToDelete(item)
                          setDeleteDialogOpen(true)
                        }}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Separator />
                <div className="flex justify-between items-center text-base font-body">
                  <span className="text-amber-900">Sous-total</span>
                  <span className="text-green-700">{getTotalPrice()} DA</span>
                </div>
                {deliveryMethod === "livraison" && (
                  <div className="flex justify-between items-center text-base font-body">
                    <span className="text-amber-900">Frais de livraison</span>
                    <span className="text-green-700">{deliveryFee} DA</span>
                  </div>
                )}
                {deliveryMethod === "livraison" && locationError && (
                  <div className="text-red-600 text-sm font-body mt-1">{locationError}</div>
                )}
                <div className="flex justify-between items-center text-base font-body">
                  <span className="text-amber-900">Frais de service</span>
                  <span className="text-green-700">{serviceFees} DA</span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold">
                  <span className="text-amber-900 font-body">Total</span>
                  <span className="text-green-600 font-body">{totalWithFees} DA</span>
                </div>
              </CardContent>
            </Card>
            <Button
              className="w-full mt-4 flex items-center justify-center gap-2 bg-amber-900 hover:bg-amber-800 text-white font-body"
              onClick={() => router.push("/")}
            >
              <Plus className="w-4 h-4" />
              Ajouter un produit
            </Button>
          </div>

          {/* Customer Information or Review Card */}
          <div className="space-y-6">
            {!showReview ? (
              <form onSubmit={handleShowReview}>
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-2xl font-accent text-amber-900">Informations de livraison</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-base sm:text-lg">
                    {validationError && (
                      <div className="bg-red-100 text-red-700 rounded px-3 py-2 mb-2 text-center font-body text-sm">
                        {validationError === "terms" ? "Vous devez accepter les conditions générales." : validationError}
                      </div>
                    )}
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
                        onChange={(e) => {
                          setCustomerInfo({ ...customerInfo, phone: e.target.value })
                          validatePhone(e.target.value)
                        }}
                        className={`mt-1 font-body ${phoneError ? "border-red-500" : ""}`}
                        placeholder="Ex: 0770 22 44 72"
                        aria-invalid={!!phoneError}
                      />
                      {phoneError && (
                        <div className="text-red-600 text-sm font-body mt-1">{phoneError}</div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label className="text-amber-900 font-body font-semibold">Mode de réception *</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="relative cursor-pointer group block">
                          <input
                            type="radio"
                            name="deliveryMethod"
                            value="livraison"
                            checked={deliveryMethod === 'livraison'}
                            onChange={() => isDeliveryAvailable && handleDeliveryMethodChange('livraison')}
                            disabled={!isDeliveryAvailable}
                            className="sr-only"
                          />
                          <div className={`min-h-[7rem] w-full p-4 rounded-xl border-2 transition-all duration-200 group-hover:shadow-lg flex flex-col justify-center
                            ${deliveryMethod === 'livraison' 
                              ? 'border-green-500 bg-green-50 shadow-md' 
                              : 'border-gray-200 bg-white hover:border-green-300'
                            }${!isDeliveryAvailable ? ' opacity-50 cursor-not-allowed' : ''}`}>
                            <div className="flex items-center gap-3 h-full">
                              <div className={`p-2 rounded-lg flex-shrink-0
                                ${deliveryMethod === 'livraison' 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-gray-100 text-gray-600'
                                }`}>
                                <Truck className="w-6 h-6 md:w-7 md:h-7" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-amber-900 font-body text-base md:text-lg">Livraison à domicile</div>
                                <div className="text-amber-700 font-body text-sm mt-1">Livraison directe chez vous</div>
                                {!isDeliveryAvailable && (
                                  <div className="text-red-600 text-xs font-body mt-1 font-semibold">Le service de livraison est actuellement indisponible. Veuillez choisir 'Commande sur place'.</div>
                                )}
                              </div>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                                ${deliveryMethod === 'livraison' 
                                  ? 'border-green-500 bg-green-500' 
                                  : 'border-gray-300'
                                }`}>
                                {deliveryMethod === 'livraison' && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                                )}
                              </div>
                            </div>
                          </div>
                        </label>
                        <label className="relative cursor-pointer group block">
                          <input
                            type="radio"
                            name="deliveryMethod"
                            value="surplace"
                            checked={deliveryMethod === 'surplace'}
                            onChange={() => handleDeliveryMethodChange('surplace')}
                            className="sr-only"
                          />
                          <div className={`min-h-[7rem] w-full p-4 rounded-xl border-2 transition-all duration-200 group-hover:shadow-lg flex flex-col justify-center
                            ${deliveryMethod === 'surplace' 
                              ? 'border-green-500 bg-green-50 shadow-md' 
                              : 'border-gray-200 bg-white hover:border-green-300'
                            }`}>
                            <div className="flex items-center gap-3 h-full">
                              <div className={`p-2 rounded-lg flex-shrink-0
                                ${deliveryMethod === 'surplace' 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-gray-100 text-gray-600'
                                }`}>
                                <Store className="w-6 h-6 md:w-7 md:h-7" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-amber-900 font-body text-base md:text-lg">Commande sur place</div>
                                <div className="text-amber-700 font-body text-sm mt-1">À retirer chez ElBasta</div>
                              </div>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                                ${deliveryMethod === 'surplace' 
                                  ? 'border-green-500 bg-green-500' 
                                  : 'border-gray-300'
                                }`}>
                                {deliveryMethod === 'surplace' && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                                )}
                              </div>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {deliveryMethod === 'livraison' && (
                      <div>
                        <Label className="text-amber-900 font-body font-semibold">Adresse de livraison *</Label>
                        <Button
                          type="button"
                          className="mb-2 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-body rounded-full shadow px-4 py-2 transition-all duration-200"
                          onClick={handleShareLocation}
                          disabled={locationLoading}
                        >
                          <MapPin className="w-4 h-4" />
                          {locationLoading ? "Récupération..." : "Partager ma position"}
                        </Button>
                        {locationUrl && (
                          <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-green-800 font-body text-sm">
                            <MapPin className="w-4 h-4 text-green-600" />
                            Position partagée :
                            <a href={locationUrl} target="_blank" rel="noopener noreferrer" className="underline text-green-700">Voir sur la carte</a>
                          </div>
                        )}
                        {locationError && (
                          <div className="mt-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-700 font-body text-sm flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-red-600" />
                            {locationError}
                          </div>
                        )}
                      </div>
                    )}

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

                    <div className="flex items-center space-x-2 mt-2">
                      <input
                        id="terms"
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={e => setTermsAccepted(e.target.checked)}
                        className="accent-green-600 w-4 h-4"
                        required
                      />
                      <label htmlFor="terms" className="text-sm font-body">
                        J'accepte les <Link href="/conditions" target="_blank" className="underline text-green-700">conditions générales</Link>
                      </label>
                    </div>
                    {!termsAccepted && validationError === "terms" && (
                      <div className="text-red-600 text-sm font-body mt-1">Vous devez accepter les conditions générales.</div>
                    )}

                    <Button
                      type="submit"
                      disabled={!isFormValid || storeClosed}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-body text-lg py-3 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? "Commande en cours..." : "Vérifier et confirmer"}
                    </Button>
                    <p className="text-sm text-amber-700 font-body text-center">
                      En confirmant, vous serez redirigé vers WhatsApp pour finaliser votre commande.
                    </p>
                  </CardContent>
                </Card>
              </form>
            ) : (
              <Card className="shadow-lg border-2 border-green-500">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-2xl font-accent text-amber-900">Revue de la commande</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setShowReview(false)} title="Modifier" className="text-green-700 hover:bg-green-100">
                    <Pencil className="w-5 h-5" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6 text-base sm:text-lg">
                  {/* Vos Informations */}
                  <div>
                    <div className="font-semibold text-amber-900 mb-1">Vos Informations</div>
                    <div className="pl-2 text-amber-800">
                      <div>Nom : <span className="font-medium">{customerInfo.name}</span></div>
                      <div>Téléphone : <span className="font-medium">{customerInfo.phone}</span></div>
                      {deliveryMethod === 'livraison' && locationUrl && (
                        <div>Adresse : <a href={locationUrl} target="_blank" rel="noopener noreferrer" className="underline text-green-700">Voir sur la carte</a></div>
                      )}
                      {customerInfo.notes && (
                        <div>Notes : <span className="font-medium">{customerInfo.notes}</span></div>
                      )}
                    </div>
                  </div>
                  {/* Mode de réception */}
                  <div>
                    <div className="font-semibold text-amber-900 mb-1">Mode de réception</div>
                    <div className="pl-2 text-amber-800">{deliveryMethodLabel}</div>
                  </div>
                  {/* Frais */}
                  <div>
                    <div className="font-semibold text-amber-900 mb-1">Frais</div>
                    <div className="pl-2 text-amber-800 space-y-1">
                      {deliveryMethod === 'livraison' && (
                        <div>Frais de livraison : <span className="font-medium">{deliveryFee} DA</span></div>
                      )}
                      <div>Frais de service : <span className="font-medium">{serviceFees} DA</span></div>
                    </div>
                  </div>
                  {/* Total à payer */}
                  <div>
                    <div className="font-semibold text-amber-900 mb-1">Total à payer</div>
                    <div className="pl-2 text-green-700 text-xl font-bold">{totalWithFees} DA</div>
                  </div>
                  <Button
                    onClick={handleConfirmOrder}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-body text-lg py-3 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                  >
                    {loading ? "Commande en cours..." : "Confirmer la commande"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Toaster />
      {/* Scroll Down Arrow Indicator */}
      {showScrollArrow && (
        <div
          ref={scrollArrowRef}
          onClick={handleScrollArrowClick}
          className={`fixed left-1/2 -translate-x-1/2 z-40 bottom-8 md:bottom-10 flex items-center justify-center cursor-pointer select-none ${arrowAnim}`}
          style={{ pointerEvents: 'auto' }}
          aria-label="Faire défiler vers le bas"
        >
          <div
            className={`rounded-full ${arrowGradient} ${arrowShadow} ${arrowGlow} border border-green-200 p-3 md:p-4 hover:bg-green-50 transition-all duration-200 flex items-center justify-center`}
            style={{ boxShadow: '0 6px 32px 0 rgba(34,197,94,0.10), 0 1.5px 8px 0 rgba(0,0,0,0.10)' }}
          >
            <ArrowDown className="w-8 h-8 md:w-10 md:h-10 text-green-700 drop-shadow" strokeWidth={2.5} />
          </div>
        </div>
      )}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm rounded-xl p-6">
          <div className="flex flex-col items-center text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-2" />
            <h3 className="text-lg font-bold text-amber-900 mb-2">Confirmer la suppression</h3>
            <p className="text-amber-800 mb-4">Voulez-vous vraiment supprimer <span className="font-semibold">{itemToDelete?.name}</span> du panier ? Cette action est irréversible.</p>
            <div className="flex gap-4 mt-2">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="rounded-full px-6">Annuler</Button>
              <Button variant="destructive" onClick={() => { if (itemToDelete) { removeItem(itemToDelete.id); setDeleteDialogOpen(false); setItemToDelete(null); } }} className="rounded-full px-6">Supprimer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
