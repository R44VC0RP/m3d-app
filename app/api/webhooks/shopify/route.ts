import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/shopify';

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

  // Extract file IDs from line item properties for fulfillment tracking
  const fileIds: string[] = [];
  
  for (const lineItem of order.line_items) {
    // Skip add-on items (they don't have file IDs)
    if (lineItem.title.includes('Add-on')) {
      continue;
    }

    const fileIdProperty = lineItem.properties.find(
      (prop) => prop.name === 'File ID'
    );
    
    if (fileIdProperty) {
      fileIds.push(fileIdProperty.value);
    }
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

  // TODO: Update database to mark cart items as "ordered"
  // TODO: Trigger fulfillment workflow
  // TODO: Send confirmation email if needed
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

