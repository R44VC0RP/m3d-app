import { db } from "./drizzle"
import { files, carts, cartItems, colors, addons } from "./schema"
import { File3D, Cart, CartItem, Addon, Color } from "./types"
import { eq } from "drizzle-orm"
import { InferModel } from "drizzle-orm"

export async function getAllFiles(): Promise<File3D[]> {
  const rows = await db.select().from(files)
  return rows.map((r) => ({
    id: r.id,
    name: r.displayName,
    filetype: r.filetype,
    filename: r.filename,
    dimensions: { x: Number(r.dimensionsX), y: Number(r.dimensionsY), z: Number(r.dimensionsZ) },
    mass: Number(r.mass),
    slicing_status: r.slicingStatus as File3D["slicing_status"],
    metadata: (r.metadata ?? {}) as Record<string, unknown>,
    images: (r.images ?? []) as string[],
    createdAt: r.createdAt?.getTime() ?? Date.now(),
  }))
}

export async function createFileRecord(input: Omit<File3D, "id" | "createdAt">) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const [row] = await db
    .insert(files)
    .values({
      displayName: input.name,
      filetype: input.filetype,
      filename: input.filename,
      dimensionsX: input.dimensions.x,
      dimensionsY: input.dimensions.y,
      dimensionsZ: input.dimensions.z,
      mass: input.mass,
      slicingStatus: input.slicing_status,
      metadata: input.metadata,
      images: input.images,
    } as any)
    .returning()
  return {
    id: row.id,
    name: row.displayName,
    filetype: row.filetype,
    filename: row.filename,
    dimensions: {
      x: Number(row.dimensionsX),
      y: Number(row.dimensionsY),
      z: Number(row.dimensionsZ),
    },
    mass: Number(row.mass),
    slicing_status: row.slicingStatus as File3D["slicing_status"],
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
    images: (row.images ?? []) as string[],
    createdAt: row.createdAt?.getTime() ?? Date.now(),
  }
}

export async function findFileById(id: string) {
  const [row] = await db.select().from(files).where(eq(files.id, id))
  if (!row) return undefined
  return {
    id: row.id,
    name: row.displayName,
    filetype: row.filetype,
    filename: row.filename,
    dimensions: { x: Number(row.dimensionsX), y: Number(row.dimensionsY), z: Number(row.dimensionsZ) },
    mass: Number(row.mass),
    slicing_status: row.slicingStatus as File3D["slicing_status"],
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
    images: (row.images ?? []) as string[],
    createdAt: row.createdAt?.getTime() ?? Date.now(),
  }
}

// For demo we use single cart row with id 'default_cart'.
const DEFAULT_CART_ID = "00000000-0000-0000-0000-000000000001"

export async function ensureDefaultCart() {
  const [existing] = await db.select().from(carts).where(eq(carts.id, DEFAULT_CART_ID))
  if (existing) return existing
  const [created] = await db.insert(carts).values({ id: DEFAULT_CART_ID }).returning()
  return created
}

export async function getCartWithItems() {
  await ensureDefaultCart()
  const cartRows = await db.select().from(carts).where(eq(carts.id, DEFAULT_CART_ID))
  const cart = cartRows[0]
  const rawItems = await db.select().from(cartItems).where(eq(cartItems.cartId, DEFAULT_CART_ID))
  const items = rawItems.map((it) => ({
    id: it.id,
    fileId: it.fileId,
    quality: it.quality as CartItem["quality"],
    quantity: it.quantity,
    colorId: it.colorId,
    addonIds: (it.addonIds ?? []) as string[],
    // cartId omitted
  }))
  return {
    id: cart.id,
    createdAt: cart.createdAt?.getTime() ?? Date.now(),
    updatedAt: cart.updatedAt?.getTime() ?? Date.now(),
    items,
  }
}

export async function addItemToCart(item: Omit<CartItem, "id">) {
  await ensureDefaultCart()
  await db.insert(cartItems).values({
    cartId: DEFAULT_CART_ID,
    fileId: item.fileId,
    quality: item.quality,
    quantity: item.quantity,
    colorId: item.colorId,
    addonIds: item.addonIds,
  })
  return await getCartWithItems()
}

export async function removeItemFromCart(itemId: string) {
  await db.delete(cartItems).where(eq(cartItems.id, itemId))
  return await getCartWithItems()
}

export async function clearCartItems() {
  await db.delete(cartItems).where(eq(cartItems.cartId, DEFAULT_CART_ID))
  return await getCartWithItems()
}

export async function listColors(): Promise<Color[]> {
  const rows = await db.select().from(colors)
  if (rows.length === 0) {
    const seed: Color[] = [
      { id: "white", name: "White", hex: "#FFFFFF" },
      { id: "black", name: "Black", hex: "#121113" },
      { id: "red", name: "Red", hex: "#FF4D4F" },
      { id: "blue", name: "Blue", hex: "#1890FF" },
    ]
    await db.insert(colors).values(seed)
    return seed
  }
  return rows
}

export async function listAddons(): Promise<Addon[]> {
  let rows = await db.select().from(addons)
  if (rows.length === 0) {
    const seed = [
      { id: "queue_priority", name: "Queue Priority", description: "Jump to the top of the orders queue", cost: "10" },
      { id: "print_assistance", name: "Print Assistance", description: "Assistance without extra cost", cost: "0" },
      { id: "multi_color_print", name: "Multi-color Print", description: "Multi-colour Print", cost: "0" },
    ] as any
    await db.insert(addons).values(seed)
    rows = seed as any
  }
  return rows.map((a: any) => ({ ...a, cost: Number(a.cost) }))
}