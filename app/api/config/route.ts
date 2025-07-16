import { NextRequest } from "next/server"
import { promises as fs } from "fs"
const CONFIG_PATH = process.cwd() + "/config.json"

export async function GET(request: NextRequest) {
  const raw = await fs.readFile(CONFIG_PATH, "utf-8")
  const config = JSON.parse(raw)
  const url = new URL(request.url)
  const type = url.searchParams.get("type")
  if (type === "promotedProducts") {
    return Response.json({ promotedProducts: config.promotedProducts || [] })
  }
  if (type === "storeSettings") {
    return Response.json({ storeSettings: config.storeSettings || { openTime: "08:00", closeTime: "23:00" } })
  }
  if (type === "deliverySettings") {
    return Response.json({ deliverySettings: config.deliverySettings || [] })
  }
  return Response.json({ 
    serviceFees: config.serviceFees, 
    promotedProducts: config.promotedProducts || [], 
    storeSettings: config.storeSettings || { openTime: "08:00", closeTime: "23:00" },
    deliverySettings: config.deliverySettings || []
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const raw = await fs.readFile(CONFIG_PATH, "utf-8")
  const config = JSON.parse(raw)
  if (typeof body.serviceFees === "number" && body.serviceFees >= 0) {
    config.serviceFees = body.serviceFees
    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2))
    return Response.json({ serviceFees: config.serviceFees })
  }
  if (Array.isArray(body.promotedProducts)) {
    config.promotedProducts = body.promotedProducts
    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2))
    return Response.json({ promotedProducts: config.promotedProducts })
  }
  if (body.storeSettings) {
    config.storeSettings = {
      ...config.storeSettings,
      ...body.storeSettings
    }
    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2))
    return Response.json({ storeSettings: config.storeSettings })
  }
  if (Array.isArray(body.deliverySettings)) {
    config.deliverySettings = body.deliverySettings
    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2))
    return Response.json({ deliverySettings: config.deliverySettings })
  }
  return Response.json({ error: "Invalid value" }, { status: 400 })
} 