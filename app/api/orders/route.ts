import { type NextRequest, NextResponse } from "next/server"
import { createOrder, getAllOrders } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, deliveryAddress, totalPrice, customerName, customerPhone, customerNotes, deliveryFee, serviceFees, locationId, locationName } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Items are required" }, { status: 400 })
    }

    if (!deliveryAddress || typeof deliveryAddress !== "string") {
      return NextResponse.json({ error: "Delivery address is required" }, { status: 400 })
    }

    if (!totalPrice || typeof totalPrice !== "number") {
      return NextResponse.json({ error: "Total price is required" }, { status: 400 })
    }

    const result = await createOrder({
      items,
      deliveryAddress,
      totalPrice,
      customerName,
      customerPhone,
      customerNotes,
      deliveryFee,
      serviceFees,
      locationId,
      locationName,
    })

    return NextResponse.json({
      success: true,
      order: {
        ...result.order,
        createdAt: result.order.createdAt.toISOString(),
        updatedAt: result.order.updatedAt.toISOString(),
      },
      trackingId: result.trackingId,
    })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || undefined
    const orders = await getAllOrders(date)

    // Convert dates to ISO strings for JSON serialization
    const serializedOrders = orders.map((order) => ({
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }))

    return NextResponse.json({ orders: serializedOrders })
  } catch (error) {
    console.error("Error getting orders:", error)
    return NextResponse.json({ error: "Failed to get orders" }, { status: 500 })
  }
}
