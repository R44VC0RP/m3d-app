import { pgTable, text, uuid, timestamp, numeric, integer, jsonb, pgEnum, varchar } from "drizzle-orm/pg-core"

export const slicingStatusEnum = pgEnum("slicing_status", ["pending", "processing", "sliced", "error"])

export const qualityEnum = pgEnum("quality", ["Good", "Better", "Best"])

export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  displayName: text("display_name").notNull(),
  filetype: text("filetype").notNull(),
  filename: text("filename").notNull(),
  dimensionsX: numeric("dimensions_x").notNull(),
  dimensionsY: numeric("dimensions_y").notNull(),
  dimensionsZ: numeric("dimensions_z").notNull(),
  mass: numeric("mass").notNull(),
  slicingStatus: slicingStatusEnum("slicing_status").notNull(),
  metadata: jsonb("metadata"),
  images: text("images").array(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
})

export const colors = pgTable("colors", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name").notNull(),
  hex: varchar("hex", { length: 7 }).notNull(),
})

export const addons = pgTable("addons", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  cost: numeric("cost").notNull(),
})

export const carts = pgTable("carts", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
})

export const cartItems = pgTable("cart_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  cartId: uuid("cart_id").notNull().references(() => carts.id, { onDelete: "cascade" }),
  fileId: uuid("file_id").notNull().references(() => files.id, { onDelete: "cascade" }),
  quality: qualityEnum("quality").notNull(),
  quantity: integer("quantity").notNull(),
  colorId: varchar("color_id", { length: 64 }).notNull().references(() => colors.id),
  addonIds: varchar("addon_ids", { length: 64 }).array(),
})