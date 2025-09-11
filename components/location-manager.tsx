"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Edit, Trash2, Plus, Save, X, Globe, ExternalLink } from "lucide-react"
import { Location } from "@/lib/database"
import { useToast } from "@/hooks/use-toast"

interface LocationManagerProps {
  onLocationsChange?: () => void
}

export function LocationManager({ onLocationsChange }: LocationManagerProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    googleMapsUrl: "",
    adminPhone: "",
    isActive: true,
    openingHours: {
      openTime: "08:00",
      closeTime: "23:00",
    },
    deliverySettings: {
      isDeliveryAvailable: true,
    },
  })
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations')
      const data = await response.json()
      setLocations(data.locations || [])
    } catch (error) {
      console.error('Error fetching locations:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les emplacements",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      googleMapsUrl: "",
      adminPhone: "",
      isActive: true,
      openingHours: {
        openTime: "08:00",
        closeTime: "23:00",
      },
      deliverySettings: {
        isDeliveryAvailable: true,
      },
    })
    setEditingLocation(null)
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de l'emplacement est requis",
        variant: "destructive",
      })
      return
    }

    if (!formData.googleMapsUrl.trim()) {
      toast({
        title: "Erreur",
        description: "L'URL Google Maps est requise",
        variant: "destructive",
      })
      return
    }

    if (!formData.adminPhone.trim()) {
      toast({
        title: "Erreur",
        description: "Le numéro de téléphone de l'administrateur est requis",
        variant: "destructive",
      })
      return
    }

    // Validate Google Maps URL format
    if (!formData.googleMapsUrl.includes('google.com/maps') && !formData.googleMapsUrl.includes('maps.google.com')) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une URL Google Maps valide",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const url = editingLocation ? `/api/locations/${editingLocation.id}` : '/api/locations'
      const method = editingLocation ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          googleMapsUrl: formData.googleMapsUrl.trim(),
          adminPhone: formData.adminPhone.trim(),
          isActive: formData.isActive,
          openingHours: formData.openingHours,
          deliverySettings: formData.deliverySettings,
        }),
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: editingLocation 
            ? "Emplacement mis à jour avec succès" 
            : "Emplacement créé avec succès",
        })
        resetForm()
        fetchLocations()
        onLocationsChange?.()
      } else {
        throw new Error('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Error saving location:', error)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'emplacement",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (location: Location) => {
    setEditingLocation(location)
    setFormData({
      name: location.name,
      googleMapsUrl: location.googleMapsUrl || "",
      adminPhone: location.adminPhone,
      isActive: location.isActive,
      openingHours: location.openingHours || { openTime: "08:00", closeTime: "23:00" },
      deliverySettings: location.deliverySettings || {
        isDeliveryAvailable: true,
      },
    })
    setShowForm(true)
  }

  const handleDelete = async (locationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet emplacement ?')) {
      return
    }

    try {
      const response = await fetch(`/api/locations/${locationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Emplacement supprimé avec succès",
        })
        fetchLocations()
        onLocationsChange?.()
      } else {
        throw new Error('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting location:', error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'emplacement",
        variant: "destructive",
      })
    }
  }

  const openInMaps = (googleMapsUrl: string) => {
    window.open(googleMapsUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-gray-500">Chargement des emplacements...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Emplacements</h2>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setFormData({
                name: "",
                googleMapsUrl: "",
                adminPhone: "",
                isActive: true,
                openingHours: {
                  openTime: "08:00",
                  closeTime: "23:00",
                },
                deliverySettings: {
                  isDeliveryAvailable: true,
                },
              })
              setShowForm(true)

            }}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un emplacement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingLocation ? "Modifier l'emplacement" : "Ajouter un emplacement"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nom de l'emplacement *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Algiers, Oran, Constantine"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="googleMapsUrl">URL Google Maps *</Label>
                <Input
                  id="googleMapsUrl"
                  type="url"
                  value={formData.googleMapsUrl}
                  onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                  placeholder="https://maps.google.com/..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Copiez l'URL depuis Google Maps après avoir recherché l'adresse
                </p>
              </div>
              
              <div>
                <Label htmlFor="adminPhone">Téléphone de l'administrateur *</Label>
                <Input
                  id="adminPhone"
                  type="tel"
                  value={formData.adminPhone}
                  onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
                  placeholder="+213 123 456 789"
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="isActive">Emplacement actif</Label>
              </div>
              
              {/* Opening Hours Section */}
              <div className="space-y-3 border-t pt-4">
                <h4 className="font-medium text-sm">Horaires d'ouverture</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="openTime">Heure d'ouverture</Label>
                    <Input
                      id="openTime"
                      type="time"
                      value={formData.openingHours.openTime}
                      onChange={(e) => setFormData({
                        ...formData,
                        openingHours: { ...formData.openingHours, openTime: e.target.value }
                      })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="closeTime">Heure de fermeture</Label>
                    <Input
                      id="closeTime"
                      type="time"
                      value={formData.openingHours.closeTime}
                      onChange={(e) => setFormData({
                        ...formData,
                        openingHours: { ...formData.openingHours, closeTime: e.target.value }
                      })}
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Delivery Availability Only */}
              <div className="space-y-3 border-t pt-4">
                <h4 className="font-medium text-sm">Paramètres de livraison</h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDeliveryAvailable"
                    checked={formData.deliverySettings.isDeliveryAvailable}
                    onChange={(e) => setFormData({
                      ...formData,
                      deliverySettings: { ...formData.deliverySettings, isDeliveryAvailable: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <Label htmlFor="isDeliveryAvailable">Livraison disponible</Label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button type="submit" disabled={submitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {submitting ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <Card key={location.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{location.name}</CardTitle>
                <Badge variant={location.isActive ? "default" : "secondary"}>
                  {location.isActive ? "Actif" : "Inactif"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Globe className="h-4 w-4" />
                <span className="truncate">
                  {location.googleMapsUrl ? (
                    <button
                      onClick={() => openInMaps(location.googleMapsUrl!)}
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      Voir sur Google Maps
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </button>
                  ) : (
                    "Aucune URL Google Maps"
                  )}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{location.adminPhone}</span>
              </div>
              
              {/* Opening Hours */}
              <div className="text-sm text-gray-600">
                <div className="font-medium mb-1">Horaires:</div>
                <div className="text-xs">
                  {location.openingHours?.openTime || "08:00"} - {location.openingHours?.closeTime || "23:00"}
                </div>
              </div>
              
              {/* Delivery Info */}
              <div className="text-sm text-gray-600">
                <div className="font-medium mb-1">Livraison:</div>
                <div className="text-xs">
                  {location.deliverySettings?.isDeliveryAvailable ? (
                    "✅ Disponible"
                  ) : (
                    "❌ Non disponible"
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(location)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(location.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {locations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Aucun emplacement configuré</p>
          <p className="text-sm">Commencez par ajouter votre premier emplacement</p>
        </div>
      )}
    </div>
  )
} 