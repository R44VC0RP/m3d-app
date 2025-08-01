import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, Color } from '@/lib/database';

// Request types
interface ColorsGETRequest {
  // No body for GET requests
}

// Response types
interface ColorsGETResponse {
  success: boolean;
  data: Color[];
  error?: string;
}

// GET - Retrieve all available colors
export async function GET(request: NextRequest): Promise<NextResponse<ColorsGETResponse>> {
  try {
    const db = await getDatabase();
    
    return new Promise((resolve) => {
      db.all(
        `SELECT id, name, hex_code, is_available, created_at, updated_at 
         FROM colors WHERE is_available = 1 ORDER BY name ASC`,
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

          const colors: Color[] = rows.map(row => ({
            id: row.id,
            name: row.name,
            hex_code: row.hex_code,
            is_available: Boolean(row.is_available),
            created_at: row.created_at,
            updated_at: row.updated_at
          }));

          resolve(NextResponse.json({
            success: true,
            data: colors
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