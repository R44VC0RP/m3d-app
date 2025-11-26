import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { cartItem, uploadedFile } from '@/db/schema';
import { SESSION_COOKIE_NAME } from '@/lib/session';

// GET: Fetch cart items with joined file data by session ID
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      );
    }

    // Fetch cart items with joined file data
    const items = await db
      .select({
        // Cart item fields
        id: cartItem.id,
        quantity: cartItem.quantity,
        material: cartItem.material,
        color: cartItem.color,
        infill: cartItem.infill,
        unitPrice: cartItem.unitPrice,
        createdAt: cartItem.createdAt,
        // File fields
        fileId: uploadedFile.id,
        fileName: uploadedFile.fileName,
        fileSize: uploadedFile.fileSize,
        uploadthingUrl: uploadedFile.uploadthingUrl,
        status: uploadedFile.status,
        massGrams: uploadedFile.massGrams,
        dimensions: uploadedFile.dimensions,
        errorMessage: uploadedFile.errorMessage,
      })
      .from(cartItem)
      .innerJoin(uploadedFile, eq(cartItem.uploadedFileId, uploadedFile.id))
      .where(eq(cartItem.sessionId, sessionId))
      .orderBy(cartItem.createdAt);

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// DELETE: Remove cart item by ID
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('id');

    if (!itemId) {
      return NextResponse.json(
        { error: 'No item ID provided' },
        { status: 400 }
      );
    }

    // Delete cart item (only if it belongs to this session)
    const result = await db
      .delete(cartItem)
      .where(
        and(
          eq(cartItem.id, itemId),
          eq(cartItem.sessionId, sessionId)
        )
      )
      .returning({ id: cartItem.id });

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Cart item not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, deletedId: itemId });
  } catch (error) {
    console.error('Error deleting cart item:', error);
    return NextResponse.json(
      { error: 'Failed to delete cart item' },
      { status: 500 }
    );
  }
}

// PATCH: Update cart item (quantity, color, material, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, quantity, material, color, infill } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'No item ID provided' },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (quantity !== undefined) updateData.quantity = quantity;
    if (material !== undefined) updateData.material = material;
    if (color !== undefined) updateData.color = color;
    if (infill !== undefined) updateData.infill = infill;

    // Update cart item (only if it belongs to this session)
    const result = await db
      .update(cartItem)
      .set(updateData)
      .where(
        and(
          eq(cartItem.id, id),
          eq(cartItem.sessionId, sessionId)
        )
      )
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Cart item not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, item: result[0] });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

