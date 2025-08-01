"use client"

import { useEffect, useState } from "react"
import { Addon, Color, File3D, Quality } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

const QUALITIES: Quality[] = ["Good", "Better", "Best"]

export default function FilePreviewPage({ params }: any) {
  const { fileId } = params
  const router = useRouter()

  const [file, setFile] = useState<File3D | null>(null)
  const [quality, setQuality] = useState<Quality>("Better")
  const [quantity, setQuantity] = useState(1)
  const [colorId, setColorId] = useState<string>("white")
  const [addonIds, setAddonIds] = useState<string[]>([])
  const [colors, setColors] = useState<Color[]>([])
  const [addons, setAddons] = useState<Addon[]>([])

  useEffect(() => {
    fetch(`/api/files/${fileId}`).then((r) => r.json()).then(setFile)
    fetch("/api/colors").then((r) => r.json()).then(setColors)
    fetch("/api/addons").then((r) => r.json()).then(setAddons)
  }, [fileId])

  const toggleAddon = (id: string) => {
    setAddonIds((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]))
  }

  const addToCart = async () => {
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId, quality, quantity, colorId, addonIds }),
    })
    router.push("/cart")
  }

  if (!file) return <p className="p-8">Loading…</p>

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{file.name}</h1>
      {/* Placeholder for images */}
      <div className="w-full aspect-video bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
        Preview not available
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="font-semibold block mb-1">Quality</label>
            <select
              className="border rounded-md p-2 w-full"
              value={quality}
              onChange={(e) => setQuality(e.target.value as Quality)}
            >
              {QUALITIES.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-semibold block mb-1">Quantity</label>
            <input
              type="number"
              min={1}
              max={100}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="border rounded-md p-2 w-full"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">Color</label>
            <select
              className="border rounded-md p-2 w-full"
              value={colorId}
              onChange={(e) => setColorId(e.target.value)}
            >
              {colors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="font-semibold">Add-ons</h2>
          {addons.map((addon) => (
            <label key={addon.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={addonIds.includes(addon.id)}
                onChange={() => toggleAddon(addon.id)}
              />
              {addon.name} {addon.cost > 0 ? `(+ $${addon.cost})` : ""}
            </label>
          ))}
        </div>
      </div>
      <Button variant="primary-accent" onClick={addToCart}>
        Add to Cart
      </Button>
    </div>
  )
}