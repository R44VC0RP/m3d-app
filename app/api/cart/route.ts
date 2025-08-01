import { NextRequest, NextResponse } from "next/server"
import { addToCart, clearCart, getCart, removeCartItem } from "@/lib/db"
import { Cart } from "@/lib/types"

// ----------------------------- Types --------------------------------------------
// GET
export type RequestGET = {}
export type ResponseGET = Cart
// POST (add item)
export interface RequestPOST {
  fileId: string
  quality: "Good" | "Better" | "Best"
  quantity: number // 1-100
  colorId: string
  addonIds: string[]
}
export type ResponsePOST = Cart
// DELETE (remove item or clear cart). If body contains itemId -> remove that item, else clear.
export interface RequestDELETE {
  itemId?: string
}
export type ResponseDELETE = Cart
// ---------------------------------------------------------------------------------

export async function GET() {
  const cart = getCart()
  const res: ResponseGET = cart
  return NextResponse.json(res)
}

export async function POST(req: NextRequest) {
  let body: RequestPOST
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
  const { fileId, quality, quantity, colorId, addonIds } = body
  if (!fileId || !quality || !quantity || !colorId || !Array.isArray(addonIds)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }
  if (quantity < 1 || quantity > 100) {
    return NextResponse.json({ error: "Quantity must be between 1 and 100" }, { status: 400 })
  }
  const cart = addToCart({ fileId, quality, quantity, colorId, addonIds })
  const res: ResponsePOST = cart
  return NextResponse.json(res, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  let body: RequestDELETE = {}
  try {
    body = await req.json()
  } catch {
    // ignore empty body
  }
  let cart: Cart
  if (body?.itemId) {
    cart = removeCartItem(body.itemId)
  } else {
    cart = clearCart()
  }
  const res: ResponseDELETE = cart
  return NextResponse.json(res)
}