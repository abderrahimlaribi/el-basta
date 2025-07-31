import { type NextRequest, NextResponse } from "next/server"
import { getOrderByTrackingId, updateOrderStatus, deleteOrderByTrackingId } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { trackingId: string } }) {
  try {
    const { trackingId } = params

    if (!trackingId) {
      return NextResponse.json({ error: "Tracking ID is required" }, { status: 400 })
    }

    const order = await getOrderByTrackingId(trackingId)

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Convert dates to ISO strings for JSON serialization
    const serializedOrder = {
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }

    return NextResponse.json({ order: serializedOrder })
  } catch (error) {
    console.error("Error getting order:", error)
    return NextResponse.json({ error: "Failed to get order" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { trackingId: string } }) {
  try {
    const { trackingId } = params
    const body = await request.json()
    const { status, estimatedTime } = body

    if (!trackingId) {
      return NextResponse.json({ error: "Tracking ID is required" }, { status: 400 })
    }

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    // First get the order to get its ID
    const order = await getOrderByTrackingId(trackingId)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    await updateOrderStatus(order.id, status, estimatedTime)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { trackingId: string } }) {
  try {
    const { trackingId } = params
    if (!trackingId) {
      return NextResponse.json({ error: "Tracking ID is required" }, { status: 400 })
    }
    const deleted = await deleteOrderByTrackingId(trackingId)
    if (deleted) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Order not found or could not be deleted" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error deleting order:", error)
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 })
  }
}
