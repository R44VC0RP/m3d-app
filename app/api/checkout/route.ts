import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { cartItem, uploadedFile } from '@/db/schema';
import { SESSION_COOKIE_NAME } from '@/lib/session';
import {
  createDraftOrder,
  buildDraftOrderLineItems,
  buildDraftOrderTags,
  buildNoteAttributes,
  CartItemForCheckout,
  OrderOptions,
} from '@/lib/shopify';

// Calculate base price from mass (same logic as cart page)
function calculateBasePrice(massGrams: number | null | undefined): number {
  if (!massGrams) return 0;
  return Number((massGrams * 0.05 + 1).toFixed(2));
}

// Default quality value
const DEFAULT_QUALITY = '0.20mm';

interface CheckoutRequestBody {
  comments?: string;
  multicolor?: boolean;
  priority?: boolean;
  assistance?: boolean;
  email?: string;
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      );
    }

    // Parse request body for order options
    const body: CheckoutRequestBody = await request.json().catch(() => ({}));

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
        // File fields
        fileId: uploadedFile.id,
        fileName: uploadedFile.fileName,
        status: uploadedFile.status,
        massGrams: uploadedFile.massGrams,
        dimensions: uploadedFile.dimensions,
      })
      .from(cartItem)
      .innerJoin(uploadedFile, eq(cartItem.uploadedFileId, uploadedFile.id))
      .where(eq(cartItem.sessionId, sessionId));

    if (items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Validate all items are successfully processed
    const processingItems = items.filter(
      (item) => item.status === 'processing' || item.status === 'pending'
    );
    if (processingItems.length > 0) {
      return NextResponse.json(
        { error: 'Some items are still processing. Please wait for all items to complete.' },
        { status: 400 }
      );
    }

    const errorItems = items.filter((item) => item.status === 'error');
    if (errorItems.length > 0) {
      return NextResponse.json(
        { error: 'Some items have errors. Please remove them before checkout.' },
        { status: 400 }
      );
    }

    // Build cart items for checkout
    const cartItemsForCheckout: CartItemForCheckout[] = items
      .filter((item) => item.status === 'success' && item.massGrams && item.dimensions)
      .map((item) => ({
        fileId: item.fileId,
        fileName: item.fileName,
        color: item.color,
        material: item.material,
        quality: DEFAULT_QUALITY,
        quantity: item.quantity,
        unitPrice: item.unitPrice ? item.unitPrice / 100 : calculateBasePrice(item.massGrams),
        massGrams: item.massGrams!,
        dimensions: item.dimensions as { x: number; y: number; z: number },
      }));

    if (cartItemsForCheckout.length === 0) {
      return NextResponse.json(
        { error: 'No valid items in cart' },
        { status: 400 }
      );
    }

    // Build order options
    const orderOptions: OrderOptions = {
      comments: body.comments,
      multicolor: body.multicolor,
      priority: body.priority,
      assistance: body.assistance,
    };

    // Build line items including add-ons
    const lineItems = buildDraftOrderLineItems(cartItemsForCheckout, orderOptions);

    // Build tags and note attributes
    const tags = buildDraftOrderTags(orderOptions);
    const noteAttributes = buildNoteAttributes(orderOptions);

    // Create draft order
    const draftOrder = await createDraftOrder({
      lineItems,
      note: body.comments || undefined,
      tags,
      noteAttributes,
      email: body.email,
    });

    // Return the invoice URL for redirect
    return NextResponse.json({
      success: true,
      draftOrderId: draftOrder.id,
      draftOrderName: draftOrder.name,
      invoiceUrl: draftOrder.invoice_url,
      totalPrice: draftOrder.total_price,
      currency: draftOrder.currency,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    
    // Handle Shopify API errors
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Checkout failed: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create checkout' },
      { status: 500 }
    );
  }
}

