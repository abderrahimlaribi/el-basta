"use client"

import { useState } from "react"
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
    price: product?.price || 0,
    categoryId: product?.categoryId || "",
    image: product?.image || "",
    status: product?.status ?? 'none',
    discountPrice: product?.discountPrice ?? '',
    isAvailable: typeof product?.isAvailable === 'boolean' ? product.isAvailable : true,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState(product?.image || "")
  const [uploading, setUploading] = useState(false)

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

    if (!formData.name || !formData.description || !formData.price || !formData.categoryId) {
      alert("Please fill in all required fields")
      return
    }

    try {
      let image = formData.image

      // Upload new image if selected
      if (imageFile) {
        setUploading(true)
        image = await uploadImage(imageFile)
        setUploading(false)
      }

      await onSubmit({
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        categoryId: formData.categoryId,
        image,
        status: formData.status === 'none' ? null : formData.status,
        discountPrice: formData.status === 'promotion' ? Number(formData.discountPrice) : undefined,
        isAvailable: formData.isAvailable,
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
                        setFormData(prev => ({ ...prev, image: "" }))
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

          {/* Price and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Prix (DA) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                placeholder="650"
                min="0"
                required
              />
            </div>
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
          </div>

          {/* Status Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <select
              id="status"
              value={formData.status}
              onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="border rounded px-2 py-1 w-full"
            >
              <option value="none">Aucun</option>
              <option value="new">Nouveau</option>
              <option value="promotion">Promotion</option>
            </select>
          </div>
          {/* Availability Toggle */}
          <div className="flex items-center gap-2">
            <Label htmlFor="isAvailable">Disponible</Label>
            <input
              id="isAvailable"
              type="checkbox"
              checked={formData.isAvailable}
              onChange={e => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
              className="accent-green-600 w-5 h-5"
            />
            <span className="text-sm text-gray-500">{formData.isAvailable ? 'Disponible à la vente' : 'Indisponible'}</span>
          </div>
          {/* Discounted price input if promotion */}
          {formData.status === 'promotion' && (
            <div className="space-y-2">
              <Label htmlFor="discountPrice">Prix promotionnel</Label>
              <Input
                id="discountPrice"
                type="number"
                min={1}
                value={formData.discountPrice}
                onChange={e => setFormData(prev => ({ ...prev, discountPrice: e.target.value }))}
                placeholder="Prix promotionnel"
                required
              />
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
