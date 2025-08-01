import { NextRequest, NextResponse } from 'next/server';
import { db, cartItems, cartAddons } from '@/lib/db';
import { eq } from 'drizzle-orm';

// Request types
interface CartItemDELETERequest {
  // No body for DELETE requests
}

// Response types
interface CartItemDELETEResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// DELETE - Remove a specific cart item by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<CartItemDELETEResponse>> {
  try {
    const { id } = await params;
    
    // First check if cart item exists
    const [existingCartItem] = await db.select().from(cartItems).where(eq(cartItems.id, id));

    if (!existingCartItem) {
      return NextResponse.json({
        success: false,
        error: 'Cart item not found'
      }, { status: 404 });
    }

    // Delete cart addons first (foreign key constraint)
    await db.delete(cartAddons).where(eq(cartAddons.cartItemId, id));

    // Then delete the cart item
    await db.delete(cartItems).where(eq(cartItems.id, id));

    return NextResponse.json({
      success: true,
      message: 'Cart item deleted successfully'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}