"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, CheckCircle, Navigation, ExternalLink, Clock } from "lucide-react"
import { Location } from "@/lib/database"

interface LocationSelectorProps {
  onLocationSelect: (location: Location) => void
  selectedLocation?: Location | null
}

export function LocationSelector({ onLocationSelect, selectedLocation }: LocationSelectorProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [showLocationModal, setShowLocationModal] = useState(false)

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
    } finally {
      setLoading(false)
    }
  }

  const handleLocationSelect = (location: Location) => {
    onLocationSelect(location)
    setShowLocationModal(false)
  }

  const openInMaps = (googleMapsUrl: string) => {
    window.open(googleMapsUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  if (selectedLocation) {
    return (
      <>
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-lg shadow-md p-3 mb-6 mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="bg-amber-600 p-2 rounded-full flex-shrink-0">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-bold text-amber-900 truncate">{selectedLocation.name}</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-amber-700">
                  <div className="flex items-center space-x-1">
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">{selectedLocation.adminPhone}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">
                      {selectedLocation.openingHours?.openTime || "08:00"} - {selectedLocation.openingHours?.closeTime || "23:00"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className={`text-xs ${selectedLocation.deliverySettings?.isDeliveryAvailable ? "text-green-600" : "text-red-600"}`}>
                      {selectedLocation.deliverySettings?.isDeliveryAvailable ? "🚚 Livraison" : "❌ Pas de livraison"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openInMaps(selectedLocation.googleMapsUrl)}
                className="border-amber-300 text-amber-700 hover:bg-amber-100 text-xs px-2 sm:px-3"
              >
                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Carte</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLocationModal(true)}
                className="border-amber-300 text-amber-700 hover:bg-amber-100 text-xs px-2 sm:px-3"
              >
                <span className="hidden sm:inline">Changer</span>
                <span className="sm:hidden">Chg</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Location Selection Modal (also available when a location is already selected) */}
        {showLocationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-4 sm:p-8">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="bg-amber-600 p-2 sm:p-3 rounded-full">
                      <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <h2 className="text-lg sm:text-2xl font-bold text-amber-900">Changer de magasin</h2>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLocationModal(false)}
                    className="border-amber-300 text-amber-700 hover:bg-amber-100 p-2"
                  >
                    ✕
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {locations
                    .filter((loc): loc is Location => Boolean(loc && loc.isActive))
                    .map((location: Location) => {
                      const selectedId = (selectedLocation as Location | null)?.id
                      const isSelected = !!selectedId && selectedId === location.id
                    return (
                      <div
                        key={location.id}
                        className={`border-2 rounded-xl p-4 sm:p-6 cursor-pointer transition-all duration-300 ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50 shadow-lg'
                            : 'border-amber-200 hover:border-amber-400 hover:shadow-lg'
                        }`}
                        onClick={() => handleLocationSelect(location)}
                      >
                        <div className="flex items-start justify-between mb-3 sm:mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg sm:text-xl font-bold text-amber-900 mb-2 truncate">{location.name}</h3>
                            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-amber-700">
                              <div className="flex items-center space-x-2">
                                <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span className="truncate">{location.adminPhone}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span className="truncate">
                                  {location.openingHours?.openTime || "08:00"} - {location.openingHours?.closeTime || "23:00"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                          <Button
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            className={`text-xs sm:text-sm px-3 sm:px-4 ${isSelected ? "bg-amber-600 hover:bg-amber-700" : "border-amber-300 text-amber-700 hover:bg-amber-100"}`}
                          >
                            {isSelected ? (
                              <>
                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                Sélectionné
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                Sélectionner
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              openInMaps(location.googleMapsUrl)
                            }}
                            className="border-amber-300 text-amber-700 hover:bg-amber-100 text-xs sm:text-sm px-3 sm:px-4"
                          >
                            <Navigation className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Itinéraire
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <Card className="mb-6 border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 shadow-lg mt-20">
        <CardHeader className="text-center pb-4 sm:pb-6 px-4 sm:px-6">
          <div className="bg-amber-600 p-3 sm:p-4 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
            <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <CardTitle className="text-xl sm:text-2xl text-amber-900 flex items-center justify-center gap-2">
            Choisissez votre magasin
          </CardTitle>
          <p className="text-amber-700 text-sm sm:text-base mt-2">
            Sélectionnez le magasin le plus proche pour voir les produits et prix disponibles
          </p>
        </CardHeader>
        <CardContent className="pb-4 sm:pb-6 px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {locations.filter(loc => loc.isActive).map((location) => (
              <div
                key={location.id}
                className="border-2 border-amber-200 rounded-xl p-4 sm:p-6 bg-white hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-amber-400 hover:scale-105"
                onClick={() => handleLocationSelect(location)}
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-amber-900 mb-2 truncate">{location.name}</h3>
                    <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-amber-700">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">{location.adminPhone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">
                          {location.openingHours?.openTime || "08:00"} - {location.openingHours?.closeTime || "23:00"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 sm:px-6 text-xs sm:text-sm"
                  >
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Sélectionner
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      openInMaps(location.googleMapsUrl)
                    }}
                    className="border-amber-300 text-amber-700 hover:bg-amber-100 text-xs sm:text-sm px-3 sm:px-4"
                  >
                    <Navigation className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Itinéraire
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Location Selection Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-4 sm:p-8">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="bg-amber-600 p-2 sm:p-3 rounded-full">
                    <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-2xl font-bold text-amber-900">Changer de magasin</h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLocationModal(false)}
                  className="border-amber-300 text-amber-700 hover:bg-amber-100 p-2"
                >
                  ✕
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {locations.filter((loc: Location) => Boolean(loc && loc.isActive)).map((location: Location) => {
                  const isSelected = Boolean(selectedLocation && (selectedLocation as Location).id === location.id);
                  return (
                    <div
                      key={location.id}
                      className={`border-2 rounded-xl p-4 sm:p-6 cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 shadow-lg'
                          : 'border-amber-200 hover:border-amber-400 hover:shadow-lg'
                      }`}
                      onClick={() => handleLocationSelect(location)}
                    >
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-bold text-amber-900 mb-2 truncate">{location.name}</h3>
                          <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-amber-700">
                            <div className="flex items-center space-x-2">
                              <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span className="truncate">{location.adminPhone}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span className="truncate">
                                {location.openingHours?.openTime || "08:00"} - {location.openingHours?.closeTime || "23:00"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                        <Button
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          className={`text-xs sm:text-sm px-3 sm:px-4 ${isSelected ? "bg-amber-600 hover:bg-amber-700" : "border-amber-300 text-amber-700 hover:bg-amber-100"}`}
                        >
                          {isSelected ? (
                            <>
                              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                              Sélectionné
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                              Sélectionner
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            openInMaps(location.googleMapsUrl)
                          }}
                          className="border-amber-300 text-amber-700 hover:bg-amber-100 text-xs sm:text-sm px-3 sm:px-4"
                        >
                          <Navigation className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Itinéraire
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
