"use client"

import Image from "next/image"
import dynamic from 'next/dynamic'

// Import structured data as a dynamic component with SSR disabled
const HomeStructuredData = dynamic(() => import('./structured-data'), { ssr: true })
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Leaf,
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

import Link from "next/link"
import { getProducts, type Product } from "@/lib/database"
import { fetchStoreHours, isStoreClosed } from '@/lib/utils'
import { useCallback } from 'react'

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [catRes, prodRes, promoRes, hours, configRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/products"),
          fetch("/api/config?type=promotedProducts"),
          fetchStoreHours(),
          fetch("/api/config?type=storeSettings")
        ])
        const catData = await catRes.json()
        const prodData = await prodRes.json()
        const promoData = await promoRes.json()
        const configData = await configRes.json()
        setCategories(catData.categories || [])
        setProducts(prodData.products || [])
        // Find promoted products by ID
        const promoIds = promoData.promotedProducts || []
        setPromotedProducts((prodData.products || []).filter((p: Product) => promoIds.includes(p.id)))
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

  // Group products by categoryId
  const productsByCategory: { [categoryId: string]: Product[] } = {}
  products.forEach(product => {
    if (!productsByCategory[product.categoryId]) productsByCategory[product.categoryId] = []
    productsByCategory[product.categoryId].push(product)
  })

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

  return (
    <div className="min-h-screen bg-cream-50 font-body">
      {/* Structured Data */}
      <HomeStructuredData />

      {/* Mobile Header */}
      <MobileHeader />

      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-accent text-amber-900 font-bold drop-shadow-sm">ElBasta</span>
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
            {categories.map(cat => (
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

      {/* Hero Timing Display */}
      <section className="py-4 px-6 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center space-x-4">
            <Clock className="w-6 h-6 text-white" />
            <div className="text-center">
              <h3 className="text-lg font-semibold font-body">Horaires d'Ouverture</h3>
              <p className="text-xl font-bold font-body">
                {openTime} - {closeTime}
                {storeClosed && (
                  <span className="ml-3 text-yellow-300 font-semibold">(Fermé actuellement)</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

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

      {/* Store Closed Banner */}
      {storeClosed && (
        <div className="bg-red-100 text-red-800 text-center py-2 font-semibold">
          Le magasin est actuellement fermé. Heures d'ouverture : {openTime} – {closeTime}.
        </div>
      )}

      {/* Market Timing Display */}
      <section className="py-8 px-6 bg-gradient-to-r from-green-50 to-amber-50 border-y-2 border-green-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center space-x-4">
            <Clock className="w-6 h-6 text-green-600" />
            <div className="text-center">
              <h3 className="text-xl font-semibold text-amber-900 font-body">Horaires d'Ouverture</h3>
              <p className="text-lg text-amber-700 font-body">
                <span className="font-bold">{openTime}</span> - <span className="font-bold">{closeTime}</span>
                {storeClosed && (
                  <span className="ml-2 text-red-600 font-semibold">(Fermé actuellement)</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Promotion / New Products Section */}
      {promotedProducts.length > 0 && (
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
                      price={Number(item.price)}
                      image={item.image}
                      category={categories.find(c => c.name === item.category)?.name || ""}
                      status={item.status}
                      discountPrice={item.discountPrice}
                      isAvailable={typeof item.isAvailable === 'boolean' ? item.isAvailable : true}
                      storeClosed={storeClosed}
                      openTime={openTime}
                      closeTime={closeTime}
                    />
                    {/* Highlight badges for discount, new, limited */}
                    {/* Removed item.discount, item.isNew, item.isLimited */}
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

      {/* Menu Section */}
      <section id="menu" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-accent text-amber-900 mb-6">Notre Menu</h2>
            <p className="text-lg text-amber-700 max-w-2xl mx-auto font-body leading-relaxed">
              Découvrez notre sélection soigneusement choisie de thés, jus frais, crêpes et douceurs, tous préparés avec
              les meilleurs ingrédients.
            </p>
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
          ) : categories.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-amber-700 font-body">Aucun produit disponible pour le moment.</p>
            </div>
          ) : (
            categories.map(cat => (
              <div key={cat.id} id={cat.slug} className="mb-16">
                <h3 className="text-4xl font-accent text-amber-900 mb-8 text-center">{cat.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(productsByCategory[cat.id] || []).map(item => (
                    <MenuItemCard
                      key={item.id}
                      id={item.id}
                      name={item.name}
                      description={item.description}
                      price={Number(item.price)}
                      image={item.image}
                      category={cat.name}
                      status={item.status}
                      discountPrice={item.discountPrice}
                      isAvailable={typeof item.isAvailable === 'boolean' ? item.isAvailable : true}
                      storeClosed={storeClosed}
                      openTime={openTime}
                      closeTime={closeTime}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

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
              <div className="flex items-center space-x-3 mb-6">
                <Leaf className="w-8 h-8 text-green-400" />
                <span className="text-3xl font-accent">ElBasta</span>
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

      {/* Mobile FAB */}
      <MobileFab 
        openTime={openTime}
        closeTime={closeTime}
        storeClosed={storeClosed}
      />

    </div>
  )
}
