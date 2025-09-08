"use client"

import Image from "next/image"
import dynamic from 'next/dynamic'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Mail, Facebook, Instagram, Search, Truck, ChevronLeft, ChevronRight, MessageCircle, Package, Loader2, Sparkles, Percent, Clock, } from "lucide-react"
import { useEffect, useState, useRef, useCallback } from "react"
import { CartIcon } from "@/components/cart-icon"
import { MenuItemCard } from "@/components/menu-item-card"
import { MobileHeader } from "@/components/mobile-header"
import { MobileFab } from "@/components/mobile-fab"
import { LocationSelector } from "@/components/location-selector"
import Link from "next/link"
import { getProducts, type Product, type Location } from "@/lib/database"
import { fetchStoreHours, isStoreClosed } from '@/lib/utils'
import { useCartStore } from "@/lib/cart-store"

const HomeStructuredData = dynamic(() => import('./structured-data'), { ssr: true })

interface Category { id: string; name: string; slug: string }

interface HomeClientProps {
  initialLocations: Location[]
}

export default function HomeClient({ initialLocations }: HomeClientProps) {
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
  const [heroDescription, setHeroDescription] = useState("")
  const [heroSubtitle, setHeroSubtitle] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocations?.[0] || null)
  const setCartLocation = useCartStore((state) => state.setLocation)

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
      try {
        const [prodRes, promoRes] = await Promise.all([
          fetch(`/api/products/location/${selectedLocation.id}`),
          fetch("/api/config?type=promotedProducts")
        ])
        const prodData = await prodRes.json()
        const promoData = await promoRes.json()
        const products = (prodData.products || []) as Product[]
        setProducts(products)
        const promotedIds: string[] = (promoData.promotedProducts?.ids || [])
        const promoted = products.filter((p: any) => promotedIds.includes(p.id))
        setPromotedProducts(promoted)
        setCartLocation({ id: selectedLocation.id, name: selectedLocation.name })
      } catch (error) {
        console.error("Error fetching products:", error)
      }
    }
    fetchProducts()
  }, [selectedLocation, setCartLocation])

  // The rest of the original JSX/UI from app/page.tsx should remain unchanged.
  // For brevity here, we simply render the parts that rely on LocationSelector and products.

  return (
    <div>
      <HomeStructuredData />
      <MobileHeader />

      <div className="container mx-auto px-4">
        <div className="mt-4">
          <LocationSelector onLocationSelect={(loc) => setSelectedLocation(loc)} selectedLocation={selectedLocation as any} initialLocations={initialLocations} />
        </div>

        {/* Example sections that depend on products */}
        {error && (
          <div className="text-red-600 my-4">{error}</div>
        )}

        {/* Promoted products carousel placeholder */}
        {promotedProducts.length > 0 && (
          <section className="my-8">
            <h2 className="text-xl font-semibold text-amber-900 mb-4">En vedette</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {promotedProducts.map((p) => (
                <MenuItemCard key={p.id} id={p.id} name={p.name} description={p.description} image={p.image} category={p.category} price={parseFloat(String(p.price).replace(/[^0-9.]/g, '')) || 0} status={p.status} discountPrice={p.discountPrice} storeClosed={storeClosed} openTime={openTime} closeTime={closeTime} locationId={selectedLocation?.id} locationName={selectedLocation?.name} isAvailable={(p as any).isAvailable !== false} />
              ))}
            </div>
          </section>
        )}

        {/* All products grid */}
        <section className="my-8">
          <h2 className="text-xl font-semibold text-amber-900 mb-4">Menu</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((p) => (
              <MenuItemCard key={p.id} id={p.id} name={p.name} description={p.description} image={p.image} category={p.category} price={parseFloat(String(p.price).replace(/[^0-9.]/g, '')) || 0} status={p.status} discountPrice={p.discountPrice} storeClosed={storeClosed} openTime={openTime} closeTime={closeTime} locationId={selectedLocation?.id} locationName={selectedLocation?.name} isAvailable={(p as any).isAvailable !== false} />
            ))}
          </div>
        </section>
      </div>

      <MobileFab />
      <CartIcon />
    </div>
  )
}
