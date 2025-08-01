import { pgTable, text, real, integer, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Files table
export const files = pgTable('files', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  filetype: text('filetype').notNull(),
  filename: text('filename').notNull(),
  dimensionsX: real('dimensions_x').notNull(),
  dimensionsY: real('dimensions_y').notNull(),
  dimensionsZ: real('dimensions_z').notNull(),
  mass: real('mass').notNull(),
  slicingStatus: text('slicing_status', { 
    enum: ['pending', 'processing', 'completed', 'failed'] 
  }).notNull().default('pending'),
  metadata: text('metadata').notNull().default('{}'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Colors table
export const colors = pgTable('colors', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  hexCode: text('hex_code').notNull(),
  isAvailable: boolean('is_available').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// File addons table
export const fileAddons = pgTable('file_addons', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: integer('price').notNull().default(0), // in cents
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Cart items table
export const cartItems = pgTable('cart_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  fileId: uuid('file_id').notNull().references(() => files.id, { onDelete: 'cascade' }),
  quality: text('quality', { 
    enum: ['good', 'better', 'best'] 
  }).notNull().default('better'),
  quantity: integer('quantity').notNull().default(1),
  color: text('color').notNull().references(() => colors.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Cart addons junction table
export const cartAddons = pgTable('cart_addons', {
  id: uuid('id').primaryKey().defaultRandom(),
  cartItemId: uuid('cart_item_id').notNull().references(() => cartItems.id, { onDelete: 'cascade' }),
  addonId: text('addon_id').notNull().references(() => fileAddons.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Relations
export const filesRelations = relations(files, ({ many }) => ({
  cartItems: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one, many }) => ({
  file: one(files, {
    fields: [cartItems.fileId],
    references: [files.id],
  }),
  color: one(colors, {
    fields: [cartItems.color],
    references: [colors.id],
  }),
  addons: many(cartAddons),
}));

export const cartAddonsRelations = relations(cartAddons, ({ one }) => ({
  cartItem: one(cartItems, {
    fields: [cartAddons.cartItemId],
    references: [cartItems.id],
  }),
  addon: one(fileAddons, {
    fields: [cartAddons.addonId],
    references: [fileAddons.id],
  }),
}));

export const colorsRelations = relations(colors, ({ many }) => ({
  cartItems: many(cartItems),
}));

export const fileAddonsRelations = relations(fileAddons, ({ many }) => ({
  cartAddons: many(cartAddons),
}));

// Types
export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;

export type Color = typeof colors.$inferSelect;
export type NewColor = typeof colors.$inferInsert;

export type FileAddon = typeof fileAddons.$inferSelect;
export type NewFileAddon = typeof fileAddons.$inferInsert;

export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;

export type CartAddon = typeof cartAddons.$inferSelect;
export type NewCartAddon = typeof cartAddons.$inferInsert;