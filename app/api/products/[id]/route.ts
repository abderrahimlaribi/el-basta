import { NextRequest, NextResponse } from "next/server"
import { db, isFirebaseConfigured } from "@/lib/firebase"
import { doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"

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
    const { name, description, price, category, imageUrl } = body

    console.log(`🔄 Updating product ${id}:`, { name, price, category })

    if (!name || !description || !price || !category || !imageUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const updateData = {
      name,
      description,
      price: Number(price),
      category,
      imageUrl,
      updatedAt: serverTimestamp(),
    }

    if (isFirebaseConfigured() && db) {
      try {
        console.log("🔥 Updating product in Firebase...")
        const productRef = doc(db, "products", id)
        await updateDoc(productRef, updateData)

        console.log("✅ Product updated successfully in Firebase")
        console.log(`   📄 Document ID: ${id}`)
        console.log(`   🏷️ Name: ${name}`)
        console.log(`   💰 Price: ${price} DA`)

        return NextResponse.json({ success: true })
      } catch (error) {
        console.error("❌ Error updating product in Firebase:", error)
        console.error("   Error details:", {
          message: error instanceof Error ? error.message : "Unknown error",
          code: (error as any)?.code || "No error code",
          stack: error instanceof Error ? error.stack : "No stack trace"
        })
        console.warn("🔄 Falling back to mock storage...")
        
        // Fall back to mock storage
        const productIndex = mockProducts.findIndex(p => p.id === id)
        if (productIndex !== -1) {
          mockProducts[productIndex] = {
            ...mockProducts[productIndex],
            ...updateData,
            updatedAt: new Date(),
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
          updatedAt: new Date(),
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