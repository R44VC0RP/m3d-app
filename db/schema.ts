import { pgTable, text, timestamp, boolean, real, jsonb, integer } from "drizzle-orm/pg-core";

// ============================================
// BetterAuth Tables
// ============================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// Application Tables
// ============================================

// Uploaded 3D files awaiting/processed by Mandarin3D
export const uploadedFile = pgTable("uploaded_file", {
  id: text("id").primaryKey(), // Our generated UUID
  uploadthingKey: text("uploadthing_key").notNull(), // UploadThing file key
  uploadthingUrl: text("uploadthing_url").notNull(), // UploadThing file URL
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }), // Optional, for guest uploads
  sessionId: text("session_id").notNull(), // For guest cart tracking (required)
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  
  // Processing status
  status: text("status", { 
    enum: ["pending", "processing", "success", "error"] 
  }).notNull().default("processing"),
  
  // Mandarin3D results (populated after callback)
  massGrams: real("mass_grams"),
  dimensions: jsonb("dimensions").$type<{ x: number; y: number; z: number }>(),
  processingTime: real("processing_time"),
  slicerTime: real("slicer_time"),
  errorMessage: text("error_message"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Cart items
export const cartItem = pgTable("cart_item", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  sessionId: text("session_id"), // For guest cart tracking
  uploadedFileId: text("uploaded_file_id")
    .notNull()
    .references(() => uploadedFile.id, { onDelete: "cascade" }),
  
  // Print configuration
  quantity: integer("quantity").notNull().default(1),
  material: text("material").notNull().default("PLA"),
  color: text("color").notNull().default("Black"),
  infill: integer("infill").notNull().default(20), // percentage
  
  // Calculated price (in cents)
  unitPrice: integer("unit_price"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Export types
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;
export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;
export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;
export type UploadedFile = typeof uploadedFile.$inferSelect;
export type NewUploadedFile = typeof uploadedFile.$inferInsert;
export type CartItem = typeof cartItem.$inferSelect;
export type NewCartItem = typeof cartItem.$inferInsert;

