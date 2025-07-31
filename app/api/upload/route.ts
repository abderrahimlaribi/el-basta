import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")
    const dataURI = `data:${file.type};base64,${base64}`

    // Upload to Cloudinary
    const cloudinaryUrl = "https://api.cloudinary.com/v1_1/djypvtvtm/image/upload"
    const uploadPreset = "elbasta_products" // Change this to your new preset name
    const apiSecret = process.env.CLOUDINARY_API_SECRET // Add this to your .env.local

    console.log("🔥 Uploading image to Cloudinary...")
    console.log(`   📤 Cloud Name: djypvtvtm`)
    console.log(`   📋 Upload Preset: ${uploadPreset}`)

    const uploadData = new FormData()
    uploadData.append("file", dataURI)
    uploadData.append("upload_preset", uploadPreset)

    const response = await fetch(cloudinaryUrl, {
      method: "POST",
      body: uploadData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Cloudinary upload failed:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
      throw new Error(`Cloudinary upload failed: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()

    console.log("✅ Image uploaded successfully to Cloudinary")
    console.log(`   🖼️ URL: ${result.secure_url}`)
    console.log(`   📏 Size: ${result.bytes} bytes`)
    console.log(`   🆔 Public ID: ${result.public_id}`)

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    })
  } catch (error) {
    console.error("❌ Error uploading image:", error)
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    )
  }
} 