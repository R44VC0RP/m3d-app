import { NextRequest, NextResponse } from 'next/server';
import { inArray } from 'drizzle-orm';
import { db } from '@/db';
import { cartItem } from '@/db/schema';
import { verifyWebhookSignature } from '@/lib/shopify';
import { sendEmail } from '@/lib/email';
import NewOrderPlacedEmail from '@/emails/NewOrderPlaced';

// Shopify sends the raw body, we need to verify the HMAC signature
export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const rawBody = await request.text();
    
    // Get the HMAC signature from headers
    const hmacHeader = request.headers.get('X-Shopify-Hmac-SHA256');
    
    if (!hmacHeader) {
      console.error('Missing Shopify HMAC signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    // Verify the webhook signature
    const isValid = verifyWebhookSignature(rawBody, hmacHeader);
    
    if (!isValid) {
      console.error('Invalid Shopify webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse the webhook payload
    const payload = JSON.parse(rawBody);
    
    // Get the webhook topic from headers
    const topic = request.headers.get('X-Shopify-Topic');
    
    console.log('Shopify webhook received:', {
      topic,
      orderId: payload.id,
      orderNumber: payload.order_number,
    });

    // Handle different webhook topics
    switch (topic) {
      case 'orders/create':
        await handleOrderCreated(payload);
        break;
      case 'orders/paid':
        await handleOrderPaid(payload);
        break;
      case 'orders/fulfilled':
        await handleOrderFulfilled(payload);
        break;
      default:
        console.log('Unhandled webhook topic:', topic);
    }

    // Acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Shopify webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Types for Shopify order payload
interface ShopifyLineItemProperty {
  name: string;
  value: string;
}

interface ShopifyLineItem {
  id: number;
  title: string;
  quantity: number;
  price: string;
  properties: ShopifyLineItemProperty[];
}

interface ShopifyOrder {
  id: number;
  order_number: number;
  email: string;
  total_price: string;
  currency: string;
  financial_status: string;
  fulfillment_status: string | null;
  created_at: string;
  line_items: ShopifyLineItem[];
  note: string | null;
  note_attributes: ShopifyLineItemProperty[];
  tags: string;
  customer: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  } | null;
  shipping_address: {
    address1: string;
    city: string;
    province: string;
    country: string;
    zip: string;
  } | null;
}

/**
 * Handle order created webhook
 * This fires when a draft order is completed and converted to an order
 */
async function handleOrderCreated(order: ShopifyOrder) {
  console.log('Order created:', {
    id: order.id,
    orderNumber: order.order_number,
    email: order.email,
    totalPrice: order.total_price,
    currency: order.currency,
    financialStatus: order.financial_status,
  });

  // Extract file IDs and build line items for the email
  const fileIds: string[] = [];
  const lineItems: Array<{
    title: string;
    quantity: number;
    price: string;
    fileId?: string;
    fileName?: string;
  }> = [];
  
  for (const lineItem of order.line_items) {
    // Skip add-on items (they don't have file IDs)
    if (lineItem.title.includes('Add-on')) {
      continue;
    }

    const fileIdProperty = lineItem.properties.find(
      (prop) => prop.name === 'File ID'
    );
    const fileNameProperty = lineItem.properties.find(
      (prop) => prop.name === 'File Name' || prop.name === 'Filename'
    );
    
    if (fileIdProperty) {
      fileIds.push(fileIdProperty.value);
    }

    lineItems.push({
      title: lineItem.title,
      quantity: lineItem.quantity,
      price: lineItem.price,
      fileId: fileIdProperty?.value,
      fileName: fileNameProperty?.value,
    });
  }

  console.log('File IDs in order:', fileIds);

  // Check for special order options
  const hasMulticolor = order.tags.includes('multicolor');
  const hasPriority = order.tags.includes('priority-queue');
  const needsAssistance = order.tags.includes('needs-assistance');

  console.log('Order options:', {
    hasMulticolor,
    hasPriority,
    needsAssistance,
    note: order.note,
  });

  // Send internal notification email to ryan@mandarin3d.com
  const customerName = order.customer
    ? `${order.customer.first_name} ${order.customer.last_name}`.trim()
    : 'Unknown Customer';

  const emailResult = await sendEmail({
    to: 'ryan@mandarin3d.com',
    subject: `🎉 New Order #${order.order_number} - ${customerName} ($${order.total_price})`,
    react: NewOrderPlacedEmail({
      orderNumber: `#${order.order_number}`,
      customerName,
      customerEmail: order.email,
      totalPrice: order.total_price,
      currency: order.currency,
      lineItems,
      hasMulticolor,
      hasPriority,
      needsAssistance,
      orderNote: order.note ?? undefined,
      shippingAddress: order.shipping_address ?? undefined,
      shopifyAdminUrl: `https://mandarin3d.myshopify.com/admin/orders/${order.id}`,
    }),
  });

  if (emailResult.success) {
    console.log('Order notification email sent:', emailResult.id);
  } else {
    console.error('Failed to send order notification email:', emailResult.error);
  }

  // Clear the cart items that were part of this order
  if (fileIds.length > 0) {
    try {
      const deleteResult = await db
        .delete(cartItem)
        .where(inArray(cartItem.uploadedFileId, fileIds));
      
      console.log('Cart items cleared for order:', {
        orderNumber: order.order_number,
        fileIds,
        deleted: deleteResult.rowCount,
      });
    } catch (error) {
      console.error('Failed to clear cart items:', error);
      // Don't fail the webhook - cart clearing is non-critical
    }
  }

  // TODO: Trigger fulfillment workflow
  // TODO: If needsAssistance, trigger assistance workflow
  // TODO: If hasMulticolor, trigger design team notification
}

/**
 * Handle order paid webhook
 */
async function handleOrderPaid(order: ShopifyOrder) {
  console.log('Order paid:', {
    id: order.id,
    orderNumber: order.order_number,
    totalPrice: order.total_price,
  });

  // TODO: Update order status in database
  // TODO: Trigger production workflow
}

/**
 * Handle order fulfilled webhook
 */
async function handleOrderFulfilled(order: ShopifyOrder) {
  console.log('Order fulfilled:', {
    id: order.id,
    orderNumber: order.order_number,
    fulfillmentStatus: order.fulfillment_status,
  });

  // TODO: Update fulfillment status in database
  // TODO: Send shipping notification if needed
}

