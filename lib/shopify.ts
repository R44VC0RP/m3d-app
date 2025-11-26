import '@shopify/shopify-api/adapters/node';
import { shopifyApi, ApiVersion, Session } from '@shopify/shopify-api';
import crypto from 'crypto';

// Initialize Shopify API client
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY || '',
  apiSecretKey: process.env.SHOPIFY_API_SECRET || '',
  scopes: ['write_draft_orders', 'read_draft_orders', 'read_orders', 'write_orders'],
  hostName: process.env.SHOPIFY_STORE_DOMAIN || '',
  apiVersion: ApiVersion.January25,
  isEmbeddedApp: false,
});

// Create a session for Admin API calls
function getAdminSession(): Session {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const accessToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;

  if (!storeDomain || !accessToken) {
    throw new Error('Missing Shopify credentials. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_API_ACCESS_TOKEN');
  }

  return new Session({
    id: `offline_${storeDomain}`,
    shop: storeDomain,
    state: '',
    isOnline: false,
    accessToken,
  });
}

// Types for Draft Order creation
export interface DraftOrderLineItemProperty {
  name: string;
  value: string;
}

export interface DraftOrderLineItem {
  title: string;
  price: string;
  quantity: number;
  requires_shipping?: boolean;
  taxable?: boolean;
  properties?: DraftOrderLineItemProperty[];
  grams?: number;
  sku?: string;
}

export interface DraftOrderNoteAttribute {
  name: string;
  value: string;
}

export interface CreateDraftOrderInput {
  lineItems: DraftOrderLineItem[];
  note?: string;
  tags?: string[];
  noteAttributes?: DraftOrderNoteAttribute[];
  email?: string;
}

export interface DraftOrderResponse {
  id: number;
  name: string;
  invoice_url: string;
  status: string;
  total_price: string;
  subtotal_price: string;
  total_tax: string;
  currency: string;
  created_at: string;
  updated_at: string;
  line_items: Array<{
    id: number;
    title: string;
    price: string;
    quantity: number;
    properties: DraftOrderLineItemProperty[];
  }>;
}

/**
 * Create a Draft Order using Shopify Admin REST API
 * Returns the invoice_url for checkout redirect
 */
export async function createDraftOrder(input: CreateDraftOrderInput): Promise<DraftOrderResponse> {
  const session = getAdminSession();
  const client = new shopify.clients.Rest({ session });

  const draftOrderData = {
    draft_order: {
      line_items: input.lineItems.map((item) => ({
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        requires_shipping: item.requires_shipping ?? true,
        taxable: item.taxable ?? true,
        properties: item.properties || [],
        grams: item.grams,
        sku: item.sku,
      })),
      note: input.note,
      tags: input.tags?.join(', '),
      note_attributes: input.noteAttributes,
      email: input.email,
    },
  };

  const response = await client.post({
    path: 'draft_orders',
    data: draftOrderData,
    type: 'application/json',
  });

  const draftOrder = (response.body as { draft_order: DraftOrderResponse }).draft_order;

  return draftOrder;
}

/**
 * Get a Draft Order by ID
 */
export async function getDraftOrder(draftOrderId: number): Promise<DraftOrderResponse> {
  const session = getAdminSession();
  const client = new shopify.clients.Rest({ session });

  const response = await client.get({
    path: `draft_orders/${draftOrderId}`,
  });

  return (response.body as { draft_order: DraftOrderResponse }).draft_order;
}

/**
 * Complete a Draft Order (convert to order)
 */
export async function completeDraftOrder(draftOrderId: number): Promise<{ order_id: number }> {
  const session = getAdminSession();
  const client = new shopify.clients.Rest({ session });

  const response = await client.put({
    path: `draft_orders/${draftOrderId}/complete`,
    data: {},
    type: 'application/json',
  });

  const draftOrder = (response.body as { draft_order: { order_id: number } }).draft_order;
  return { order_id: draftOrder.order_id };
}

/**
 * Verify Shopify webhook signature
 */
export function verifyWebhookSignature(
  rawBody: string,
  hmacHeader: string
): boolean {
  const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Missing SHOPIFY_WEBHOOK_SECRET');
    return false;
  }

  const generatedHmac = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody, 'utf8')
    .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(generatedHmac),
    Buffer.from(hmacHeader)
  );
}

/**
 * Build line items for a 3D print order from cart data
 */
export interface CartItemForCheckout {
  fileId: string;
  fileName: string;
  color: string;
  material: string;
  quality: string; // layer height like "0.20mm"
  quantity: number;
  unitPrice: number; // in dollars
  massGrams: number;
  dimensions: { x: number; y: number; z: number };
}

export interface OrderOptions {
  comments?: string;
  multicolor?: boolean;
  priority?: boolean;
  assistance?: boolean;
}

export function buildDraftOrderLineItems(
  cartItems: CartItemForCheckout[],
  options: OrderOptions
): DraftOrderLineItem[] {
  const lineItems: DraftOrderLineItem[] = [];

  // Add print items
  for (const item of cartItems) {
    lineItems.push({
      title: `3D Print: ${item.fileName}`,
      price: item.unitPrice.toFixed(2),
      quantity: item.quantity,
      requires_shipping: true,
      taxable: true,
      grams: Math.round(item.massGrams * item.quantity),
      properties: [
        { name: 'File ID', value: item.fileId },
        { name: 'Color', value: item.color },
        { name: 'Material', value: item.material },
        { name: 'Quality', value: item.quality },
        { name: 'Mass', value: `${item.massGrams.toFixed(2)}g` },
        {
          name: 'Dimensions',
          value: `${Math.round(item.dimensions.x)}x${Math.round(item.dimensions.y)}x${Math.round(item.dimensions.z)}mm`,
        },
      ],
    });
  }

  // Add multicolor add-on if selected
  if (options.multicolor) {
    lineItems.push({
      title: 'MultiColor Printing Add-on',
      price: '2.00',
      quantity: 1,
      requires_shipping: false,
      taxable: true,
    });
  }

  // Add queue priority add-on if selected
  if (options.priority) {
    lineItems.push({
      title: 'Queue Priority Add-on',
      price: '15.00',
      quantity: 1,
      requires_shipping: false,
      taxable: true,
    });
  }

  return lineItems;
}

/**
 * Build tags for the draft order
 */
export function buildDraftOrderTags(options: OrderOptions): string[] {
  const tags = ['web-order', 'custom-print'];

  if (options.multicolor) {
    tags.push('multicolor');
  }

  if (options.priority) {
    tags.push('priority-queue');
  }

  if (options.assistance) {
    tags.push('needs-assistance');
  }

  return tags;
}

/**
 * Build note attributes for order metadata
 */
export function buildNoteAttributes(options: OrderOptions): DraftOrderNoteAttribute[] {
  const attributes: DraftOrderNoteAttribute[] = [];

  if (options.assistance) {
    attributes.push({
      name: 'Print Assistance Requested',
      value: 'Yes',
    });
  }

  if (options.multicolor) {
    attributes.push({
      name: 'MultiColor Printing',
      value: 'Yes',
    });
  }

  if (options.priority) {
    attributes.push({
      name: 'Queue Priority',
      value: 'Yes',
    });
  }

  return attributes;
}

export { shopify };

