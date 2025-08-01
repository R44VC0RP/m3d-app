"use client"

import { useEffect, useState } from "react"
import { Cart, CartItem, Color, QUALITY_LAYER_HEIGHT } from "@/lib/types"
import { Button } from "@/components/ui/button"

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null)
  const [colors, setColors] = useState<Color[]>([])
  // You could fetch addons here if needed in the future.

  // Fetch initial data
  useEffect(() => {
    fetch("/api/cart")
      .then((res) => res.json())
      .then((data: Cart) => setCart(data))
    fetch("/api/colors")
      .then((res) => res.json())
      .then((data: Color[]) => setColors(data))
  }, [])

  if (!cart) return <p className="p-8">Loading cart…</p>

  const handleRemove = async (itemId: string) => {
    await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    })
    const updated = await fetch("/api/cart").then((r) => r.json())
    setCart(updated)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      {cart.items.length === 0 && <p>Your cart is empty.</p>}
      {cart.items.map((item) => (
        <CartItemView key={item.id} item={item} colors={colors} onRemove={handleRemove} />
      ))}
    </div>
  )
}

function CartItemView({ item, colors, onRemove }: { item: CartItem; colors: Color[]; onRemove: (id: string) => void }) {
  const color = colors.find((c) => c.id === item.colorId)
  return (
    <div className="border rounded-md p-4 mb-4 flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold">File ID: {item.fileId}</h2>
        <Button variant="secondary" onClick={() => onRemove(item.id)}>
          Remove
        </Button>
      </div>
      <ul className="text-sm text-gray-700 space-y-1">
        <li>
          Quality: {item.quality} ({QUALITY_LAYER_HEIGHT[item.quality]}mm layer height)
        </li>
        <li>Quantity: {item.quantity}</li>
        <li>
          Color: {color ? (
            <span className="inline-flex items-center gap-2">
              <span
                className="inline-block w-4 h-4 rounded-full border"
                style={{ backgroundColor: color.hex }}
              />
              {color.name}
            </span>
          ) : (
            item.colorId
          )}
        </li>
      </ul>
    </div>
  )
}