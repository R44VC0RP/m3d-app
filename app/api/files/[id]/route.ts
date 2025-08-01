import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, File } from '@/lib/database';

// Request types
interface FileGETRequest {
  // No body for GET requests
}

interface FileDELETERequest {
  // No body for DELETE requests
}

// Response types
interface FileGETResponse {
  success: boolean;
  data?: File;
  error?: string;
}

interface FileDELETEResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// GET - Retrieve a specific file by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<FileGETResponse>> {
  try {
    const { id } = params;
    const db = await getDatabase();
    
    return new Promise((resolve) => {
      db.get(
        `SELECT id, name, filetype, filename, dimensions_x, dimensions_y, dimensions_z, 
         mass, slicing_status, metadata, created_at, updated_at FROM files WHERE id = ?`,
        [id],
        (err, row: any) => {
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
              error: 'File not found'
            }, { status: 404 }));
            return;
          }

          const file: File = {
            id: row.id,
            name: row.name,
            filetype: row.filetype,
            filename: row.filename,
            dimensions: {
              x: row.dimensions_x,
              y: row.dimensions_y,
              z: row.dimensions_z
            },
            mass: row.mass,
            slicing_status: row.slicing_status,
            metadata: JSON.parse(row.metadata || '{}'),
            created_at: row.created_at,
            updated_at: row.updated_at
          };

          resolve(NextResponse.json({
            success: true,
            data: file
          }));
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

// DELETE - Remove a specific file by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<FileDELETEResponse>> {
  try {
    const { id } = params;
    const db = await getDatabase();
    
    return new Promise((resolve) => {
      // First check if file exists
      db.get('SELECT id FROM files WHERE id = ?', [id], (err, row) => {
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
            error: 'File not found'
          }, { status: 404 }));
          return;
        }

        // Delete the file
        db.run('DELETE FROM files WHERE id = ?', [id], function(err) {
          if (err) {
            resolve(NextResponse.json({
              success: false,
              error: err.message
            }, { status: 500 }));
            return;
          }

          resolve(NextResponse.json({
            success: true,
            message: 'File deleted successfully'
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