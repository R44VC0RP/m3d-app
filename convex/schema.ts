import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - stores user profile information
  users: defineTable({
    clerkId: v.string(), // Clerk user ID
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      country: v.string(),
    })),
    isVendor: v.boolean(), // Whether user can list products
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_vendor_status", ["isVendor"]),

  // Products table - items available for purchase/printing
  products: defineTable({
    title: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.union(
      v.literal("3d_prints"),
      v.literal("laser_cut"),
      v.literal("enamel_pins"),
      v.literal("stickers"),
      v.literal("accessories"),
      v.literal("custom")
    ),
    tags: v.array(v.string()),
    imageUrls: v.array(v.string()), // Array of image URLs
    fileIds: v.array(v.id("_storage")), // STL files, designs, etc.
    vendorId: v.id("users"), // Who created this product
    isActive: v.boolean(),
    isFeatured: v.boolean(),
    printSettings: v.optional(v.object({
      material: v.string(),
      infill: v.number(),
      layerHeight: v.number(),
      supports: v.boolean(),
      estimatedPrintTime: v.number(), // in minutes
    })),
    inventory: v.optional(v.number()), // null for unlimited/print-on-demand
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_vendor", ["vendorId"])
    .index("by_category", ["category"])
    .index("by_featured", ["isFeatured"])
    .index("by_active", ["isActive"])
    .searchIndex("search_products", {
      searchField: "title",
      filterFields: ["category", "isActive", "isFeatured", "vendorId"]
    }),

  // Orders table - customer orders
  orders: defineTable({
    customerId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("processing"),
      v.literal("printing"),
      v.literal("post_processing"),
      v.literal("shipping"),
      v.literal("delivered"),
      v.literal("cancelled"),
      v.literal("refunded")
    ),
    totalAmount: v.number(),
    shippingAddress: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      country: v.string(),
    }),
    trackingNumber: v.optional(v.string()),
    notes: v.optional(v.string()),
    estimatedDelivery: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_customer", ["customerId"])
    .index("by_status", ["status"])
    .index("by_creation_date", ["createdAt"]),

  // Order Items table - individual items within an order
  orderItems: defineTable({
    orderId: v.id("orders"),
    productId: v.optional(v.id("products")), // null for custom orders
    quantity: v.number(),
    unitPrice: v.number(),
    totalPrice: v.number(),
    customizations: v.optional(v.object({
      color: v.optional(v.string()),
      material: v.optional(v.string()),
      size: v.optional(v.string()),
      notes: v.optional(v.string()),
    })),
    fileIds: v.array(v.id("_storage")), // Customer uploaded files for custom orders
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("printing"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  })
    .index("by_order", ["orderId"])
    .index("by_product", ["productId"])
    .index("by_status", ["status"]),

  // File Uploads table - tracks uploaded files with metadata
  fileUploads: defineTable({
    userId: v.id("users"),
    storageId: v.id("_storage"),
    originalName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    purpose: v.union(
      v.literal("product_image"),
      v.literal("stl_file"),
      v.literal("design_file"),
      v.literal("custom_order"),
      v.literal("profile_image")
    ),
    isProcessed: v.boolean(),
    processingNotes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_purpose", ["purpose"])
    .index("by_storage_id", ["storageId"]),

  // Quotes table - for custom print requests
  quotes: defineTable({
    customerId: v.id("users"),
    title: v.string(),
    description: v.string(),
    fileIds: v.array(v.id("_storage")),
    requirements: v.object({
      material: v.optional(v.string()),
      color: v.optional(v.string()),
      quantity: v.number(),
      deadline: v.optional(v.number()),
      specialInstructions: v.optional(v.string()),
    }),
    status: v.union(
      v.literal("pending"),
      v.literal("reviewing"),
      v.literal("quoted"),
      v.literal("approved"),
      v.literal("declined"),
      v.literal("completed")
    ),
    quotedPrice: v.optional(v.number()),
    estimatedDelivery: v.optional(v.number()),
    vendorNotes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_customer", ["customerId"])
    .index("by_status", ["status"]),

  // Reviews table - product reviews and ratings
  reviews: defineTable({
    productId: v.id("products"),
    customerId: v.id("users"),
    orderId: v.optional(v.id("orders")),
    rating: v.number(), // 1-5 stars
    title: v.optional(v.string()),
    comment: v.optional(v.string()),
    imageUrls: v.optional(v.array(v.string())),
    isVerifiedPurchase: v.boolean(),
    isVisible: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_product", ["productId"])
    .index("by_customer", ["customerId"])
    .index("by_rating", ["rating"])
    .index("by_verified", ["isVerifiedPurchase"]),

  // Messages/Communications table - for customer support
  messages: defineTable({
    senderId: v.id("users"),
    recipientId: v.optional(v.id("users")), // null for admin messages
    subject: v.string(),
    content: v.string(),
    isRead: v.boolean(),
    messageType: v.union(
      v.literal("support"),
      v.literal("order_update"),
      v.literal("quote_response"),
      v.literal("general")
    ),
    relatedOrderId: v.optional(v.id("orders")),
    relatedQuoteId: v.optional(v.id("quotes")),
    createdAt: v.number(),
  })
    .index("by_sender", ["senderId"])
    .index("by_recipient", ["recipientId"])
    .index("by_type", ["messageType"])
    .index("by_read_status", ["isRead"]),

  // Keep the original tasks table for the demo
  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
  }),

  // Cart functionality tables
  cartFiles: defineTable({
    // File identification
    filename: v.string(),
    title: v.optional(v.string()),
    uploadthingFileKey: v.string(),
    uploadthingFileUrl: v.string(),
    
    // Processing status
    status: v.union(
      v.literal("uploading"),
      v.literal("processing"),
      v.literal("ready"),
      v.literal("error")
    ),
    errorMessage: v.optional(v.string()),
    
    // Slicing results
    massGrams: v.optional(v.number()),
    dimensions: v.optional(v.object({
      x: v.number(),
      y: v.number(),
      z: v.number(),
    })),
    
    // Pricing
    priceOverride: v.optional(v.number()),
    calculatedPrice: v.optional(v.number()),
    
    // Cart association
    sessionId: v.string(), // For anonymous users
    userId: v.optional(v.id("users")), // For logged-in users
    
    // Metadata
    processingTime: v.optional(v.number()),
    slicerTime: v.optional(v.number()),
  })
    .index("by_session", ["sessionId"])
    .index("by_user", ["userId"])
    .index("by_uploadthing_key", ["uploadthingFileKey"]),
  
  // Session management for anonymous carts
  cartSessions: defineTable({
    sessionId: v.string(),
    userId: v.optional(v.id("users")), // Links to user when they log in
    expiresAt: v.number(),
  })
    .index("by_session_id", ["sessionId"])
    .index("by_user", ["userId"]),
});
