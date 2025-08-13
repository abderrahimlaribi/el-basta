"use client"

import Image from "next/image"
import dynamic from 'next/dynamic'

// Import structured data as a dynamic component with SSR disabled
const HomeStructuredData = dynamic(() => import('./structured-data'), { ssr: true })
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Search,
  Truck,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Package,
  Loader2,
  Sparkles,
  Percent,
  Clock,
} from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { CartIcon } from "@/components/cart-icon"
import { MenuItemCard } from "@/components/menu-item-card"
import { MobileHeader } from "@/components/mobile-header"
import { MobileFab } from "@/components/mobile-fab"
import { LocationSelector } from "@/components/location-selector"

import Link from "next/link"
import { getProducts, type Product } from "@/lib/database"
import { fetchStoreHours, isStoreClosed } from '@/lib/utils'
import { useCallback } from 'react'
import { useCartStore } from "@/lib/cart-store"

// Add types
interface Category { id: string; name: string; slug: string }

export default function TeaRoomLanding() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [promotedProducts, setPromotedProducts] = useState<Product[]>([])
  const promoSliderRef = useRef<HTMLDivElement>(null)
  const [openTime, setOpenTime] = useState('08:00')
  const [closeTime, setCloseTime] = useState('23:00')
  const [storeClosed, setStoreClosed] = useState(false)
  const [heroDescription, setHeroDescription] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const setCartLocation = useCartStore((state) => state.setLocation);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [catRes, hours, configRes] = await Promise.all([
          fetch("/api/categories"),
          fetchStoreHours(),
          fetch("/api/config?type=storeSettings")
        ])
        const catData = await catRes.json()
        const configData = await configRes.json()
        setCategories(catData.categories || [])
        setOpenTime(hours.openTime)
        setCloseTime(hours.closeTime)
        setStoreClosed(isStoreClosed(hours.openTime, hours.closeTime))
        setHeroDescription(configData.storeSettings.heroDescription || "Découvrez le mélange parfait de tranquillité et de goût avec nos thés soigneusement préparés, jus frais, crêpes artisanales et douceurs délicieuses.")
        setHeroSubtitle(configData.storeSettings.heroSubtitle || "Savourez des Moments Doux")
      } catch (err) {
        setError("Erreur lors du chargement du menu. Veuillez réessayer.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    // Optionally, set up interval to auto-refresh storeClosed every minute
    const interval = setInterval(async () => {
      const hours = await fetchStoreHours()
      setStoreClosed(isStoreClosed(hours.openTime, hours.closeTime))
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Fetch products when location changes
  useEffect(() => {
    const fetchProducts = async () => {
      if (!selectedLocation) return
      
      console.log(`🛍️ Fetching products for location: ${selectedLocation.id} (${selectedLocation.name})`)
      
      try {
        const [prodRes, promoRes] = await Promise.all([
          fetch(`/api/products/location/${selectedLocation.id}`),
          fetch("/api/config?type=promotedProducts")
        ])
        
        console.log(`📡 Product API response status: ${prodRes.status}`)
        
        const prodData = await prodRes.json()
        const promoData = await promoRes.json()
        
        console.log(`📦 Raw product data:`, prodData)
        console.log(`🎯 Promoted products data:`, promoData)
        
        // Map products for compatibility with MenuItemCard component
        const productsWithImages = (prodData.products || []).map((product: any) => ({
          ...product,
          image: product.imageUrl || product.image || "/placeholder.svg",
          // isAvailable is already set by getProductsByLocation based on location-specific data
        }))
        
        console.log(`🖼️ Processed products:`, productsWithImages)
        setProducts(productsWithImages)
        
        // Find promoted products by ID (include all, both available and unavailable)
        const promoIds = promoData.promotedProducts || []
        setPromotedProducts(productsWithImages.filter((p: Product) => promoIds.includes(p.id)))
      } catch (err) {
        console.error("Error fetching products for location:", err)
        setError("Erreur lors du chargement du menu pour cet emplacement. Veuillez réessayer.")
      }
    }
    
    fetchProducts()
  }, [selectedLocation])

  // Group products by category
  const productsByCategory: { [categoryId: string]: Product[] } = {}
  products.forEach(product => {
    // Include all products (both available and unavailable)
    // Find the category name from the categories array
    const category = categories.find(c => c.id === product.category || c.name === product.category)
    const categoryKey = category?.name || product.category || 'Uncategorized'
    if (!productsByCategory[categoryKey]) productsByCategory[categoryKey] = []
    productsByCategory[categoryKey].push(product)
  })

  // Fallback categories if none are loaded
  const fallbackCategories = [
    { id: 'jus-naturels', name: 'Jus Naturels', slug: 'jus-naturels' },
    { id: 'crepes', name: 'Crêpes', slug: 'crepes' },
    { id: 'cappuccinos', name: 'Cappuccinos', slug: 'cappuccinos' },
    { id: 'thes', name: 'Thés', slug: 'thes' }
  ]
  
  const displayCategories = categories.length > 0 ? categories : fallbackCategories

  // Filter out categories with no products at all
  const availableCategories = displayCategories.filter(cat => {
    const categoryProducts = productsByCategory[cat.name] || []
    return categoryProducts.length > 0
  })

  // Debug logging
  console.log('Products:', products.length)
  console.log('Available products:', products.filter(p => p.isAvailable).length)
  console.log('Unavailable products:', products.filter(p => !p.isAvailable).length)
  console.log('Product categories:', products.map(p => p.category))
  console.log('Available categories:', categories.map(c => ({ id: c.id, name: c.name })))
  console.log('Products by category:', productsByCategory)
  console.log('Available categories with products:', availableCategories.map(c => ({ name: c.name, count: productsByCategory[c.name]?.length || 0 })))

  const galleryImages = [
    "/images/gallery-interior.jpg",
    "/images/gallery-coffee-prep.jpg",
    "/images/gallery-food-presentation.jpg",
    "/images/classic-cappuccino.jpg",
    "/images/nutella-banana-crepe.jpg",
    "/images/fresh-orange-juice.jpg",
  ]

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
  }

  const scrollPromo = (dir: 'left' | 'right') => {
    if (!promoSliderRef.current) return
    const cardWidth = promoSliderRef.current.querySelector('div[data-card]')?.clientWidth || 320
    promoSliderRef.current.scrollBy({
      left: dir === 'left' ? -cardWidth - 24 : cardWidth + 24,
      behavior: 'smooth',
    })
  }

  // Get store hours from selected location or fallback to global
  const getLocationHours = () => {
    if (selectedLocation?.openingHours) {
      return {
        openTime: selectedLocation.openingHours.openTime,
        closeTime: selectedLocation.openingHours.closeTime
      }
    }
    return { openTime, closeTime }
  }

  const locationHours = getLocationHours()
  const isLocationClosed = isStoreClosed(locationHours.openTime, locationHours.closeTime)

  return (
    <div className="min-h-screen bg-cream-50 font-body">
      {/* Structured Data */}
      <HomeStructuredData />

      {/* Mobile Header */}
      <MobileHeader />

      {/* Location Selection - First Priority */}
      <LocationSelector 
        onLocationSelect={(location) => {
          setSelectedLocation(location);
          setCartLocation({ id: location.id, name: location.name, adminPhone: location.adminPhone, openingHours: location.openingHours, coordinates: location.coordinates, googleMapsUrl: location.googleMapsUrl, deliverySettings: location.deliverySettings });
        }}
        selectedLocation={selectedLocation}
      />

      {/* Location Information Display */}
      {selectedLocation && (
        <div className="bg-gradient-to-r from-green-50 to-amber-50 border-l-4 border-green-500 rounded-r-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8 mx-3 sm:mx-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-2xl font-bold text-green-900 mb-2 truncate">
                  🏪 {selectedLocation.name}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-700 font-medium whitespace-nowrap">📞 Contact:</span>
                    <span className="text-gray-700 truncate">{selectedLocation.adminPhone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-700 font-medium whitespace-nowrap">🕒 Horaires:</span>
                    <span className="text-gray-700 truncate">
                      {selectedLocation.openingHours?.openTime || "08:00"} - {selectedLocation.openingHours?.closeTime || "23:00"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-700 font-medium whitespace-nowrap">🚚 Livraison:</span>
                    <span className={`text-xs sm:text-sm font-semibold ${selectedLocation.deliverySettings?.isDeliveryAvailable ? "text-green-600" : "text-red-600"}`}>
                      {selectedLocation.deliverySettings?.isDeliveryAvailable ? "✅ Disponible" : "❌ Non disponible"}
                    </span>
                  </div>
                </div>
                {/* Removed minimum order and maximum distance display */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-24 h-10 overflow-hidden">
                <Image src="/logo.png" alt="ElBasta Logo" width={500} height={500} className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="flex items-center space-x-8">
              <a href="#home" className="text-amber-900 hover:text-green-600 transition-colors font-semibold px-3 py-2 rounded-lg hover:bg-green-50 drop-shadow-sm">
                Accueil
              </a>
              <a href="#about" className="text-amber-900 hover:text-green-600 transition-colors font-semibold px-3 py-2 rounded-lg hover:bg-green-50 drop-shadow-sm">
                À Propos
              </a>
              <a href="#menu" className="text-amber-900 hover:text-green-600 transition-colors font-semibold px-3 py-2 rounded-lg hover:bg-green-50 drop-shadow-sm">
                Menu
              </a>
              <a href="#gallery" className="text-amber-900 hover:text-green-600 transition-colors font-semibold px-3 py-2 rounded-lg hover:bg-green-50 drop-shadow-sm">
                Galerie
              </a>
              <a href="#contact" className="text-amber-900 hover:text-green-600 transition-colors font-semibold px-3 py-2 rounded-lg hover:bg-green-50 drop-shadow-sm">
                Contact
              </a>
              <Link
                href="/suivi"
                className="text-amber-900 hover:text-green-600 transition-colors font-semibold flex items-center px-3 py-2 rounded-lg hover:bg-green-50 drop-shadow-sm"
              >
                <Package className="w-4 h-4 mr-1" />
                Suivi
              </Link>
            </div>
            <CartIcon />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/30 z-10"></div>
        <div className="absolute inset-0">
          <Image src="/images/hero-background.jpg" alt="ElBasta Interior" fill className="object-cover" priority />
        </div>
        <div className="relative z-20 text-center text-white max-w-4xl mx-auto px-6">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-accent mb-6 leading-tight text-shadow-lg animate-fade-in">ElBasta</h1>
          <p className="text-2xl sm:text-3xl md:text-4xl font-accent mb-8 text-cream-100 animate-fade-in-delay">{heroSubtitle || "Savourez des Moments Doux"}</p>
          <p className="text-base sm:text-lg mb-12 max-w-2xl mx-auto text-cream-200 font-body leading-relaxed animate-fade-in-delay-2">
            {heroDescription || "Découvrez le mélange parfait de tranquillité et de goût avec nos thés soigneusement préparés, jus frais, crêpes artisanales et douceurs délicieuses."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-3">
            {displayCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => document.getElementById(cat.slug)?.scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-white text-white hover:bg-white hover:text-amber-900 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 bg-transparent font-semibold focus:outline-none focus:ring-2 focus:ring-white"
                type="button"
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Hero Timing Display - only when a location is selected */}
      {selectedLocation && (
        <section className="py-4 px-6 bg-gradient-to-r from-green-600 to-green-700 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center space-x-4">
              <Clock className="w-6 h-6 text-white" />
              <div className="text-center">
                <h3 className="text-lg font-semibold font-body">Horaires d'Ouverture</h3>
                <p className="text-xl font-bold font-body">
                  {locationHours.openTime} - {locationHours.closeTime}
                  {isLocationClosed && (
                    <span className="ml-3 text-yellow-300 font-semibold">(Fermé actuellement)</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      <section id="about" className="py-20 px-6 bg-cream-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-5xl md:text-6xl font-accent text-amber-900 mb-6">Notre Histoire</h2>
              <p className="text-lg text-amber-800 leading-relaxed font-body">
                Bienvenue chez ElBasta, où chaque tasse raconte une histoire et chaque bouchée crée un souvenir. Niché
                au cœur de la ville, nous servons la communauté avec des thés premium, des jus naturels frais, des
                crêpes artisanales et des douceurs faites à la main depuis 2018.
              </p>
              <p className="text-lg text-amber-800 leading-relaxed font-body">
                Notre passion réside dans la création d'un sanctuaire paisible où vous pouvez échapper à l'agitation de
                la vie quotidienne. De nos thés biologiques soigneusement sélectionnés à nos pâtisseries faites maison,
                chaque article de notre menu est préparé avec amour et attention aux détails.
              </p>
              <div className="flex items-center space-x-4 pt-4">
                <Badge className="bg-green-100 text-green-800 px-4 py-2 font-medium">Ingrédients Bio</Badge>
                <Badge className="bg-amber-100 text-amber-800 px-4 py-2 font-medium">Fait Main Quotidiennement</Badge>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-green-200 rounded-3xl transform rotate-6"></div>
              <Image
                src="/images/gallery-interior.jpg"
                alt="Intérieur d'ElBasta"
                width={600}
                height={500}
                className="relative rounded-3xl shadow-2xl object-cover w-full h-[500px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Store Closed Banner - only when a location is selected */}
      {selectedLocation && isLocationClosed && (
        <div className="bg-red-100 text-red-800 text-center py-2 font-semibold">
          Le magasin est actuellement fermé. Heures d'ouverture : {locationHours.openTime} – {locationHours.closeTime}.
        </div>
      )}

      {/* Market Timing Display - only when a location is selected */}
      {selectedLocation && (
        <section className="py-8 px-6 bg-gradient-to-r from-green-50 to-amber-50 border-y-2 border-green-200">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center space-x-4">
              <Clock className="w-6 h-6 text-green-600" />
              <div className="text-center">
                <h3 className="text-xl font-semibold text-amber-900 font-body">Horaires d'Ouverture</h3>
                <p className="text-lg text-amber-700 font-body">
                  <span className="font-bold">{locationHours.openTime}</span> - <span className="font-bold">{locationHours.closeTime}</span>
                  {isLocationClosed && (
                    <span className="ml-2 text-red-600 font-semibold">(Fermé actuellement)</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Promotion / New Products Section - Only show when location is selected and has promoted products */}
      {selectedLocation && promotedProducts.length > 0 && (
        <section className="py-20 px-6 bg-gradient-to-br from-green-50 to-amber-50 border-y-4 border-green-400/30 shadow-xl">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-10">
              <Sparkles className="w-10 h-10 text-green-600" />
              <h2 className="text-4xl md:text-5xl font-accent text-amber-900">Promotion / Nouveautés</h2>
            </div>
            <div className="relative">
              <button
                aria-label="Précédent"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-300"
                onClick={() => scrollPromo('left')}
                style={{ display: promotedProducts.length > 1 ? 'block' : 'none' }}
              >
                <ChevronLeft className="w-6 h-6 text-amber-900" />
              </button>
              <div
                ref={promoSliderRef}
                className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4"
                style={{ scrollPaddingLeft: 24, scrollPaddingRight: 24 }}
              >
                {promotedProducts.map(item => (
                  <div
                    key={item.id}
                    data-card
                    className="min-w-[320px] max-w-xs w-full snap-center flex-shrink-0"
                  >
                    <MenuItemCard
                      id={item.id}
                      name={item.name}
                      description={item.description}
                      price={typeof item.price === 'string' ? parseFloat(item.price.replace(' DA', '')) || 0 : Number(item.price) || 0}
                      image={item.image}
                      category={categories.find(c => c.name === item.category)?.name || ""}
                      status={item.status}
                      discountPrice={item.discountPrice}
                      storeClosed={isLocationClosed}
                      openTime={locationHours.openTime}
                      closeTime={locationHours.closeTime}
                      locationId={selectedLocation?.id}
                      locationName={selectedLocation?.name}
                      isAvailable={item.isAvailable !== false}
                    />
                  </div>
                ))}
              </div>
              <button
                aria-label="Suivant"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-300"
                onClick={() => scrollPromo('right')}
                style={{ display: promotedProducts.length > 1 ? 'block' : 'none' }}
              >
                <ChevronRight className="w-6 h-6 text-amber-900" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* No Promoted Products Message */}
      {selectedLocation && promotedProducts.length === 0 && products.length > 0 && (
        <section className="py-12 px-6 bg-amber-50 border-y border-amber-200">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-amber-800 mb-2">Aucune promotion en cours</h3>
            <p className="text-amber-700 font-body">
              Il n'y a actuellement aucune promotion ou nouveauté disponible à l'emplacement <strong>{selectedLocation.name}</strong>.
            </p>
            <p className="text-sm text-amber-600 mt-2">
              Mais vous pouvez toujours explorer notre menu complet ci-dessous !
            </p>
          </div>
        </section>
      )}

      {/* Location Required Message */}
      {!selectedLocation && (
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl font-accent text-amber-900 mb-6">Sélectionnez votre emplacement</h2>
            <p className="text-lg text-amber-700 max-w-2xl mx-auto font-body leading-relaxed">
              Veuillez sélectionner un emplacement ElBasta pour voir le menu et les prix disponibles dans votre région.
            </p>
          </div>
        </section>
      )}

      {/* Menu Section */}
      {selectedLocation && (
        <section id="menu" className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-accent text-amber-900 mb-6">Notre Menu - {selectedLocation.name}</h2>
              <p className="text-lg text-amber-700 max-w-2xl mx-auto font-body leading-relaxed mb-4">
                Découvrez notre sélection soigneusement choisie de thés, jus frais, crêpes et douceurs, tous préparés avec
                les meilleurs ingrédients. Prix et disponibilité pour {selectedLocation.name}.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-700">
                    {products.filter(p => p.isAvailable).length} produit{products.filter(p => p.isAvailable).length > 1 ? 's' : ''} disponible{products.filter(p => p.isAvailable).length > 1 ? 's' : ''}
                  </span>
                </div>
                {products.filter(p => !p.isAvailable).length > 0 && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-600">
                      {products.filter(p => !p.isAvailable).length} produit{products.filter(p => !p.isAvailable).length > 1 ? 's' : ''} indisponible{products.filter(p => !p.isAvailable).length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
                <p className="text-lg text-amber-700 font-body">Chargement du menu...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-700 font-body">{error}</p>
                <Button 
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.location.reload()
                    }
                  }} 
                  className="mt-4 bg-red-600 hover:bg-red-700"
                >
                  Réessayer
                </Button>
              </div>
            </div>
          ) : availableCategories.length === 0 ? (
            <div className="text-center py-20">
              <div className="max-w-2xl mx-auto">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-amber-900 mb-4 font-body">Aucun produit trouvé</h3>
                <p className="text-lg text-amber-700 font-body mb-6">
                  Aucun produit n'est configuré pour l'emplacement <strong>{selectedLocation.name}</strong>.
                </p>
                <p className="text-sm text-amber-600 font-body mb-6">
                  Veuillez vérifier plus tard ou contacter le restaurant pour plus d'informations.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.location.reload()
                      }
                    }} 
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    Actualiser la page
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedLocation(null)}
                    className="border-amber-600 text-amber-600 hover:bg-amber-50"
                  >
                    Changer d'emplacement
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            availableCategories.map(cat => (
              <div key={cat.id} id={cat.slug} className="mb-16">
                <h3 className="text-4xl font-accent text-amber-900 mb-8 text-center">{cat.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(productsByCategory[cat.name] || []).length > 0 ? (
                    (productsByCategory[cat.name] || []).map(item => (
                      <MenuItemCard
                        key={item.id}
                        id={item.id}
                        name={item.name}
                        description={item.description}
                        price={typeof item.price === 'string' ? parseFloat(item.price.replace(' DA', '')) || 0 : Number(item.price) || 0}
                        image={item.image}
                        category={cat.name}
                        status={item.status}
                        discountPrice={item.discountPrice}
                        storeClosed={isLocationClosed}
                        openTime={locationHours.openTime}
                        closeTime={locationHours.closeTime}
                        locationId={selectedLocation?.id}
                        locationName={selectedLocation?.name}
                        isAvailable={item.isAvailable !== false}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-body">
                        Aucun produit disponible dans cette catégorie pour le moment.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-green-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-accent text-amber-900 mb-6">Comment Ça Marche</h2>
            <p className="text-lg text-amber-700 max-w-2xl mx-auto font-body leading-relaxed">
              Profiter de nos délicieuses offres est aussi simple que 1, 2, 3
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-700 transition-colors duration-300">
                <Search className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-amber-900 mb-4 font-body">1. Parcourez notre menu</h3>
              <p className="text-amber-700 leading-relaxed font-body">
                Explorez notre sélection soigneusement préparée de thés, jus, crêpes et douceurs. Chaque article est
                fait avec des ingrédients premium.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-700 transition-colors duration-300">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-amber-900 mb-4 font-body">
                2. Passez votre commande via WhatsApp
              </h3>
              <p className="text-amber-700 leading-relaxed font-body">
                Ajoutez vos articles favoris au panier et passez votre commande directement via WhatsApp. Simple et
                rapide.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-700 transition-colors duration-300">
                <Truck className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-amber-900 mb-4 font-body">3. Suivez votre commande</h3>
              <p className="text-amber-700 leading-relaxed font-body">
                Recevez un ID de suivi et suivez votre commande en temps réel jusqu'à la livraison.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-accent text-amber-900 mb-6">Galerie</h2>
            <p className="text-lg text-amber-700 max-w-2xl mx-auto font-body leading-relaxed">
              Faites un voyage visuel à travers nos délicieuses offres et notre atmosphère chaleureuse
            </p>
          </div>

          {/* Featured Image Carousel */}
          <div className="relative mb-12">
            <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src={galleryImages[currentImageIndex] || "/placeholder.svg"}
                alt="Image de Galerie ElBasta"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300"
            >
              <ChevronLeft className="w-6 h-6 text-amber-900" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-300"
            >
              <ChevronRight className="w-6 h-6 text-amber-900" />
            </button>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className={`relative h-24 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                  index === currentImageIndex ? "ring-4 ring-green-600" : "hover:scale-105"
                }`}
                onClick={() => setCurrentImageIndex(index)}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`Galerie ElBasta ${index + 1}`}
                  fill
                  className="object-cover"
                  loading="eager"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6 bg-cream-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-accent text-amber-900 mb-6">Visitez-Nous</h2>
            <p className="text-lg text-amber-700 max-w-2xl mx-auto font-body leading-relaxed">
              Venez découvrir la tranquillité d'ElBasta. Nous sommes situés au cœur de la ville.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Map */}
            <div className="relative h-96 bg-gray-200 rounded-3xl overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3196.8234567890123!2d3.1742928!3d36.7338212!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128e5383b6a54f93%3A0x834aa723d5c85d8a!2sELBASTA!5e0!3m2!1sfr!2sdz!4v1234567890123!5m2!1sfr!2sdz"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-3xl"
              ></iframe>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-3xl font-accent text-amber-900 mb-6">Contactez-Nous</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-amber-900 font-body">Adresse</p>
                      <p className="text-amber-700 font-body">ElBasta, Alger, Algérie</p>
                      <a
                        href="https://www.google.com/maps/place/ELBASTA/@36.7338212,3.1742928,17z/data=!3m1!4b1!4m6!3m5!1s0x128e5383b6a54f93:0x834aa723d5c85d8a!8m2!3d36.7338212!4d3.1742928!16s%2Fg%2F11l59j0gkv?entry=ttu"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 font-body text-sm underline"
                      >
                        Voir sur Google Maps
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-amber-900 font-body">Téléphone</p>
                      <p className="text-amber-700 font-body">0770 22 44 72</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-amber-900 font-body">Email</p>
                      <p className="text-amber-700 font-body">contact@elbasta.store</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-2xl font-accent text-amber-900 mb-4">Horaires d'Ouverture</h4>
                <div className="space-y-2 text-amber-700 font-body">
                  <div className="flex justify-between">
                    <span>Tous les jours</span>
                    <span>24h/24</span>
                  </div>
                  <p className="text-sm text-green-600 font-medium">Ouvert en continu</p>
                </div>
              </div>

              <div>
                <h4 className="text-2xl font-accent text-amber-900 mb-4">Suivez-Nous</h4>
                <div className="flex space-x-4">
                  <a
                    href="https://www.facebook.com/profile.php?id=61552378694624&ref=_xav_ig_profile_page_web#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-700 transition-colors"
                  >
                    <Facebook className="w-6 h-6 text-white" />
                  </a>
                  <a
                    href="https://www.instagram.com/elbasta.store/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-700 transition-colors"
                  >
                    <Instagram className="w-6 h-6 text-white" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-amber-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-36 h-20 overflow-hidden">
                  <Image src="/logo.png" alt="ElBasta Logo" width={120} height={120} className="w-full h-full object-contain" />
                </div>
              </div>
              <p className="text-cream-200 leading-relaxed mb-6 font-body">
                Votre sanctuaire paisible pour des thés premium, jus frais, crêpes artisanales et douceurs faites à la
                main. Créant des moments doux depuis 2018.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://www.facebook.com/profile.php?id=61552378694624&ref=_xav_ig_profile_page_web#"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook className="w-6 h-6 text-cream-200 hover:text-green-400 cursor-pointer transition-colors" />
                </a>
                <a href="https://www.instagram.com/elbasta.store/" target="_blank" rel="noopener noreferrer">
                  <Instagram className="w-6 h-6 text-cream-200 hover:text-green-400 cursor-pointer transition-colors" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-semibold mb-6 font-body">Liens Rapides</h4>
              <ul className="space-y-3 text-cream-200 font-body">
                <li>
                  <a href="#menu" className="hover:text-green-400 transition-colors">
                    Menu
                  </a>
                </li>
                <li>
                  <a href="#about" className="hover:text-green-400 transition-colors">
                    À Propos
                  </a>
                </li>
                <li>
                  <a href="#gallery" className="hover:text-green-400 transition-colors">
                    Galerie
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-green-400 transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <Link href="/suivi" className="hover:text-green-400 transition-colors">
                    Suivi Commande
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-cream-600 pt-8 text-center text-cream-200 font-body">
            <p>&copy; 2024 ElBasta. Tous droits réservés. Fait avec ❤️ pour les amateurs de thé.</p>
          </div>
        </div>
      </footer>

      {/* Mobile FAB - only when a location is selected */}
      {selectedLocation && (
        <MobileFab 
          openTime={locationHours.openTime}
          closeTime={locationHours.closeTime}
          storeClosed={isLocationClosed}
        />
      )}

    </div>
  )
}
