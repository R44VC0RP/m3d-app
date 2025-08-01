import { pgTable, text, real, timestamp, boolean, integer, json, unique, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// File table
export const files = pgTable('files', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  filetype: text('filetype').notNull(),
  filename: text('filename').notNull(),
  dimensionX: real('dimension_x').notNull(),
  dimensionY: real('dimension_y').notNull(),
  dimensionZ: real('dimension_z').notNull(),
  mass: real('mass').notNull(), // in grams
  slicingStatus: text('slicing_status').notNull().default('pending'),
  metadata: json('metadata'),
  price: real('price').notNull().default(0),
  images: text('images').array().notNull().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});

// Color table
export const colors = pgTable('colors', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  hexCode: text('hex_code').notNull().unique(),
  available: boolean('available').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});

// FileAddon table
export const fileAddons = pgTable('file_addons', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  description: text('description'),
  price: real('price').notNull().default(0),
  type: text('type').notNull().unique(), // e.g., "queue_priority", "print_assistance", "multi_color"
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});

// Cart table
export const carts = pgTable('carts', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  sessionId: text('session_id').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});

// CartItem table
export const cartItems = pgTable('cart_items', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  cartId: text('cart_id').notNull().references(() => carts.id, { onDelete: 'cascade' }),
  fileId: text('file_id').notNull().references(() => files.id),
  quantity: integer('quantity').notNull().default(1),
  quality: text('quality').notNull().default('better'), // "good", "better", "best"
  colorId: text('color_id').references(() => colors.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  uniqueCartItem: unique().on(table.cartId, table.fileId, table.quality, table.colorId),
  cartIdIdx: index('cart_id_idx').on(table.cartId),
  fileIdIdx: index('file_id_idx').on(table.fileId),
}));

// CartItemAddon table
export const cartItemAddons = pgTable('cart_item_addons', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  cartItemId: text('cart_item_id').notNull().references(() => cartItems.id, { onDelete: 'cascade' }),
  addonId: text('addon_id').notNull().references(() => fileAddons.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  uniqueCartItemAddon: unique().on(table.cartItemId, table.addonId),
  cartItemIdIdx: index('cart_item_id_idx').on(table.cartItemId),
}));

// Relations
export const filesRelations = relations(files, ({ many }) => ({
  cartItems: many(cartItems),
}));

export const colorsRelations = relations(colors, ({ many }) => ({
  cartItems: many(cartItems),
}));

export const fileAddonsRelations = relations(fileAddons, ({ many }) => ({
  cartItemAddons: many(cartItemAddons),
}));

export const cartsRelations = relations(carts, ({ many }) => ({
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one, many }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  file: one(files, {
    fields: [cartItems.fileId],
    references: [files.id],
  }),
  color: one(colors, {
    fields: [cartItems.colorId],
    references: [colors.id],
  }),
  addons: many(cartItemAddons),
}));

export const cartItemAddonsRelations = relations(cartItemAddons, ({ one }) => ({
  cartItem: one(cartItems, {
    fields: [cartItemAddons.cartItemId],
    references: [cartItems.id],
  }),
  addon: one(fileAddons, {
    fields: [cartItemAddons.addonId],
    references: [fileAddons.id],
  }),
}));

// Type exports
export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
export type Color = typeof colors.$inferSelect;
export type NewColor = typeof colors.$inferInsert;
export type FileAddon = typeof fileAddons.$inferSelect;
export type NewFileAddon = typeof fileAddons.$inferInsert;
export type Cart = typeof carts.$inferSelect;
export type NewCart = typeof carts.$inferInsert;
export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;
export type CartItemAddon = typeof cartItemAddons.$inferSelect;
export type NewCartItemAddon = typeof cartItemAddons.$inferInsert;