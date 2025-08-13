"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X, Loader2 } from "lucide-react"
import Image from "next/image"

interface Category { id: string; name: string; slug: string }
interface Product {
  id?: string
  name: string
  description: string
  price: number
  category: string
  image: string
  status?: 'new' | 'promotion' | null
  discountPrice?: number
  isAvailable?: boolean
  locationPrices?: Array<{
    locationId: string
    price: number
    isAvailable: boolean
  }>
}

interface Location {
  id: string
  name: string
  googleMapsUrl: string
  adminPhone: string
  isActive: boolean
}

interface ProductFormProps {
  product?: any
  onSubmit: (product: any) => Promise<void>
  onClose: () => void
  loading?: boolean
  categories: Category[]
}

export function ProductForm({ product, onSubmit, onClose, loading, categories }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    categoryId: product?.categoryId || "",
    imageUrl: product?.imageUrl || product?.image || "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState(product?.imageUrl || product?.image || "")
  const [uploading, setUploading] = useState(false)
  const [locations, setLocations] = useState<Location[]>([])
  const [locationPrices, setLocationPrices] = useState<Array<{
    locationId: string
    price: number
    isAvailable: boolean
    status?: 'new' | 'promotion' | null
    discountPrice?: number
  }>>(product?.locationPrices || [])
  const [defaultPrice, setDefaultPrice] = useState(() => {
    if (product?.locationPrices && product.locationPrices.length > 0) {
      // Use the first location's price as default
      return product.locationPrices[0].price
    }
    return 0
  })

  // Fetch locations on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/locations')
        const data = await response.json()
        setLocations(data.locations || [])
        
        // Initialize location prices for new products or update existing ones
        if (data.locations) {
          if (!product?.id) {
            // New product - initialize with default prices
            const initialLocationPrices = data.locations
              .filter((loc: Location) => loc.isActive)
              .map((loc: Location) => ({
                locationId: loc.id,
                price: defaultPrice,
                isAvailable: true,
                status: null,
                discountPrice: undefined
              }))
            setLocationPrices(initialLocationPrices)
          } else {
            // Existing product - merge with existing location prices
            const existingLocationPrices = product.locationPrices || []
            const allLocationPrices = data.locations
              .filter((loc: Location) => loc.isActive)
                             .map((loc: Location) => {
                 const existing = existingLocationPrices.find((lp: any) => lp.locationId === loc.id)
                return existing || {
                  locationId: loc.id,
                  price: defaultPrice,
                  isAvailable: true,
                  status: null,
                  discountPrice: undefined
                }
              })
            setLocationPrices(allLocationPrices)
          }
        }
      } catch (error) {
        console.error('Error fetching locations:', error)
      }
    }
    fetchLocations()
  }, [product?.id, defaultPrice])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Failed to upload image")
    }

    const result = await response.json()
    return result.url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.description || !formData.categoryId) {
      alert("Please fill in all required fields")
      return
    }

    // Check if at least one location has a price
    if (locationPrices.length === 0 || locationPrices.every(lp => lp.price <= 0)) {
      alert("Please set a price for at least one location")
      return
    }

    try {
      let imageUrl = formData.imageUrl

      // Upload new image if selected
      if (imageFile) {
        setUploading(true)
        imageUrl = await uploadImage(imageFile)
        setUploading(false)
      }

      await onSubmit({
        name: formData.name,
        description: formData.description,
        categoryId: formData.categoryId,
        imageUrl: imageUrl,
        locationPrices: locationPrices,
      })
    } catch (error) {
      console.error("Error submitting product:", error)
      alert("Failed to save product. Please try again.")
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{product ? "Modifier le Produit" : "Ajouter un Produit"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Image du Produit</Label>
            <div className="flex items-center space-x-4">
              <div className="relative">
                {imagePreview ? (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                    <Image
                      src={imagePreview}
                      alt="Product preview"
                      fill
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => {
                        setImagePreview("")
                        setImageFile(null)
                        setFormData(prev => ({ ...prev, imageUrl: "" }))
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                  if (typeof document !== "undefined") {
                    document.getElementById("image")?.click()
                  }
                }}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Choisir une Image"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nom du Produit *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Cappuccino Classique"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description détaillée du produit..."
              rows={3}
              required
            />
          </div>

          {/* Category and Default Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultPrice">Prix par défaut (DA)</Label>
              <Input
                id="defaultPrice"
                type="number"
                value={defaultPrice}
                onChange={(e) => setDefaultPrice(Number(e.target.value))}
                placeholder="650"
                min="0"
              />
            </div>
          </div>



          {/* Location-Specific Pricing */}
          {locations.length > 0 && (
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Prix et disponibilité par emplacement *</h3>
                <p className="text-sm text-gray-600 mb-4">Définissez le prix et la disponibilité pour chaque emplacement. Au moins un emplacement doit avoir un prix défini.</p>
                <div className="space-y-3">
                  {locations.filter(loc => loc.isActive).map((location) => {
                    const locationPrice = locationPrices.find(lp => lp.locationId === location.id)
                    return (
                      <div key={location.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{location.name}</h4>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={locationPrice?.isAvailable ?? true}
                              onChange={(e) => {
                                const newLocationPrices = [...locationPrices]
                                const existingIndex = newLocationPrices.findIndex(lp => lp.locationId === location.id)
                                if (existingIndex >= 0) {
                                  newLocationPrices[existingIndex].isAvailable = e.target.checked
                                } else {
                                  newLocationPrices.push({
                                    locationId: location.id,
                                    price: defaultPrice,
                                    isAvailable: e.target.checked,
                                    status: null,
                                    discountPrice: undefined
                                  })
                                }
                                setLocationPrices(newLocationPrices)
                              }}
                              className="accent-green-600 w-4 h-4"
                            />
                            <span className="text-sm text-gray-600">Disponible</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor={`price-${location.id}`} className="text-sm">Prix (DA)</Label>
                              <Input
                                id={`price-${location.id}`}
                                type="number"
                                value={locationPrice?.price ?? defaultPrice}
                                onChange={(e) => {
                                  const newLocationPrices = [...locationPrices]
                                  const existingIndex = newLocationPrices.findIndex(lp => lp.locationId === location.id)
                                  if (existingIndex >= 0) {
                                    newLocationPrices[existingIndex].price = Number(e.target.value)
                                  } else {
                                                                      newLocationPrices.push({
                                    locationId: location.id,
                                    price: Number(e.target.value),
                                    isAvailable: true,
                                    status: null,
                                    discountPrice: undefined
                                  })
                                  }
                                  setLocationPrices(newLocationPrices)
                                }}
                                placeholder={defaultPrice.toString()}
                                min="0"
                                className="text-sm"
                              />
                            </div>
                            <div className="flex items-end">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newLocationPrices = [...locationPrices]
                                  const existingIndex = newLocationPrices.findIndex(lp => lp.locationId === location.id)
                                  if (existingIndex >= 0) {
                                    newLocationPrices[existingIndex].price = defaultPrice
                                  } else {
                                                                      newLocationPrices.push({
                                    locationId: location.id,
                                    price: defaultPrice,
                                    isAvailable: true,
                                    status: null,
                                    discountPrice: undefined
                                  })
                                  }
                                  setLocationPrices(newLocationPrices)
                                }}
                                className="text-xs"
                              >
                                Utiliser le prix par défaut
                              </Button>
                            </div>
                          </div>
                          
                          {/* Status and Discount Price */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor={`status-${location.id}`} className="text-sm">Statut</Label>
                              <select
                                id={`status-${location.id}`}
                                value={locationPrice?.status ?? 'none'}
                                onChange={(e) => {
                                  const newLocationPrices = [...locationPrices]
                                  const existingIndex = newLocationPrices.findIndex(lp => lp.locationId === location.id)
                                  if (existingIndex >= 0) {
                                    newLocationPrices[existingIndex].status = e.target.value === 'none' ? null : e.target.value as 'new' | 'promotion'
                                  } else {
                                    newLocationPrices.push({
                                      locationId: location.id,
                                      price: defaultPrice,
                                      isAvailable: true,
                                      status: e.target.value === 'none' ? null : e.target.value as 'new' | 'promotion'
                                    })
                                  }
                                  setLocationPrices(newLocationPrices)
                                }}
                                className="border rounded px-2 py-1 w-full text-sm"
                              >
                                <option value="none">Aucun</option>
                                <option value="new">Nouveau</option>
                                <option value="promotion">Promotion</option>
                              </select>
                            </div>
                            <div>
                              <Label htmlFor={`discount-${location.id}`} className="text-sm">Prix promotionnel</Label>
                              <Input
                                id={`discount-${location.id}`}
                                type="number"
                                min="0"
                                value={locationPrice?.discountPrice ?? ''}
                                onChange={(e) => {
                                  const newLocationPrices = [...locationPrices]
                                  const existingIndex = newLocationPrices.findIndex(lp => lp.locationId === location.id)
                                  if (existingIndex >= 0) {
                                    newLocationPrices[existingIndex].discountPrice = e.target.value ? Number(e.target.value) : undefined
                                  } else {
                                    newLocationPrices.push({
                                      locationId: location.id,
                                      price: defaultPrice,
                                      isAvailable: true,
                                      discountPrice: e.target.value ? Number(e.target.value) : undefined
                                    })
                                  }
                                  setLocationPrices(newLocationPrices)
                                }}
                                placeholder="Prix promotionnel"
                                className="text-sm"
                                disabled={locationPrice?.status !== 'promotion'}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || uploading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                product ? "Mettre à Jour" : "Ajouter"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 
