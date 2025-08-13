import { NextRequest, NextResponse } from 'next/server'
import { getLocations, createLocation } from '@/lib/database'

// GET /api/locations - Get all locations
export async function GET() {
  try {
    const locations = await getLocations()
    return NextResponse.json({ locations })
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    )
  }
}

// POST /api/locations - Create a new location
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      googleMapsUrl, 
      adminPhone, 
      isActive = true,
      openingHours = { openTime: "08:00", closeTime: "23:00" },
      deliverySettings = {
        isDeliveryAvailable: true,
        minimumOrder: 0,
        maximumDistance: 10,
      }
    } = body

    // Validate required fields
    if (!name || !googleMapsUrl || !adminPhone) {
      return NextResponse.json(
        { error: 'Missing required fields: name, googleMapsUrl, adminPhone' },
        { status: 400 }
      )
    }

    // Validate Google Maps URL format
    if (!googleMapsUrl.includes('google.com/maps') && !googleMapsUrl.includes('maps.google.com')) {
      return NextResponse.json(
        { error: 'Invalid Google Maps URL format' },
        { status: 400 }
      )
    }

    const location = await createLocation({
      name,
      googleMapsUrl,
      adminPhone,
      isActive,
      openingHours,
      deliverySettings,
    })

    return NextResponse.json({ location }, { status: 201 })
  } catch (error) {
    console.error('Error creating location:', error)
    return NextResponse.json(
      { error: 'Failed to create location' },
      { status: 500 }
    )
  }
} 