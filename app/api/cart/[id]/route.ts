import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

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
  { params }: { params: { id: string } }
): Promise<NextResponse<CartItemDELETEResponse>> {
  try {
    const { id } = params;
    const db = await getDatabase();
    
    return new Promise((resolve) => {
      // First check if cart item exists
      db.get('SELECT id FROM cart_items WHERE id = ?', [id], (err, row) => {
        if (err) {
          resolve(NextResponse.json({
            success: false,
            error: err.message
          }, { status: 500 }));
          return;
        }

        if (!row) {
          resolve(NextResponse.json({
            success: false,
            error: 'Cart item not found'
          }, { status: 404 }));
          return;
        }

        // Delete cart addons first (foreign key constraint)
        db.run('DELETE FROM cart_addons WHERE cart_item_id = ?', [id], (addonErr) => {
          if (addonErr) {
            resolve(NextResponse.json({
              success: false,
              error: addonErr.message
            }, { status: 500 }));
            return;
          }

          // Then delete the cart item
          db.run('DELETE FROM cart_items WHERE id = ?', [id], function(cartErr) {
            if (cartErr) {
              resolve(NextResponse.json({
                success: false,
                error: cartErr.message
              }, { status: 500 }));
              return;
            }

            resolve(NextResponse.json({
              success: true,
              message: 'Cart item deleted successfully'
            }));
          });
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