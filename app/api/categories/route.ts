import { NextRequest, NextResponse } from "next/server"
import { getCategories, addCategory, deleteCategory, updateCategory } from "@/lib/firebase"

export async function GET() {
  const categories = await getCategories()
  return NextResponse.json({ categories })
}

export async function POST(req: NextRequest) {
  const { name, slug } = await req.json()
  if (!name || !slug) return NextResponse.json({ error: "Missing name or slug" }, { status: 400 })
  const category = await addCategory({ name, slug })
  return NextResponse.json({ category })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  await deleteCategory(id)
  return NextResponse.json({ success: true })
}

export async function PATCH(req: NextRequest) {
  const { id, name, slug } = await req.json()
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  await updateCategory(id, { name, slug })
  return NextResponse.json({ success: true })
} 