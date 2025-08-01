import { NextRequest, NextResponse } from 'next/server';
import { db, carts, cartItems, cartItemAddons, files, colors, fileAddons } from '@/lib/db';
import { eq, and, isNull } from 'drizzle-orm';
import type { 
  CartGetRequest, 
  CartGetResponse, 
  CartPostRequest, 
  CartPostResponse, 
  CartDeleteRequest, 
  CartDeleteResponse,
  CartPutRequest,
  CartPutResponse
} from '@/lib/api-types';

// GET /api/cart?sessionId=<sessionId>
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      const response: CartGetResponse = {
        success: false,
        error: 'Session ID is required'
      };
      return NextResponse.json(response, { status: 400 });
    }

    const cart = await db.query.carts.findFirst({
      where: eq(carts.sessionId, sessionId),
      with: {
        items: {
          with: {
            file: true,
            color: true,
            addons: {
              with: {
                addon: true
              }
            }
          }
        }
      }
    });

    if (!cart) {
      const response: CartGetResponse = {
        success: false,
        error: 'Cart not found'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: CartGetResponse = {
      success: true,
      data: cart
    };
    return NextResponse.json(response);
  } catch (error) {
    const response: CartGetResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const body: CartPostRequest = await request.json();

    // Validate required fields
    if (!body.sessionId || !body.fileId) {
      const response: CartPostResponse = {
        success: false,
        error: 'Session ID and File ID are required'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validate quantity
    const quantity = body.quantity || 1;
    if (quantity < 1 || quantity > 100) {
      const response: CartPostResponse = {
        success: false,
        error: 'Quantity must be between 1 and 100'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validate quality
    const quality = body.quality || 'better';
    if (!['good', 'better', 'best'].includes(quality)) {
      const response: CartPostResponse = {
        success: false,
        error: 'Quality must be good, better, or best'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Create cart if it doesn't exist
    let cart = await db.query.carts.findFirst({
      where: eq(carts.sessionId, body.sessionId)
    });

    if (!cart) {
      const [newCart] = await db.insert(carts).values({
        sessionId: body.sessionId
      }).returning();
      cart = newCart;
    }

    // Check if item already exists in cart
    const existingItem = await db.query.cartItems.findFirst({
      where: and(
        eq(cartItems.cartId, cart.id),
        eq(cartItems.fileId, body.fileId),
        eq(cartItems.quality, quality),
        body.colorId ? eq(cartItems.colorId, body.colorId) : isNull(cartItems.colorId)
      )
    });

    if (existingItem) {
      // Update quantity if item exists
      const [updatedItem] = await db.update(cartItems)
        .set({ quantity: existingItem.quantity + quantity })
        .where(eq(cartItems.id, existingItem.id))
        .returning();

      const updatedItemWithRelations = await db.query.cartItems.findFirst({
        where: eq(cartItems.id, updatedItem.id),
        with: {
          addons: true
        }
      });

      const response: CartPostResponse = {
        success: true,
        data: updatedItemWithRelations!
      };
      return NextResponse.json(response);
    }

    // Create new cart item
    const [cartItem] = await db.insert(cartItems).values({
      cartId: cart.id,
      fileId: body.fileId,
      quantity: quantity,
      quality: quality,
      colorId: body.colorId || null
    }).returning();

    // Add addons if provided
    if (body.addonIds && body.addonIds.length > 0) {
      await db.insert(cartItemAddons).values(
        body.addonIds.map(addonId => ({
          cartItemId: cartItem.id,
          addonId: addonId
        }))
      );
    }

    // Fetch the created item with addons
    const createdItem = await db.query.cartItems.findFirst({
      where: eq(cartItems.id, cartItem.id),
      with: {
        addons: true
      }
    });

    const response: CartPostResponse = {
      success: true,
      data: createdItem!
    };
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const response: CartPostResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/cart - Update cart item
export async function PUT(request: NextRequest) {
  try {
    const body: CartPutRequest = await request.json();

    if (!body.sessionId || !body.itemId) {
      const response: CartPutResponse = {
        success: false,
        error: 'Session ID and Item ID are required'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validate quantity if provided
    if (body.quantity !== undefined && (body.quantity < 1 || body.quantity > 100)) {
      const response: CartPutResponse = {
        success: false,
        error: 'Quantity must be between 1 and 100'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validate quality if provided
    if (body.quality && !['good', 'better', 'best'].includes(body.quality)) {
      const response: CartPutResponse = {
        success: false,
        error: 'Quality must be good, better, or best'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Update cart item
    const updateData: any = {};
    if (body.quantity !== undefined) updateData.quantity = body.quantity;
    if (body.quality !== undefined) updateData.quality = body.quality;
    if (body.colorId !== undefined) updateData.colorId = body.colorId;

    await db.update(cartItems)
      .set(updateData)
      .where(eq(cartItems.id, body.itemId));

    // Update addons if provided
    if (body.addonIds !== undefined) {
      // Remove existing addons
      await db.delete(cartItemAddons)
        .where(eq(cartItemAddons.cartItemId, body.itemId));

      // Add new addons
      if (body.addonIds.length > 0) {
        await db.insert(cartItemAddons).values(
          body.addonIds.map(addonId => ({
            cartItemId: body.itemId,
            addonId: addonId
          }))
        );
      }
    }

    // Fetch updated item with addons
    const item = await db.query.cartItems.findFirst({
      where: eq(cartItems.id, body.itemId),
      with: {
        addons: true
      }
    });

    const response: CartPutResponse = {
      success: true,
      data: item!
    };
    return NextResponse.json(response);
  } catch (error) {
    const response: CartPutResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/cart?sessionId=<sessionId>&itemId=<itemId>
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');
    const itemId = searchParams.get('itemId');

    if (!sessionId) {
      const response: CartDeleteResponse = {
        success: false,
        error: 'Session ID is required'
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (itemId) {
      // Delete specific item
      await db.delete(cartItems).where(eq(cartItems.id, itemId));

      const response: CartDeleteResponse = {
        success: true,
        message: 'Cart item deleted successfully'
      };
      return NextResponse.json(response);
    } else {
      // Clear entire cart
      const cart = await db.query.carts.findFirst({
        where: eq(carts.sessionId, sessionId)
      });

      if (cart) {
        await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
      }

      const response: CartDeleteResponse = {
        success: true,
        message: 'Cart cleared successfully'
      };
      return NextResponse.json(response);
    }
  } catch (error) {
    const response: CartDeleteResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    };
    return NextResponse.json(response, { status: 500 });
  }
}