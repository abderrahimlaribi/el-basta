import { NextRequest, NextResponse } from "next/server"
import { db, isFirebaseConfigured } from "@/lib/firebase"
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"

// Mock data store for when Firebase is not configured
const mockProducts: any[] = []

export interface Product {
  id: string
  name: string
  description: string
  price: number
  categoryId: string
  imageUrl: string
  createdAt: Date
  updatedAt: Date
  status?: string | null
  discountPrice?: number | null
  isAvailable: boolean // <-- add this line
}

export interface ProductCreate {
  name: string
  description: string
  categoryId: string
  imageUrl: string
  locationPrices?: Array<{
    locationId: string
    price: number
    isAvailable: boolean
    status?: 'new' | 'promotion' | null
    discountPrice?: number
  }>
}

// Get all products
export async function GET() {
  console.log("📦 Fetching all products...")

  if (isFirebaseConfigured() && db) {
    try {
      console.log("🔥 Querying Firebase for all products...")
      const querySnapshot = await getDocs(collection(db, "products"))
      
      const products = querySnapshot.docs.map((docData) => {
        const data = docData.data()
        return {
          id: docData.id,
          name: data.name,
          description: data.description,
          categoryId: data.categoryId,
          imageUrl: data.imageUrl,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          locationPrices: data.locationPrices || [],
        }
      })

      console.log(`✅ Retrieved ${products.length} products from Firebase`)
      return NextResponse.json({ products })
    } catch (error) {
      console.error("❌ Error getting products from Firebase:", error)
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
  console.log(`✅ Retrieved ${mockProducts.length} products from mock storage`)
  return NextResponse.json({ products: mockProducts })
}

// Create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, categoryId, imageUrl, locationPrices } = body

    console.log("📦 Creating new product:", { name, categoryId, locationPrices })

    if (!name || !description || !categoryId || !imageUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (!locationPrices || !Array.isArray(locationPrices) || locationPrices.length === 0) {
      return NextResponse.json(
        { error: "At least one location price is required" },
        { status: 400 }
      )
    }

    const productData: ProductCreate = {
      name,
      description,
      categoryId,
      imageUrl,
      locationPrices,
    }

    if (isFirebaseConfigured() && db) {
      try {
        console.log("🔥 Saving product to Firebase...")
        const docRef = await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })

        const newProduct = {
          id: docRef.id,
          ...productData,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        console.log("✅ Product created successfully in Firebase")
        console.log(`   📄 Document ID: ${docRef.id}`)
        console.log(`   🏷️ Name: ${name}`)
        console.log(`   📍 Locations: ${locationPrices.length}`)

        return NextResponse.json({ product: newProduct })
      } catch (error) {
        console.error("❌ Error creating product in Firebase:", error)
        console.error("   Error details:", {
          message: error instanceof Error ? error.message : "Unknown error",
          code: (error as any)?.code || "No error code",
          stack: error instanceof Error ? error.stack : "No stack trace"
        })
        console.warn("🔄 Falling back to mock storage...")
        
        // Fall back to mock storage
        const newProduct = {
          id: `product_${Date.now()}`,
          ...productData,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        mockProducts.push(newProduct)
        console.log("✅ Product saved to mock storage as fallback")
        return NextResponse.json({ product: newProduct })
      }
    } else {
      console.warn("⚠️ Firebase not available - using mock storage")
      const newProduct = {
        id: `product_${Date.now()}`,
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      mockProducts.push(newProduct)
      console.log("✅ Product created in mock storage")
      return NextResponse.json({ product: newProduct })
    }
  } catch (error) {
    console.error("❌ Error processing product creation:", error)
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    )
  }
} 