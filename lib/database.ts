import { db, isFirebaseConfigured, type Order, type OrderCreate, ensureDate } from "./firebase"
import { collection, addDoc, getDocs, doc, updateDoc, query, where, orderBy, serverTimestamp, deleteDoc, setDoc, getDoc } from "firebase/firestore"

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
  categoryId?: string
  createdAt: Date
  updatedAt: Date
  status: 'new' | 'promotion' | null
  discountPrice: number | undefined
  locationPrices?: ProductLocation[]
  isAvailable: boolean
}

// Location interface for multiple store locations
export interface Location {
  id: string
  name: string
  googleMapsUrl: string
  adminPhone: string
  isActive: boolean
  // Optional precise coordinates for distance calculations
  coordinates?: { lat: number; lng: number }
  openingHours: {
    openTime: string // Format: "08:00"
    closeTime: string // Format: "23:00"
  }
  deliverySettings: {
    isDeliveryAvailable: boolean
  }
  createdAt: Date
  updatedAt: Date
}

// ProductLocation interface for per-location product management
export interface ProductLocation {
  locationId: string
  price: number
  isAvailable: boolean
}

// Enhanced Product interface with location-specific data
export interface ProductWithLocations extends Product {
  locationPrices?: ProductLocation[]
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
    status: null,
    discountPrice: undefined,
    isAvailable: true,
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
    status: null,
    discountPrice: undefined,
    isAvailable: true,
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
    status: null,
    discountPrice: undefined,
    isAvailable: true,
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
    status: null,
    discountPrice: undefined,
    isAvailable: true,
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
    status: null,
    discountPrice: undefined,
    isAvailable: true,
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
    status: null,
    discountPrice: undefined,
    isAvailable: true,
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
    status: null,
    discountPrice: undefined,
    isAvailable: true,
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
    status: null,
    discountPrice: undefined,
    isAvailable: true,
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
    status: null,
    discountPrice: undefined,
    isAvailable: true,
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
    status: null,
    discountPrice: undefined,
    isAvailable: true,
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
    status: null,
    discountPrice: undefined,
    isAvailable: true,
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
    status: null,
    discountPrice: undefined,
    isAvailable: true,
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
    deliveryFee: orderData.deliveryFee ?? 0,
    serviceFees: orderData.serviceFees ?? 0,
    locationId: (orderData as any).locationId,
    locationName: (orderData as any).locationName,
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
        deliveryFee: orderData.deliveryFee ?? 0,
        serviceFees: orderData.serviceFees ?? 0,
        locationId: (orderData as any).locationId,
        locationName: (orderData as any).locationName,
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
        deliveryFee: typeof data.deliveryFee === 'number' ? data.deliveryFee : 0,
        serviceFees: typeof data.serviceFees === 'number' ? data.serviceFees : 0,
        locationId: data.locationId,
        locationName: data.locationName,
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
    if (typeof mockOrder.deliveryFee !== 'number') mockOrder.deliveryFee = 0;
    if (typeof mockOrder.serviceFees !== 'number') mockOrder.serviceFees = 0;
  } else {
    console.log("❌ Order not found in mock storage")
  }
  return mockOrder || null
}

// Get all orders (for admin)
export async function getAllOrders(date?: string): Promise<Order[]> {
  console.log("📋 Fetching all orders...", date ? `for date: ${date}` : "");

  // Helper to get start/end of day
  function getDayRange(dateStr: string) {
    const start = new Date(dateStr + 'T00:00:00.000Z');
    const end = new Date(dateStr + 'T23:59:59.999Z');
    return { start, end };
  }

  if (isFirebaseConfigured() && db) {
    try {
      let q;
      if (date) {
        const { start, end } = getDayRange(date);
        q = query(
          collection(db, "orders"),
          where("createdAt", ">=", start),
          where("createdAt", "<=", end),
          orderBy("createdAt", "desc")
        );
      } else {
        q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      }
      const querySnapshot = await getDocs(q);
      const orders = querySnapshot.docs.map((docData) => {
        const data = docData.data();
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
          locationId: data.locationId,
          locationName: data.locationName,
        };
      });
      console.log(`✅ Retrieved ${orders.length} orders from Firebase`);
      return orders;
    } catch (error) {
      console.error("❌ Error getting orders from Firebase:", error);
      console.warn("🔄 Falling back to mock storage...");
    }
  } else {
    console.warn("⚠️ Firebase not available - using mock storage");
  }

  // Fall back to mock storage
  let filtered = [...mockOrders];
  if (date) {
    const { start, end } = getDayRange(date);
    filtered = filtered.filter(order => order.createdAt >= start && order.createdAt <= end);
  }
  const mockOrdersSorted = filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  console.log(`✅ Retrieved ${mockOrdersSorted.length} orders from mock storage`);
  return mockOrdersSorted;
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
          isAvailable: true,
          status: data.status || null,
          discountPrice: data.discountPrice,
          locationPrices: data.locationPrices || [],
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

// Location management functions
export async function getLocations(): Promise<Location[]> {
  console.log("📍 Fetching all locations...")

  if (isFirebaseConfigured() && db) {
    try {
      console.log("🔥 Querying Firebase for all locations...")
      const q = query(collection(db, "locations"), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)

      const locations = querySnapshot.docs.map((docData) => {
        const data = docData.data()
        return {
          id: docData.id,
          name: data.name,
          googleMapsUrl: data.googleMapsUrl,
          adminPhone: data.adminPhone,
          isActive: data.isActive !== false,
          coordinates: data.coordinates,
          openingHours: data.openingHours || { openTime: "08:00", closeTime: "23:00" },
          deliverySettings: data.deliverySettings
            ? { isDeliveryAvailable: Boolean(data.deliverySettings.isDeliveryAvailable) }
            : { isDeliveryAvailable: true },
          createdAt: ensureDate(data.createdAt),
          updatedAt: ensureDate(data.updatedAt),
        }
      })

      console.log(`✅ Retrieved ${locations.length} locations from Firebase`)
      return locations
    } catch (error) {
      console.error("❌ Error getting locations from Firebase:", error)
      console.warn("🔄 Falling back to mock locations...")
    }
  } else {
    console.warn("⚠️ Firebase not available - using mock locations")
  }

  // Fall back to mock locations
  const mockLocations: Location[] = [
    {
      id: "algiers-1",
      name: "ElBasta Alger Centre",
      googleMapsUrl: "https://www.google.com/maps?q=ElBasta+Alger+Centre",
      adminPhone: "+213 770 123 456",
      isActive: true,
      coordinates: { lat: 36.7338212, lng: 3.1742928 },
      openingHours: { openTime: "08:00", closeTime: "23:00" },
      deliverySettings: { isDeliveryAvailable: true },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "oran-1",
      name: "ElBasta Oran",
      googleMapsUrl: "https://www.google.com/maps?q=ElBasta+Oran",
      adminPhone: "+213 770 123 457",
      isActive: true,
      coordinates: { lat: 35.6971, lng: -0.6308 },
      openingHours: { openTime: "08:00", closeTime: "23:00" },
      deliverySettings: { isDeliveryAvailable: true },
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]
  
  console.log(`✅ Retrieved ${mockLocations.length} locations from mock data`)
  return mockLocations
}

export async function createLocation(locationData: Omit<Location, "id" | "createdAt" | "updatedAt">): Promise<Location> {
  console.log("📍 Creating new location...")

  const now = new Date()
  const location: Location = {
    id: `location_${Date.now()}`,
    ...locationData,
    createdAt: now,
    updatedAt: now,
  }

  if (isFirebaseConfigured() && db) {
    try {
      console.log("🔥 Saving location to Firebase...")
      const docRef = await addDoc(collection(db, "locations"), {
        ...locationData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      location.id = docRef.id
      console.log("✅ Location created successfully in Firebase")
      return location
    } catch (error) {
      console.error("❌ Error creating location in Firebase:", error)
      console.warn("🔄 Falling back to mock storage...")
    }
  } else {
    console.warn("⚠️ Firebase not available - using mock storage")
  }

  // Fall back to mock storage
  console.log("✅ Location created in mock storage")
  return location
}

export async function updateLocation(id: string, locationData: Partial<Location>): Promise<void> {
  console.log(`📍 Updating location ${id}...`)

  if (isFirebaseConfigured() && db) {
    try {
      console.log("🔥 Updating location in Firebase...")
      const locationRef = doc(db, "locations", id)
      await updateDoc(locationRef, {
        ...locationData,
        updatedAt: serverTimestamp(),
      })
      console.log("✅ Location updated successfully in Firebase")
      return
    } catch (error) {
      console.error("❌ Error updating location in Firebase:", error)
      throw error
    }
  } else {
    console.warn("⚠️ Firebase not available - cannot update location")
    throw new Error("Firebase not available")
  }
}

export async function deleteLocation(id: string): Promise<void> {
  console.log(`📍 Deleting location ${id}...`)

  if (isFirebaseConfigured() && db) {
    try {
      console.log("🔥 Deleting location from Firebase...")
      await deleteDoc(doc(db, "locations", id))
      console.log("✅ Location deleted successfully from Firebase")
      return
    } catch (error) {
      console.error("❌ Error deleting location from Firebase:", error)
      throw error
    }
  } else {
    console.warn("⚠️ Firebase not available - cannot delete location")
    throw new Error("Firebase not available")
  }
}

// Get products by location
export async function getProductsByLocation(locationId: string): Promise<Product[]> {
  console.log(`🛍️ Fetching products for location ${locationId}...`)

  if (isFirebaseConfigured() && db) {
    try {
      console.log("🔥 Querying Firebase for products by location...")
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)

      console.log(`📦 Found ${querySnapshot.docs.length} total products in database`)

      const products = querySnapshot.docs.map((docData) => {
        const data = docData.data()
        let image = data.imageUrl || data.image || "/placeholder.jpg"
        let price = 0
        let isAvailable = true
        let status = null
        let discountPrice = undefined
        
        // Check location-specific pricing; include unavailable products as well
        if (data.locationPrices && Array.isArray(data.locationPrices)) {
          console.log(`📍 Product "${data.name}" has ${data.locationPrices.length} location prices`)
          const locationPrice = data.locationPrices.find((lp: any) => lp.locationId === locationId)
          if (locationPrice) {
            console.log(`✅ Found pricing for location ${locationId}: ${locationPrice.price} DA, available: ${locationPrice.isAvailable}`)
            price = Number(locationPrice.price) || 0
            isAvailable = Boolean(locationPrice.isAvailable)
            status = locationPrice.status || null
            discountPrice = typeof locationPrice.discountPrice === 'number' ? locationPrice.discountPrice : undefined
          } else {
            // No specific pricing for this location; mark as unavailable but include product with base price if present
            console.log(`ℹ️ Product "${data.name}" has no pricing for location ${locationId} — marking as unavailable`)
            isAvailable = false
            if (typeof data.price === 'number') {
              price = data.price
            } else if (typeof data.price === 'string') {
              const parsed = parseFloat(String(data.price).replace(/[^0-9.]/g, ''))
              price = isNaN(parsed) ? 0 : parsed
            } else {
              price = 0
            }
            status = data.status || null
            discountPrice = typeof data.discountPrice === 'number' ? data.discountPrice : undefined
          }
        } else {
          // No location pricing configured at all; mark as unavailable but include product with base price if present
          console.log(`ℹ️ Product "${data.name}" has no location pricing at all — marking as unavailable`)
          isAvailable = false
          if (typeof data.price === 'number') {
            price = data.price
          } else if (typeof data.price === 'string') {
            const parsed = parseFloat(String(data.price).replace(/[^0-9.]/g, ''))
            price = isNaN(parsed) ? 0 : parsed
          } else {
            price = 0
          }
          status = data.status || null
          discountPrice = typeof data.discountPrice === 'number' ? data.discountPrice : undefined
        }
        
        return {
          id: docData.id,
          name: data.name,
          description: data.description,
          price: price.toString() + " DA",
          image,
          category: data.category || data.categoryId || "Uncategorized",
          createdAt: ensureDate(data.createdAt),
          updatedAt: ensureDate(data.updatedAt),
          isAvailable,
          status,
          discountPrice,
        }
      }).filter((product): product is Product => product !== null) // Remove null products

      console.log(`✅ Retrieved ${products.length} products for location ${locationId} from Firebase`)
      return products
    } catch (error) {
      console.error("❌ Error getting products by location from Firebase:", error)
      console.warn("🔄 Falling back to mock products...")
    }
  } else {
    console.warn("⚠️ Firebase not available - using mock products")
  }

  // Fall back to mock products
  console.log(`✅ Retrieved ${mockProducts.length} products for location ${locationId} from mock data`)
  return mockProducts
}

// CONFIG FIRESTORE SYNC
export async function saveConfigToFirestore(config: any) {
  if (!isFirebaseConfigured() || !db) throw new Error("Firebase not configured")
  const configRef = doc(collection(db, "config"), "main")
  await setDoc(configRef, config, { merge: true })
}

export async function fetchConfigFromFirestore() {
  if (!isFirebaseConfigured() || !db) throw new Error("Config not found in Firestore")
  const configRef = doc(collection(db, "config"), "main")
  const snap = await getDoc(configRef)
  if (!snap.exists()) throw new Error("Config not found in Firestore")
  return snap.data()
}
