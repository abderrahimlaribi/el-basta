import { NextRequest, NextResponse } from "next/server"
import { db, isFirebaseConfigured } from "@/lib/firebase"
import { doc, updateDoc, deleteDoc, serverTimestamp, getDoc } from "firebase/firestore"

// Mock data store for when Firebase is not configured
const mockProducts: any[] = []

// Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    // Extract the fields for logging (destructure from body)
    const { name, description, categoryId, imageUrl, locationPrices } = body
    
    // Accept any fields for partial update
    const updateData: any = { ...body }
    
    // Validate required fields
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
    
    // Remove empty string fields (except for fields that can be empty)
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === '' && key !== 'imageUrl' && key !== 'description') {
        delete updateData[key]
      }
    })
    
    console.log(`🔄 Updating product ${id}:`, { name, categoryId, locationPrices: locationPrices.length })
    
    if (isFirebaseConfigured() && db) {
      try {
        console.log("🔥 Updating product in Firebase...")
        const productRef = doc(db, "products", id)
        
        // Fetch current product
        const currentSnap = await getDoc(productRef)
        const currentData = currentSnap.exists() ? currentSnap.data() : {}
        
        // Merge updateData with currentData and add Firebase timestamp
        const mergedData = { 
          ...currentData, 
          ...updateData,
          updatedAt: serverTimestamp() // Use serverTimestamp for Firebase
        }
        
        // Ensure locationPrices is always present
        if (!('locationPrices' in mergedData)) mergedData.locationPrices = []
        
        await updateDoc(productRef, mergedData)
        
        console.log("✅ Product updated successfully in Firebase")
        console.log(`   📄 Document ID: ${id}`)
        return NextResponse.json({ success: true })
      } catch (error) {
        console.error("❌ Error updating product in Firebase:", error)
        console.error("   Error details:", {
          message: error instanceof Error ? error.message : "Unknown error",
          code: (error as any)?.code || "No error code",
          stack: error instanceof Error ? error.stack : "No stack trace"
        })
        console.warn("🔄 Falling back to mock storage...")
        
        // Fall back to mock storage with regular Date object
        const productIndex = mockProducts.findIndex(p => p.id === id)
        if (productIndex !== -1) {
          mockProducts[productIndex] = {
            ...mockProducts[productIndex],
            ...updateData,
            updatedAt: new Date(), // Use regular Date for mock storage
          }
          console.log("✅ Product updated in mock storage")
          return NextResponse.json({ success: true })
        } else {
          return NextResponse.json(
            { error: "Product not found" },
            { status: 404 }
          )
        }
      }
    } else {
      console.warn("⚠️ Firebase not available - updating mock storage")
      const productIndex = mockProducts.findIndex(p => p.id === id)
      if (productIndex !== -1) {
        mockProducts[productIndex] = {
          ...mockProducts[productIndex],
          ...updateData,
          updatedAt: new Date(), // Use regular Date for mock storage
        }
        console.log("✅ Product updated in mock storage")
        return NextResponse.json({ success: true })
      } else {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        )
      }
    }
  } catch (error) {
    console.error("❌ Error processing product update:", error)
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    )
  }
}
// Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    console.log(`🗑️ Deleting product ${id}`)

    if (isFirebaseConfigured() && db) {
      try {
        console.log("🔥 Deleting product from Firebase...")
        const productRef = doc(db, "products", id)
        await deleteDoc(productRef)

        console.log("✅ Product deleted successfully from Firebase")
        console.log(`   📄 Document ID: ${id}`)

        return NextResponse.json({ success: true })
      } catch (error) {
        console.error("❌ Error deleting product from Firebase:", error)
        console.error("   Error details:", {
          message: error instanceof Error ? error.message : "Unknown error",
          code: (error as any)?.code || "No error code",
          stack: error instanceof Error ? error.stack : "No stack trace"
        })
        console.warn("🔄 Falling back to mock storage...")
        
        // Fall back to mock storage
        const productIndex = mockProducts.findIndex(p => p.id === id)
        if (productIndex !== -1) {
          mockProducts.splice(productIndex, 1)
          console.log("✅ Product deleted from mock storage")
          return NextResponse.json({ success: true })
        } else {
          return NextResponse.json(
            { error: "Product not found" },
            { status: 404 }
          )
        }
      }
    } else {
      console.warn("⚠️ Firebase not available - deleting from mock storage")
      const productIndex = mockProducts.findIndex(p => p.id === id)
      if (productIndex !== -1) {
        mockProducts.splice(productIndex, 1)
        console.log("✅ Product deleted from mock storage")
        return NextResponse.json({ success: true })
      } else {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        )
      }
    }
  } catch (error) {
    console.error("❌ Error processing product deletion:", error)
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    )
  }
} 