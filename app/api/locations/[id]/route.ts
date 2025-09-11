import { NextRequest, NextResponse } from 'next/server'
import { updateLocation, deleteLocation } from '@/lib/database'

const VERCEL_DEPLOY_HOOK = process.env.VERCEL_DEPLOY_HOOK!

// Helper to trigger Vercel redeploy
async function triggerVercelDeploy() {
  try {
    await fetch(VERCEL_DEPLOY_HOOK, { method: 'POST' })
    console.log('✅ Vercel redeploy triggered successfully')
  } catch (err) {
    console.error('❌ Failed to trigger Vercel redeploy:', err)
  }
}

// PUT /api/locations/[id] - Update a specific location
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { 
      name, 
      googleMapsUrl, 
      adminPhone, 
      isActive,
      openingHours,
      deliverySettings
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

    await updateLocation(params.id, {
      name,
      googleMapsUrl,
      adminPhone,
      isActive,
      openingHours,
      deliverySettings,
    })

    // Trigger redeploy
    await triggerVercelDeploy()

    return NextResponse.json({ message: 'Location updated successfully' })
  } catch (error) {
    console.error('Error updating location:', error)
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    )
  }
}

// DELETE /api/locations/[id] - Delete a specific location
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteLocation(params.id)

    // Trigger redeploy
    await triggerVercelDeploy()

    return NextResponse.json({ message: 'Location deleted successfully' })
  } catch (error) {
    console.error('Error deleting location:', error)
    return NextResponse.json(
      { error: 'Failed to delete location' },
      { status: 500 }
    )
  }
}
