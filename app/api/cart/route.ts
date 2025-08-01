import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, CartItem, FileAddon } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';

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
    const db = await getDatabase();
    
    return new Promise((resolve) => {
      // Get cart items with file details
      db.all(
        `SELECT 
          ci.id, ci.file_id, ci.quality, ci.quantity, ci.color, ci.created_at, ci.updated_at,
          f.name as file_name, f.filetype, f.filename, 
          f.dimensions_x, f.dimensions_y, f.dimensions_z, f.mass
         FROM cart_items ci
         JOIN files f ON ci.file_id = f.id
         ORDER BY ci.created_at DESC`,
        [],
        async (err, cartRows: any[]) => {
          if (err) {
            resolve(NextResponse.json({
              success: false,
              data: [],
              error: err.message
            }, { status: 500 }));
            return;
          }

          // Get addons for each cart item
          const cartItemsWithDetails: CartItemWithDetails[] = [];
          let processedCount = 0;

          if (cartRows.length === 0) {
            resolve(NextResponse.json({
              success: true,
              data: []
            }));
            return;
          }

          for (const row of cartRows) {
            db.all(
              `SELECT fa.id, fa.name, fa.description, fa.price, fa.is_active, fa.created_at, fa.updated_at
               FROM file_addons fa
               JOIN cart_addons ca ON fa.id = ca.addon_id
               WHERE ca.cart_item_id = ?`,
              [row.id],
              (addonErr, addonRows: any[]) => {
                if (addonErr) {
                  resolve(NextResponse.json({
                    success: false,
                    data: [],
                    error: addonErr.message
                  }, { status: 500 }));
                  return;
                }

                const addons: FileAddon[] = addonRows.map(addon => ({
                  id: addon.id,
                  name: addon.name,
                  description: addon.description,
                  price: addon.price,
                  is_active: Boolean(addon.is_active),
                  created_at: addon.created_at,
                  updated_at: addon.updated_at
                }));

                const cartItem: CartItemWithDetails = {
                  id: row.id,
                  file_id: row.file_id,
                  quality: row.quality,
                  quantity: row.quantity,
                  color: row.color,
                  created_at: row.created_at,
                  updated_at: row.updated_at,
                  file: {
                    id: row.file_id,
                    name: row.file_name,
                    filetype: row.filetype,
                    filename: row.filename,
                    dimensions: {
                      x: row.dimensions_x,
                      y: row.dimensions_y,
                      z: row.dimensions_z
                    },
                    mass: row.mass
                  },
                  addons
                };

                cartItemsWithDetails.push(cartItem);
                processedCount++;

                if (processedCount === cartRows.length) {
                  resolve(NextResponse.json({
                    success: true,
                    data: cartItemsWithDetails
                  }));
                }
              }
            );
          }
        }
      );
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

    const db = await getDatabase();
    const cartItemId = uuidv4();
    const now = new Date().toISOString();

    return new Promise((resolve) => {
      // First verify the file exists
      db.get('SELECT id, name, filetype, filename, dimensions_x, dimensions_y, dimensions_z, mass FROM files WHERE id = ?', 
        [body.file_id], 
        (fileErr, fileRow: any) => {
          if (fileErr) {
            resolve(NextResponse.json({
              success: false,
              error: fileErr.message
            }, { status: 500 }));
            return;
          }

          if (!fileRow) {
            resolve(NextResponse.json({
              success: false,
              error: 'File not found'
            }, { status: 404 }));
            return;
          }

          // Insert cart item
          db.run(
            `INSERT INTO cart_items (id, file_id, quality, quantity, color, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [cartItemId, body.file_id, quality, quantity, body.color, now, now],
            function(cartErr) {
              if (cartErr) {
                resolve(NextResponse.json({
                  success: false,
                  error: cartErr.message
                }, { status: 500 }));
                return;
              }

              // Insert addons if provided
              if (body.addon_ids && body.addon_ids.length > 0) {
                let addonInsertCount = 0;
                const totalAddons = body.addon_ids.length;

                body.addon_ids.forEach(addonId => {
                  const cartAddonId = uuidv4();
                  db.run(
                    'INSERT INTO cart_addons (id, cart_item_id, addon_id, created_at) VALUES (?, ?, ?, ?)',
                    [cartAddonId, cartItemId, addonId, now],
                    (addonInsertErr) => {
                      if (addonInsertErr) {
                        resolve(NextResponse.json({
                          success: false,
                          error: addonInsertErr.message
                        }, { status: 500 }));
                        return;
                      }

                      addonInsertCount++;
                      if (addonInsertCount === totalAddons) {
                        // Return the created cart item with details
                        returnCartItemWithDetails(resolve, db, cartItemId, fileRow, now);
                      }
                    }
                  );
                });
              } else {
                // No addons, return the cart item
                returnCartItemWithDetails(resolve, db, cartItemId, fileRow, now);
              }
            }
          );
        }
      );
    });
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
    const db = await getDatabase();
    
    return new Promise((resolve) => {
      // Delete cart addons first (foreign key constraint)
      db.run('DELETE FROM cart_addons', [], (addonErr) => {
        if (addonErr) {
          resolve(NextResponse.json({
            success: false,
            error: addonErr.message
          }, { status: 500 }));
          return;
        }

        // Then delete cart items
        db.run('DELETE FROM cart_items', [], function(cartErr) {
          if (cartErr) {
            resolve(NextResponse.json({
              success: false,
              error: cartErr.message
            }, { status: 500 }));
            return;
          }

          resolve(NextResponse.json({
            success: true,
            message: `Cleared ${this.changes} items from cart`
          }));
        });
      });
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to return cart item with details
function returnCartItemWithDetails(
  resolve: (response: NextResponse<CartPOSTResponse>) => void,
  db: any,
  cartItemId: string,
  fileRow: any,
  now: string
) {
  // Get the addons for this cart item
  db.all(
    `SELECT fa.id, fa.name, fa.description, fa.price, fa.is_active, fa.created_at, fa.updated_at
     FROM file_addons fa
     JOIN cart_addons ca ON fa.id = ca.addon_id
     WHERE ca.cart_item_id = ?`,
    [cartItemId],
    (addonErr: any, addonRows: any[]) => {
      if (addonErr) {
        resolve(NextResponse.json({
          success: false,
          error: addonErr.message
        }, { status: 500 }));
        return;
      }

      const addons: FileAddon[] = addonRows.map(addon => ({
        id: addon.id,
        name: addon.name,
        description: addon.description,
        price: addon.price,
        is_active: Boolean(addon.is_active),
        created_at: addon.created_at,
        updated_at: addon.updated_at
      }));

      // Get the cart item details
      db.get(
        'SELECT id, file_id, quality, quantity, color, created_at, updated_at FROM cart_items WHERE id = ?',
        [cartItemId],
        (cartGetErr: any, cartRow: any) => {
          if (cartGetErr) {
            resolve(NextResponse.json({
              success: false,
              error: cartGetErr.message
            }, { status: 500 }));
            return;
          }

          const cartItemWithDetails: CartItemWithDetails = {
            id: cartRow.id,
            file_id: cartRow.file_id,
            quality: cartRow.quality,
            quantity: cartRow.quantity,
            color: cartRow.color,
            created_at: cartRow.created_at,
            updated_at: cartRow.updated_at,
            file: {
              id: fileRow.id,
              name: fileRow.name,
              filetype: fileRow.filetype,
              filename: fileRow.filename,
              dimensions: {
                x: fileRow.dimensions_x,
                y: fileRow.dimensions_y,
                z: fileRow.dimensions_z
              },
              mass: fileRow.mass
            },
            addons
          };

          resolve(NextResponse.json({
            success: true,
            data: cartItemWithDetails
          }, { status: 201 }));
        }
      );
    }
  );
}