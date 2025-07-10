import { NextResponse } from "next/server"
import { getAnalytics } from "@/lib/database"

export async function GET() {
  try {
    const analytics = await getAnalytics()
    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error getting analytics:", error)
    return NextResponse.json({ error: "Failed to get analytics" }, { status: 500 })
  }
}
