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
  return Response.json({ serviceFees: config.serviceFees, promotedProducts: config.promotedProducts || [] })
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
  return Response.json({ error: "Invalid value" }, { status: 400 })
} 