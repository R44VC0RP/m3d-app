import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, File } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';

// Request types
interface FilesGETRequest {
  // No body for GET requests
}

interface FilesPOSTRequest {
  name: string;
  filetype: string;
  filename: string;
  dimensions: {
    x: number;
    y: number;
    z: number;
  };
  mass: number;
  metadata?: Record<string, any>;
}

// Response types
interface FilesGETResponse {
  success: boolean;
  data: File[];
  error?: string;
}

interface FilesPOSTResponse {
  success: boolean;
  data?: File;
  error?: string;
}

// GET - Retrieve all files
export async function GET(request: NextRequest): Promise<NextResponse<FilesGETResponse>> {
  try {
    const db = await getDatabase();
    
    return new Promise((resolve) => {
      db.all(
        `SELECT id, name, filetype, filename, dimensions_x, dimensions_y, dimensions_z, 
         mass, slicing_status, metadata, created_at, updated_at FROM files ORDER BY created_at DESC`,
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

          const files: File[] = rows.map(row => ({
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
          }));

          resolve(NextResponse.json({
            success: true,
            data: files
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

// POST - Create a new file
export async function POST(request: NextRequest): Promise<NextResponse<FilesPOSTResponse>> {
  try {
    const body: FilesPOSTRequest = await request.json();
    
    // Validation
    if (!body.name || !body.filetype || !body.filename || !body.dimensions || !body.mass) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name, filetype, filename, dimensions, mass'
      }, { status: 400 });
    }

    if (body.dimensions.x <= 0 || body.dimensions.y <= 0 || body.dimensions.z <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Dimensions must be positive numbers'
      }, { status: 400 });
    }

    if (body.mass <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Mass must be a positive number'
      }, { status: 400 });
    }

    const db = await getDatabase();
    const fileId = uuidv4();
    const now = new Date().toISOString();

    return new Promise((resolve) => {
      db.run(
        `INSERT INTO files (id, name, filetype, filename, dimensions_x, dimensions_y, dimensions_z, 
         mass, slicing_status, metadata, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fileId,
          body.name,
          body.filetype,
          body.filename,
          body.dimensions.x,
          body.dimensions.y,
          body.dimensions.z,
          body.mass,
          'pending',
          JSON.stringify(body.metadata || {}),
          now,
          now
        ],
        function(err) {
          if (err) {
            resolve(NextResponse.json({
              success: false,
              error: err.message
            }, { status: 500 }));
            return;
          }

          const newFile: File = {
            id: fileId,
            name: body.name,
            filetype: body.filetype,
            filename: body.filename,
            dimensions: body.dimensions,
            mass: body.mass,
            slicing_status: 'pending',
            metadata: body.metadata || {},
            created_at: now,
            updated_at: now
          };

          resolve(NextResponse.json({
            success: true,
            data: newFile
          }, { status: 201 }));
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