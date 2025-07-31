import { NextRequest } from "next/server"
import { fetchConfigFromFirestore, saveConfigToFirestore } from "@/lib/database"

export async function GET(request: NextRequest) {
  const config = await fetchConfigFromFirestore()
  const url = new URL(request.url)
  const type = url.searchParams.get("type")
  if (type === "promotedProducts") {
    return Response.json({ promotedProducts: config.promotedProducts || [] })
  }
  if (type === "storeSettings") {
    return Response.json({
      storeSettings: {
        openTime: config.storeSettings?.openTime || "08:00",
        closeTime: config.storeSettings?.closeTime || "23:00",
        heroDescription: config.storeSettings?.heroDescription || "",
        heroSubtitle: config.storeSettings?.heroSubtitle || ""
      }
    })
  }
  if (type === "deliverySettings") {
    return Response.json({ deliverySettings: config.deliverySettings || [] })
  }
  return Response.json({
    serviceFees: config.serviceFees,
    promotedProducts: config.promotedProducts || [],
    storeSettings: {
      openTime: config.storeSettings?.openTime || "08:00",
      closeTime: config.storeSettings?.closeTime || "23:00",
      heroDescription: config.storeSettings?.heroDescription || "",
      heroSubtitle: config.storeSettings?.heroSubtitle || ""
    },
    deliverySettings: config.deliverySettings || []
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const config = await fetchConfigFromFirestore()
  if (typeof body.serviceFees === "number" && body.serviceFees >= 0) {
    config.serviceFees = body.serviceFees
    await saveConfigToFirestore(config)
    return Response.json({ serviceFees: config.serviceFees })
  }
  if (Array.isArray(body.promotedProducts)) {
    config.promotedProducts = body.promotedProducts
    await saveConfigToFirestore(config)
    return Response.json({ promotedProducts: config.promotedProducts })
  }
  if (body.storeSettings) {
    config.storeSettings = {
      ...config.storeSettings,
      ...body.storeSettings
    }
    await saveConfigToFirestore(config)
    return Response.json({ storeSettings: config.storeSettings })
  }
  if (Array.isArray(body.deliverySettings)) {
    config.deliverySettings = body.deliverySettings
    await saveConfigToFirestore(config)
    return Response.json({ deliverySettings: config.deliverySettings })
  }
  return Response.json({ error: "Invalid value" }, { status: 400 })
} 