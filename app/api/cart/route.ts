import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
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

    const cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: {
            file: true,
            color: true,
            addons: {
              include: {
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
    let cart = await prisma.cart.findUnique({
      where: { sessionId: body.sessionId }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { sessionId: body.sessionId }
      });
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_fileId_quality_colorId: {
          cartId: cart.id,
          fileId: body.fileId,
          quality: quality,
          colorId: body.colorId || null
        }
      }
    });

    if (existingItem) {
      // Update quantity if item exists
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });

      const response: CartPostResponse = {
        success: true,
        data: updatedItem
      };
      return NextResponse.json(response);
    }

    // Create new cart item
    const cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        fileId: body.fileId,
        quantity: quantity,
        quality: quality,
        colorId: body.colorId
      }
    });

    // Add addons if provided
    if (body.addonIds && body.addonIds.length > 0) {
      await prisma.cartItemAddon.createMany({
        data: body.addonIds.map(addonId => ({
          cartItemId: cartItem.id,
          addonId: addonId
        }))
      });
    }

    // Fetch the created item with addons
    const createdItem = await prisma.cartItem.findUnique({
      where: { id: cartItem.id },
      include: {
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

    const updatedItem = await prisma.cartItem.update({
      where: { id: body.itemId },
      data: updateData
    });

    // Update addons if provided
    if (body.addonIds !== undefined) {
      // Remove existing addons
      await prisma.cartItemAddon.deleteMany({
        where: { cartItemId: body.itemId }
      });

      // Add new addons
      if (body.addonIds.length > 0) {
        await prisma.cartItemAddon.createMany({
          data: body.addonIds.map(addonId => ({
            cartItemId: body.itemId,
            addonId: addonId
          }))
        });
      }
    }

    // Fetch updated item with addons
    const item = await prisma.cartItem.findUnique({
      where: { id: body.itemId },
      include: {
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
      await prisma.cartItem.delete({
        where: { id: itemId }
      });

      const response: CartDeleteResponse = {
        success: true,
        message: 'Cart item deleted successfully'
      };
      return NextResponse.json(response);
    } else {
      // Clear entire cart
      const cart = await prisma.cart.findUnique({
        where: { sessionId }
      });

      if (cart) {
        await prisma.cartItem.deleteMany({
          where: { cartId: cart.id }
        });
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