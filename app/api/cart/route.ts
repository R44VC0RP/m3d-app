import { NextRequest, NextResponse } from 'next/server';
import { db, cartItems, files, colors, fileAddons, cartAddons } from '@/lib/db';
import { CartItem, FileAddon } from '@/lib/types';
import { eq, desc } from 'drizzle-orm';

// Extended cart item with file details and addons
interface CartItemWithDetails extends CartItem {
  file: {
    id: string;
    name: string;
    filetype: string;
    filename: string;
    dimensions: { x: number; y: number; z: number };
    mass: number;
  };
  addons: FileAddon[];
}

// Request types
interface CartGETRequest {
  // No body for GET requests
}

interface CartPOSTRequest {
  file_id: string;
  quality?: 'good' | 'better' | 'best';
  quantity?: number;
  color: string;
  addon_ids?: string[];
}

interface CartDELETERequest {
  // No body for DELETE requests - clears entire cart
}

// Response types
interface CartGETResponse {
  success: boolean;
  data: CartItemWithDetails[];
  error?: string;
}

interface CartPOSTResponse {
  success: boolean;
  data?: CartItemWithDetails;
  error?: string;
}

interface CartDELETEResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// GET - Retrieve all cart items with file details and addons
export async function GET(request: NextRequest): Promise<NextResponse<CartGETResponse>> {
  try {
    // Get cart items with file details using Drizzle's query API
    const cartItemsWithFiles = await db
      .select({
        cartItem: cartItems,
        file: files,
        color: colors,
      })
      .from(cartItems)
      .innerJoin(files, eq(cartItems.fileId, files.id))
      .innerJoin(colors, eq(cartItems.color, colors.id))
      .orderBy(desc(cartItems.createdAt));

    // Get addons for each cart item
    const cartItemsWithDetails: CartItemWithDetails[] = [];
    
    for (const row of cartItemsWithFiles) {
      const addonsData = await db
        .select({
          addon: fileAddons,
        })
        .from(cartAddons)
        .innerJoin(fileAddons, eq(cartAddons.addonId, fileAddons.id))
        .where(eq(cartAddons.cartItemId, row.cartItem.id));

      const formattedAddons: FileAddon[] = addonsData.map(item => ({
        id: item.addon.id,
        name: item.addon.name,
        description: item.addon.description,
        price: item.addon.price,
        is_active: item.addon.isActive,
        created_at: item.addon.createdAt.toISOString(),
        updated_at: item.addon.updatedAt.toISOString()
      }));

      const cartItemWithDetails: CartItemWithDetails = {
        id: row.cartItem.id,
        file_id: row.cartItem.fileId,
        quality: row.cartItem.quality,
        quantity: row.cartItem.quantity,
        color: row.cartItem.color,
        created_at: row.cartItem.createdAt.toISOString(),
        updated_at: row.cartItem.updatedAt.toISOString(),
        file: {
          id: row.file.id,
          name: row.file.name,
          filetype: row.file.filetype,
          filename: row.file.filename,
          dimensions: {
            x: row.file.dimensionsX,
            y: row.file.dimensionsY,
            z: row.file.dimensionsZ
          },
          mass: row.file.mass
        },
        addons: formattedAddons
      };

      cartItemsWithDetails.push(cartItemWithDetails);
    }

    return NextResponse.json({
      success: true,
      data: cartItemsWithDetails
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest): Promise<NextResponse<CartPOSTResponse>> {
  try {
    const body: CartPOSTRequest = await request.json();
    
    // Validation
    if (!body.file_id || !body.color) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: file_id, color'
      }, { status: 400 });
    }

    const quality = body.quality || 'better';
    const quantity = body.quantity || 1;

    if (!['good', 'better', 'best'].includes(quality)) {
      return NextResponse.json({
        success: false,
        error: 'Quality must be one of: good, better, best'
      }, { status: 400 });
    }

    if (quantity < 1 || quantity > 100) {
      return NextResponse.json({
        success: false,
        error: 'Quantity must be between 1 and 100'
      }, { status: 400 });
    }

    // First verify the file exists
    const [existingFile] = await db.select().from(files).where(eq(files.id, body.file_id));

    if (!existingFile) {
      return NextResponse.json({
        success: false,
        error: 'File not found'
      }, { status: 404 });
    }

    // Insert cart item
    const [insertedCartItem] = await db.insert(cartItems).values({
      fileId: body.file_id,
      quality: quality,
      quantity: quantity,
      color: body.color,
    }).returning();

    // Insert addons if provided
    if (body.addon_ids && body.addon_ids.length > 0) {
      const addonInserts = body.addon_ids.map(addonId => ({
        cartItemId: insertedCartItem.id,
        addonId: addonId,
      }));
      
      await db.insert(cartAddons).values(addonInserts);
    }

    // Get the complete cart item with details
    const cartItemWithFile = await db
      .select({
        cartItem: cartItems,
        file: files,
        color: colors,
      })
      .from(cartItems)
      .innerJoin(files, eq(cartItems.fileId, files.id))
      .innerJoin(colors, eq(cartItems.color, colors.id))
      .where(eq(cartItems.id, insertedCartItem.id));

    if (cartItemWithFile.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Failed to retrieve created cart item'
      }, { status: 500 });
    }

    const row = cartItemWithFile[0];

    // Get addons for this cart item
    const addonsData = await db
      .select({
        addon: fileAddons,
      })
      .from(cartAddons)
      .innerJoin(fileAddons, eq(cartAddons.addonId, fileAddons.id))
      .where(eq(cartAddons.cartItemId, insertedCartItem.id));

    const formattedAddons: FileAddon[] = addonsData.map(item => ({
      id: item.addon.id,
      name: item.addon.name,
      description: item.addon.description,
      price: item.addon.price,
      is_active: item.addon.isActive,
      created_at: item.addon.createdAt.toISOString(),
      updated_at: item.addon.updatedAt.toISOString()
    }));

    const cartItemWithDetails: CartItemWithDetails = {
      id: row.cartItem.id,
      file_id: row.cartItem.fileId,
      quality: row.cartItem.quality,
      quantity: row.cartItem.quantity,
      color: row.cartItem.color,
      created_at: row.cartItem.createdAt.toISOString(),
      updated_at: row.cartItem.updatedAt.toISOString(),
      file: {
        id: row.file.id,
        name: row.file.name,
        filetype: row.file.filetype,
        filename: row.file.filename,
        dimensions: {
          x: row.file.dimensionsX,
          y: row.file.dimensionsY,
          z: row.file.dimensionsZ
        },
        mass: row.file.mass
      },
      addons: formattedAddons
    };

    return NextResponse.json({
      success: true,
      data: cartItemWithDetails
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Clear entire cart
export async function DELETE(request: NextRequest): Promise<NextResponse<CartDELETEResponse>> {
  try {
    // Delete cart addons first (cascading will handle this automatically due to foreign key constraints)
    await db.delete(cartAddons);
    
    // Then delete cart items
    const deletedItems = await db.delete(cartItems);

    return NextResponse.json({
      success: true,
      message: `Cleared cart successfully`
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

