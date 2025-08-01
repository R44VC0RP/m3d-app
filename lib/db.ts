import { Addon, Cart, CartItem, Color, File3D } from "./types"
import { randomUUID } from "crypto"

// ----------------------------------------------------------------------------------
// NOTE: This is **NOT** a production-ready datastore. It is an in-memory mock that is
// re-initialised on every server restart / rebuild and is adequate for demonstration
// purposes only. Replace with a real database (Prisma + Postgres, etc.) when needed.
// ----------------------------------------------------------------------------------

// ----- Mock tables ----------------------------------------------------------------
export const files: File3D[] = []

export const colors: Color[] = [
  { id: "white", name: "White", hex: "#FFFFFF" },
  { id: "black", name: "Black", hex: "#121113" },
  { id: "red", name: "Red", hex: "#FF4D4F" },
  { id: "blue", name: "Blue", hex: "#1890FF" },
]

export const addons: Addon[] = [
  {
    id: "queue_priority",
    name: "Queue Priority",
    description: "Jump to the top of the orders queue",
    cost: 10, // dollars
  },
  {
    id: "print_assistance",
    name: "Print Assistance",
    description: "Assistance without extra cost",
    cost: 0,
  },
  {
    id: "multi_color_print",
    name: "Multi-color Print",
    description: "Print your model in multiple colours",
    cost: 0,
  },
]

// A single cart for the current session (could be expanded to multi-user)
let cart: Cart = {
  id: "default_cart",
  items: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

// ----- Helper functions -----------------------------------------------------------
export function createFile(input: Omit<File3D, "id" | "createdAt">): File3D {
  const newFile: File3D = {
    ...input,
    id: randomUUID(),
    createdAt: Date.now(),
  }
  files.push(newFile)
  return newFile
}

export function updateCart(updater: (prev: Cart) => Cart): Cart {
  cart = { ...updater(cart), updatedAt: Date.now() }
  return cart
}

export function addToCart(item: Omit<CartItem, "id">): Cart {
  const cartItem: CartItem = { ...item, id: randomUUID() }
  return updateCart((prev) => ({ ...prev, items: [...prev.items, cartItem] }))
}

export function removeCartItem(itemId: string): Cart {
  return updateCart((prev) => ({ ...prev, items: prev.items.filter((i) => i.id !== itemId) }))
}

export function clearCart(): Cart {
  return updateCart((prev) => ({ ...prev, items: [] }))
}

export function getCart(): Cart {
  return cart
}