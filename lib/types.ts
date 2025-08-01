export type Dimensions = {
  x: number // millimeters
  y: number
  z: number
}

export type SlicingStatus = "pending" | "processing" | "sliced" | "error"

// Core file stored in the system
export interface File3D {
  id: string
  name: string
  filetype: string // e.g. "stl"
  filename: string // original filename including extension
  dimensions: Dimensions
  mass: number // grams
  slicing_status: SlicingStatus
  metadata?: Record<string, unknown>
  images?: string[] // urls that can be shown on the preview page
  createdAt: number // epoch ms
}

export type Quality = "Good" | "Better" | "Best"

export const QUALITY_LAYER_HEIGHT: Record<Quality, number> = {
  Good: 0.24,
  Better: 0.2,
  Best: 0.16,
}

export interface Color {
  id: string
  name: string
  hex: string
}

export interface Addon {
  id: string
  name: string
  description?: string
  cost: number // additional cost in USD or default currency. 0 = free
}

export interface CartItem {
  id: string
  fileId: string
  quality: Quality
  quantity: number // 1–100
  colorId: string
  addonIds: string[]
}

export interface Cart {
  id: string
  items: CartItem[]
  createdAt: number
  updatedAt: number
}