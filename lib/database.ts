import { db, isFirebaseConfigured, type Order, type OrderCreate, ensureDate } from "./firebase"
import { collection, addDoc, getDocs, doc, updateDoc, query, where, orderBy, serverTimestamp, deleteDoc } from "firebase/firestore"

// Mock data store for when Firebase is not configured
const mockOrders: Order[] = []
let mockOrderCounter = 1

// Product interface
export interface Product {
  id: string
  name: string
  description: string
  price: string
  image: string
  category: string
  createdAt: Date
  updatedAt: Date
}

// Mock products for fallback
const mockProducts: Product[] = [
  {
    id: "juice-1",
    name: "Jus d'Orange Frais",
    description: "Oranges fraîchement pressées avec une pointe de menthe",
    price: "650 DA",
    image: "/images/fresh-orange-juice.jpg",
    category: "Jus Naturels",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "juice-2",
    name: "Mélange Détox Vert",
    description: "Épinards, pomme, concombre et gingembre",
    price: "725 DA",
    image: "/images/green-detox-smoothie.jpg",
    category: "Jus Naturels",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "juice-3",
    name: "Antioxydant aux Baies",
    description: "Baies mélangées avec grenade",
    price: "700 DA",
    image: "/images/berry-antioxidant-juice.jpg",
    category: "Jus Naturels",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "crepe-1",
    name: "Crêpe Française Classique",
    description: "Crêpe fine avec beurre, sucre et citron",
    price: "850 DA",
    image: "/images/classic-french-crepe.jpg",
    category: "Crêpes",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "crepe-2",
    name: "Nutella & Banane",
    description: "Crêpe chaude garnie de Nutella et banane fraîche",
    price: "975 DA",
    image: "/images/nutella-banana-crepe.jpg",
    category: "Crêpes",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "crepe-3",
    name: "Jambon & Fromage Salé",
    description: "Crêpe de sarrasin avec jambon, fromage et herbes",
    price: "1125 DA",
    image: "/images/ham-cheese-savory-crepe.jpg",
    category: "Crêpes",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "cappuccino-1",
    name: "Cappuccino Classique",
    description: "Espresso riche avec mousse de lait vapeur",
    price: "475 DA",
    image: "/images/classic-cappuccino.jpg",
    category: "Cappuccinos",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "cappuccino-2",
    name: "Cappuccino Vanille",
    description: "Cappuccino classique avec sirop de vanille",
    price: "525 DA",
    image: "/images/vanilla-cappuccino.jpg",
    category: "Cappuccinos",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "cappuccino-3",
    name: "Cappuccino Caramel",
    description: "Garni de caramel coulant et art de mousse",
    price: "550 DA",
    image: "/images/caramel-cappuccino.jpg",
    category: "Cappuccinos",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "sweet-1",
    name: "Sélection de Macarons",
    description: "Macarons français assortis (6 pièces)",
    price: "1200 DA",
    image: "/images/french-macarons.jpg",
    category: "Douceurs",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "sweet-2",
    name: "Éclair au Chocolat",
    description: "Pâte à choux garnie de crème vanille",
    price: "450 DA",
    image: "/images/chocolate-eclair.jpg",
    category: "Douceurs",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "sweet-3",
    name: "Tarte aux Fruits",
    description: "Fruits de saison sur base de crème vanille",
    price: "625 DA",
    image: "/images/seasonal-fruit-tart.jpg",
    category: "Douceurs",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

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
    customerName: orderData.customerName,
    customerPhone: orderData.customerPhone,
    customerNotes: orderData.customerNotes,
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
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerNotes: orderData.customerNotes,
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
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerNotes: data.customerNotes,
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
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerNotes: data.customerNotes,
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

// Delete order by tracking ID
export async function deleteOrderByTrackingId(trackingId: string): Promise<boolean> {
  console.log('🗑️ Deleting order with tracking ID:', trackingId)

  if (isFirebaseConfigured() && db) {
    try {
      // Find the order document by trackingId
      const q = query(collection(db, 'orders'), where('trackingId', '==', trackingId))
      const querySnapshot = await getDocs(q)
      if (querySnapshot.empty) {
        console.log('❌ Order not found in Firebase')
        return false
      }
      const docRef = querySnapshot.docs[0].ref
      await deleteDoc(docRef)
      console.log('✅ Order deleted from Firebase')
      return true
    } catch (error) {
      console.error('❌ Error deleting order from Firebase:', error)
      return false
    }
  } else {
    console.warn('⚠️ Firebase not available - deleting from mock storage')
    const index = mockOrders.findIndex((order) => order.trackingId === trackingId)
    if (index !== -1) {
      mockOrders.splice(index, 1)
      console.log('✅ Order deleted from mock storage')
      return true
    } else {
      console.log('❌ Order not found in mock storage')
      return false
    }
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

// Get all products
export async function getProducts(): Promise<Product[]> {
  console.log("🛍️ Fetching all products...")

  if (isFirebaseConfigured() && db) {
    try {
      console.log("🔥 Querying Firebase for all products...")
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)

      const products = querySnapshot.docs.map((docData) => {
        const data = docData.data()
        // Use imageUrl if present, fallback to image
        let image = data.imageUrl || data.image || "/placeholder.jpg"
        // Ensure price is a string with ' DA' if it's a number
        let price = data.price
        if (typeof price === "number") {
          price = price.toString() + " DA"
        } else if (typeof price !== "string") {
          price = "N/A"
        }
        return {
          id: docData.id,
          name: data.name,
          description: data.description,
          price,
          image,
          category: data.category,
          createdAt: ensureDate(data.createdAt),
          updatedAt: ensureDate(data.updatedAt),
        }
      })

      console.log(`✅ Retrieved ${products.length} products from Firebase`)
      return products
    } catch (error) {
      console.error("❌ Error getting products from Firebase:", error)
      console.error("   Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        code: (error as any)?.code || "No error code",
        stack: error instanceof Error ? error.stack : "No stack trace"
      })
      console.warn("🔄 Falling back to mock products...")
    }
  } else {
    console.warn("⚠️ Firebase not available - using mock products")
  }

  // Fall back to mock products
  console.log(`✅ Retrieved ${mockProducts.length} products from mock data`)
  return mockProducts
}
