import { NextRequest, NextResponse } from 'next/server';
import { db, files, NewFile } from '@/lib/db';
import { File } from '@/lib/types';
import { desc } from 'drizzle-orm';

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
    const allFiles = await db.select().from(files).orderBy(desc(files.createdAt));
    
    const formattedFiles: File[] = allFiles.map(file => ({
      id: file.id,
      name: file.name,
      filetype: file.filetype,
      filename: file.filename,
      dimensions: {
        x: file.dimensionsX,
        y: file.dimensionsY,
        z: file.dimensionsZ
      },
      mass: file.mass,
      slicing_status: file.slicingStatus,
      metadata: JSON.parse(file.metadata || '{}'),
      created_at: file.createdAt.toISOString(),
      updated_at: file.updatedAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: formattedFiles
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

    const newFileData: NewFile = {
      name: body.name,
      filetype: body.filetype,
      filename: body.filename,
      dimensionsX: body.dimensions.x,
      dimensionsY: body.dimensions.y,
      dimensionsZ: body.dimensions.z,
      mass: body.mass,
      slicingStatus: 'pending',
      metadata: JSON.stringify(body.metadata || {}),
    };

    const [insertedFile] = await db.insert(files).values(newFileData).returning();

    const formattedFile: File = {
      id: insertedFile.id,
      name: insertedFile.name,
      filetype: insertedFile.filetype,
      filename: insertedFile.filename,
      dimensions: {
        x: insertedFile.dimensionsX,
        y: insertedFile.dimensionsY,
        z: insertedFile.dimensionsZ
      },
      mass: insertedFile.mass,
      slicing_status: insertedFile.slicingStatus,
      metadata: JSON.parse(insertedFile.metadata || '{}'),
      created_at: insertedFile.createdAt.toISOString(),
      updated_at: insertedFile.updatedAt.toISOString()
    };

    return NextResponse.json({
      success: true,
      data: formattedFile
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}