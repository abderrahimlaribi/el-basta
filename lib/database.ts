import { db, isFirebaseConfigured, type Order, type OrderCreate, ensureDate } from "./firebase"
import { collection, addDoc, getDocs, doc, updateDoc, query, where, orderBy, serverTimestamp } from "firebase/firestore"

// Mock data store for when Firebase is not configured
const mockOrders: Order[] = []
let mockOrderCounter = 1

// Generate a unique tracking ID
function generateTrackingId(): string {
  const prefix = "ELB"
  const number = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}${number}`
}

// Create a new order
export async function createOrder(orderData: OrderCreate): Promise<{ order: Order; trackingId: string }> {
  const trackingId = generateTrackingId()
  const now = new Date()

  const order: Order = {
    id: `order_${mockOrderCounter++}`,
    trackingId,
    items: orderData.items,
    deliveryAddress: orderData.deliveryAddress,
    totalPrice: orderData.totalPrice,
    status: orderData.status || "En préparation",
    estimatedTime: "",
    createdAt: now,
    updatedAt: now,
  }

  console.log("📦 Creating order with tracking ID:", trackingId)

  if (isFirebaseConfigured() && db) {
    try {
      console.log("🔥 Attempting to save order to Firebase...")
      const orderToCreate = {
        ...orderData,
        trackingId,
        status: orderData.status || "En préparation",
        estimatedTime: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "orders"), orderToCreate)
      order.id = docRef.id
      console.log("✅ Order created successfully in Firebase")
      console.log(`   📄 Document ID: ${docRef.id}`)
      console.log(`   🔍 Tracking ID: ${trackingId}`)
      console.log(`   💰 Total Price: ${orderData.totalPrice} DA`)
    } catch (error) {
      console.error("❌ Error creating order in Firebase:", error)
      console.error("   Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        code: (error as any)?.code || "No error code",
        stack: error instanceof Error ? error.stack : "No stack trace"
      })
      console.warn("🔄 Falling back to mock storage...")
      mockOrders.push(order)
      console.log("✅ Order saved to mock storage as fallback")
    }
  } else {
    console.warn("⚠️ Firebase not available - using mock storage")
    mockOrders.push(order)
    console.log("✅ Order created in mock storage:", order.id)
  }

  return { order, trackingId }
}

// Get order by tracking ID
export async function getOrderByTrackingId(trackingId: string): Promise<Order | null> {
  console.log("🔍 Searching for order with tracking ID:", trackingId)

  if (isFirebaseConfigured() && db) {
    try {
      console.log("🔥 Querying Firebase for order...")
      const q = query(collection(db, "orders"), where("trackingId", "==", trackingId))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        console.log("❌ Order not found in Firebase")
        return null
      }

      const docData = querySnapshot.docs[0]
      const data = docData.data()

      console.log("✅ Order found in Firebase")
      console.log(`   📄 Document ID: ${docData.id}`)
      console.log(`   📦 Status: ${data.status}`)
      console.log(`   💰 Total: ${data.totalPrice} DA`)

      return {
        id: docData.id,
        trackingId: data.trackingId,
        items: data.items,
        deliveryAddress: data.deliveryAddress,
        totalPrice: data.totalPrice,
        status: data.status,
        estimatedTime: data.estimatedTime || "",
        createdAt: ensureDate(data.createdAt),
        updatedAt: ensureDate(data.updatedAt),
      }
    } catch (error) {
      console.error("❌ Error getting order from Firebase:", error)
      console.error("   Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        code: (error as any)?.code || "No error code",
        stack: error instanceof Error ? error.stack : "No stack trace"
      })
      console.warn("🔄 Falling back to mock storage...")
    }
  } else {
    console.warn("⚠️ Firebase not available - searching mock storage")
  }

  // Fall back to mock storage
  const mockOrder = mockOrders.find((order) => order.trackingId === trackingId)
  if (mockOrder) {
    console.log("✅ Order found in mock storage")
  } else {
    console.log("❌ Order not found in mock storage")
  }
  return mockOrder || null
}

// Get all orders (for admin)
export async function getAllOrders(): Promise<Order[]> {
  console.log("📋 Fetching all orders...")

  if (isFirebaseConfigured() && db) {
    try {
      console.log("🔥 Querying Firebase for all orders...")
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)

      const orders = querySnapshot.docs.map((docData) => {
        const data = docData.data()
        return {
          id: docData.id,
          trackingId: data.trackingId,
          items: data.items,
          deliveryAddress: data.deliveryAddress,
          totalPrice: data.totalPrice,
          status: data.status,
          estimatedTime: data.estimatedTime || "",
          createdAt: ensureDate(data.createdAt),
          updatedAt: ensureDate(data.updatedAt),
        }
      })

      console.log(`✅ Retrieved ${orders.length} orders from Firebase`)
      return orders
    } catch (error) {
      console.error("❌ Error getting orders from Firebase:", error)
      console.error("   Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        code: (error as any)?.code || "No error code",
        stack: error instanceof Error ? error.stack : "No stack trace"
      })
      console.warn("🔄 Falling back to mock storage...")
    }
  } else {
    console.warn("⚠️ Firebase not available - using mock storage")
  }

  // Fall back to mock storage
  const mockOrdersSorted = [...mockOrders].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  console.log(`✅ Retrieved ${mockOrdersSorted.length} orders from mock storage`)
  return mockOrdersSorted
}

// Update order status
export async function updateOrderStatus(
  orderId: string,
  status: Order["status"],
  estimatedTime?: string,
): Promise<void> {
  console.log(`🔄 Updating order ${orderId} to status: ${status}`)
  if (estimatedTime) {
    console.log(`   ⏰ Estimated time: ${estimatedTime}`)
  }

  if (isFirebaseConfigured() && db) {
    try {
      console.log("🔥 Updating order in Firebase...")
      const orderRef = doc(db, "orders", orderId)
      const updateData: any = {
        status,
        updatedAt: serverTimestamp(),
      }

      if (estimatedTime !== undefined) {
        updateData.estimatedTime = estimatedTime
      }

      await updateDoc(orderRef, updateData)
      console.log("✅ Order updated successfully in Firebase")
      return
    } catch (error) {
      console.error("❌ Error updating order in Firebase:", error)
      console.error("   Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        code: (error as any)?.code || "No error code",
        stack: error instanceof Error ? error.stack : "No stack trace"
      })
      console.warn("🔄 Falling back to mock storage...")
    }
  } else {
    console.warn("⚠️ Firebase not available - updating mock storage")
  }

  // Fall back to mock storage
  const order = mockOrders.find((o) => o.id === orderId)
  if (order) {
    order.status = status
    order.updatedAt = new Date()
    if (estimatedTime !== undefined) {
      order.estimatedTime = estimatedTime
    }
    console.log("✅ Order updated in mock storage")
  } else {
    console.error("❌ Order not found in mock storage for update")
  }
}

// Get analytics data
export async function getAnalytics() {
  console.log("📊 Generating analytics...")
  let orders: Order[] = []

  if (isFirebaseConfigured() && db) {
    try {
      console.log("🔥 Fetching analytics data from Firebase...")
      const querySnapshot = await getDocs(collection(db, "orders"))
      orders = querySnapshot.docs.map((docData) => {
        const data = docData.data()
        return {
          id: docData.id,
          trackingId: data.trackingId,
          items: data.items,
          deliveryAddress: data.deliveryAddress,
          totalPrice: data.totalPrice,
          status: data.status,
          estimatedTime: data.estimatedTime || "",
          createdAt: ensureDate(data.createdAt),
          updatedAt: ensureDate(data.updatedAt),
        }
      })
      console.log(`✅ Retrieved ${orders.length} orders for analytics from Firebase`)
    } catch (error) {
      console.error("❌ Error getting analytics from Firebase:", error)
      console.error("   Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        code: (error as any)?.code || "No error code",
        stack: error instanceof Error ? error.stack : "No stack trace"
      })
      console.warn("🔄 Falling back to mock data for analytics...")
      orders = mockOrders
    }
  } else {
    console.warn("⚠️ Firebase not available - using mock data for analytics")
    orders = mockOrders
  }

  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0)

  const statusCounts = orders.reduce(
    (acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Get orders from last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const recentOrders = orders.filter((order) => order.createdAt >= sevenDaysAgo)

  const analytics = {
    totalOrders,
    totalRevenue,
    pendingOrders: statusCounts["En préparation"] || 0,
    completedOrders: statusCounts["Livré"] || 0,
    recentOrdersCount: recentOrders.length,
    statusBreakdown: statusCounts,
  }

  console.log("📈 Analytics Summary:")
  console.log(`   📦 Total Orders: ${totalOrders}`)
  console.log(`   💰 Total Revenue: ${totalRevenue} DA`)
  console.log(`   ⏳ Pending Orders: ${analytics.pendingOrders}`)
  console.log(`   ✅ Completed Orders: ${analytics.completedOrders}`)
  console.log(`   📅 Recent Orders (7 days): ${analytics.recentOrdersCount}`)

  return analytics
}
