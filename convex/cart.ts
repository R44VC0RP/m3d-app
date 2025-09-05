import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Helper to calculate price based on mass
const calculatePrice = (massGrams: number): number => {
  // Base pricing: $0.05 per gram (adjust as needed)
  const basePrice = massGrams * 0.05;
  // Minimum price of $5
  return Math.max(5, Math.round(basePrice * 100) / 100);
};

// Create or get cart session
export const getOrCreateSession = mutation({
  args: {
    sessionId: v.string(),
    userId: v.optional(v.id("users")),
  },
  returns: v.object({
    sessionId: v.string(),
    userId: v.optional(v.id("users")),
  }),
  handler: async (ctx, args) => {
    // Check if session exists
    const existingSession = await ctx.db
      .query("cartSessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .unique();

    if (existingSession) {
      // If user is logging in, update the session
      if (args.userId && !existingSession.userId) {
        await ctx.db.patch(existingSession._id, {
          userId: args.userId,
        });
        
        // Migrate any cart items from session to user
        const cartItems = await ctx.db
          .query("cartFiles")
          .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
          .collect();
        
        for (const item of cartItems) {
          await ctx.db.patch(item._id, {
            userId: args.userId,
          });
        }
      }
      
      return {
        sessionId: existingSession.sessionId,
        userId: existingSession.userId || args.userId,
      };
    }

    // Create new session
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
    await ctx.db.insert("cartSessions", {
      sessionId: args.sessionId,
      userId: args.userId,
      expiresAt,
    });

    return {
      sessionId: args.sessionId,
      userId: args.userId,
    };
  },
});

// Add file to cart
export const addFileToCart = mutation({
  args: {
    sessionId: v.string(),
    userId: v.optional(v.id("users")),
    filename: v.string(),
    title: v.optional(v.string()),
    uploadthingFileKey: v.string(),
    uploadthingFileUrl: v.string(),
  },
  returns: v.id("cartFiles"),
  handler: async (ctx, args) => {
    // Ensure session exists - inline the logic instead of calling the mutation
    const existingSession = await ctx.db
      .query("cartSessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .unique();

    if (!existingSession) {
      // Create new session if it doesn't exist
      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
      await ctx.db.insert("cartSessions", {
        sessionId: args.sessionId,
        userId: args.userId,
        expiresAt,
      });
    } else if (args.userId && !existingSession.userId) {
      // Update session with user ID if logging in
      await ctx.db.patch(existingSession._id, {
        userId: args.userId,
      });
    }

    // Check if file already exists in cart
    const existingFile = await ctx.db
      .query("cartFiles")
      .withIndex("by_uploadthing_key", (q) => 
        q.eq("uploadthingFileKey", args.uploadthingFileKey)
      )
      .unique();

    if (existingFile) {
      return existingFile._id;
    }

    // Add file to cart
    const fileId = await ctx.db.insert("cartFiles", {
      filename: args.filename,
      title: args.title,
      uploadthingFileKey: args.uploadthingFileKey,
      uploadthingFileUrl: args.uploadthingFileUrl,
      status: "processing",
      sessionId: args.sessionId,
      userId: args.userId,
    });

    return fileId;
  },
});

// Update file processing results (public for webhook access)
export const updateFileProcessingResults = mutation({
  args: {
    uploadthingFileKey: v.string(),
    status: v.union(v.literal("ready"), v.literal("error")),
    massGrams: v.optional(v.number()),
    dimensions: v.optional(v.object({
      x: v.number(),
      y: v.number(),
      z: v.number(),
    })),
    errorMessage: v.optional(v.string()),
    processingTime: v.optional(v.number()),
    slicerTime: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const file = await ctx.db
      .query("cartFiles")
      .withIndex("by_uploadthing_key", (q) => 
        q.eq("uploadthingFileKey", args.uploadthingFileKey)
      )
      .unique();

    if (!file) {
      console.error("File not found for key:", args.uploadthingFileKey);
      return null;
    }

    // Calculate price if we have mass
    const calculatedPrice = args.massGrams ? calculatePrice(args.massGrams) : undefined;

    await ctx.db.patch(file._id, {
      status: args.status,
      massGrams: args.massGrams,
      dimensions: args.dimensions,
      errorMessage: args.errorMessage,
      processingTime: args.processingTime,
      slicerTime: args.slicerTime,
      calculatedPrice,
    });

    return null;
  },
});

// Get cart items for a session/user
export const getCartItems = query({
  args: {
    sessionId: v.string(),
    userId: v.optional(v.id("users")),
  },
  returns: v.array(v.object({
    _id: v.id("cartFiles"),
    _creationTime: v.number(),
    filename: v.string(),
    title: v.optional(v.string()),
    uploadthingFileKey: v.string(),
    uploadthingFileUrl: v.string(),
    status: v.union(
      v.literal("uploading"),
      v.literal("processing"),
      v.literal("ready"),
      v.literal("error")
    ),
    errorMessage: v.optional(v.string()),
    massGrams: v.optional(v.number()),
    dimensions: v.optional(v.object({
      x: v.number(),
      y: v.number(),
      z: v.number(),
    })),
    priceOverride: v.optional(v.number()),
    calculatedPrice: v.optional(v.number()),
    sessionId: v.string(),
    userId: v.optional(v.id("users")),
    processingTime: v.optional(v.number()),
    slicerTime: v.optional(v.number()),
  })),
  handler: async (ctx, args) => {
    let cartItems: Doc<"cartFiles">[] = [];

    // If user is logged in, get their items
    if (args.userId) {
      const userItems = await ctx.db
        .query("cartFiles")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();
      cartItems = [...cartItems, ...userItems];
    }

    // Also get session items (for recently added items before login)
    const sessionItems = await ctx.db
      .query("cartFiles")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();
    
    // Merge and deduplicate
    const itemMap = new Map<string, Doc<"cartFiles">>();
    [...sessionItems, ...cartItems].forEach(item => {
      itemMap.set(item.uploadthingFileKey, item);
    });

    return Array.from(itemMap.values()).sort((a, b) => 
      b._creationTime - a._creationTime
    );
  },
});

// Remove file from cart
export const removeFromCart = mutation({
  args: {
    fileId: v.id("cartFiles"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.fileId);
    return null;
  },
});

// Update file title or price override
export const updateCartItem = mutation({
  args: {
    fileId: v.id("cartFiles"),
    title: v.optional(v.string()),
    priceOverride: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const updates: Partial<Doc<"cartFiles">> = {};
    
    if (args.title !== undefined) {
      updates.title = args.title;
    }
    
    if (args.priceOverride !== undefined) {
      updates.priceOverride = args.priceOverride;
    }

    await ctx.db.patch(args.fileId, updates);
    return null;
  },
});

// Get cart summary
export const getCartSummary = query({
  args: {
    sessionId: v.string(),
    userId: v.optional(v.id("users")),
  },
  returns: v.object({
    itemCount: v.number(),
    readyCount: v.number(),
    processingCount: v.number(),
    errorCount: v.number(),
    totalPrice: v.number(),
  }),
  handler: async (ctx, args) => {
    // Inline the getCartItems logic
    let cartItems: Doc<"cartFiles">[] = [];

    // If user is logged in, get their items
    if (args.userId) {
      const userItems = await ctx.db
        .query("cartFiles")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();
      cartItems = [...cartItems, ...userItems];
    }

    // Also get session items (for recently added items before login)
    const sessionItems = await ctx.db
      .query("cartFiles")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();
    
    // Merge and deduplicate
    const itemMap = new Map<string, Doc<"cartFiles">>();
    [...sessionItems, ...cartItems].forEach(item => {
      itemMap.set(item.uploadthingFileKey, item);
    });

    const items = Array.from(itemMap.values());

    const summary = {
      itemCount: items.length,
      readyCount: 0,
      processingCount: 0,
      errorCount: 0,
      totalPrice: 0,
    };

    for (const item of items) {
      if (item.status === "ready") {
        summary.readyCount++;
        // Use price override if set, otherwise calculated price
        const price = item.priceOverride ?? item.calculatedPrice ?? 0;
        summary.totalPrice += price;
      } else if (item.status === "processing" || item.status === "uploading") {
        summary.processingCount++;
      } else if (item.status === "error") {
        summary.errorCount++;
      }
    }

    // Round to 2 decimal places
    summary.totalPrice = Math.round(summary.totalPrice * 100) / 100;

    return summary;
  },
});

// Merge anonymous cart with user cart on login
export const mergeCartsOnLogin = mutation({
  args: {
    sessionId: v.string(),
    userId: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Update session to link with user
    const session = await ctx.db
      .query("cartSessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .unique();

    if (session && !session.userId) {
      await ctx.db.patch(session._id, {
        userId: args.userId,
      });
    }

    // Update all cart items from this session to the user
    const sessionItems = await ctx.db
      .query("cartFiles")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    for (const item of sessionItems) {
      if (!item.userId) {
        await ctx.db.patch(item._id, {
          userId: args.userId,
        });
      }
    }

    return null;
  },
});
