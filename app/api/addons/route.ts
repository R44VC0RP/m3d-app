import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, FileAddon } from '@/lib/database';

// Request types
interface AddonsGETRequest {
  // No body for GET requests
}

// Response types
interface AddonsGETResponse {
  success: boolean;
  data: FileAddon[];
  error?: string;
}

// GET - Retrieve all active file addons
export async function GET(request: NextRequest): Promise<NextResponse<AddonsGETResponse>> {
  try {
    const db = await getDatabase();
    
    return new Promise((resolve) => {
      db.all(
        `SELECT id, name, description, price, is_active, created_at, updated_at 
         FROM file_addons WHERE is_active = 1 ORDER BY name ASC`,
        [],
        (err, rows: any[]) => {
          if (err) {
            resolve(NextResponse.json({
              success: false,
              data: [],
              error: err.message
            }, { status: 500 }));
            return;
          }

          const addons: FileAddon[] = rows.map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            price: row.price,
            is_active: Boolean(row.is_active),
            created_at: row.created_at,
            updated_at: row.updated_at
          }));

          resolve(NextResponse.json({
            success: true,
            data: addons
          }));
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