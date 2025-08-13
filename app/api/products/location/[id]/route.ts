import { NextRequest, NextResponse } from 'next/server'
import { getProductsByLocation } from '@/lib/database'

// GET /api/products/location/[id] - Get products for a specific location
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const locationId = params.id
    
    if (!locationId) {
      return NextResponse.json(
        { error: 'Location ID is required' },
        { status: 400 }
      )
    }

    const products = await getProductsByLocation(locationId)
    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching products by location:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products for location' },
      { status: 500 }
    )
  }
} 