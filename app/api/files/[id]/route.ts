import { NextRequest, NextResponse } from 'next/server';
import { db, files } from '@/lib/db';
import { File } from '@/lib/types';
import { eq } from 'drizzle-orm';

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
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<FileGETResponse>> {
  try {
    const { id } = await params;
    
    const [file] = await db.select().from(files).where(eq(files.id, id));

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'File not found'
      }, { status: 404 });
    }

    const formattedFile: File = {
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
    };

    return NextResponse.json({
      success: true,
      data: formattedFile
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
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<FileDELETEResponse>> {
  try {
    const { id } = await params;
    
    // First check if file exists
    const [existingFile] = await db.select().from(files).where(eq(files.id, id));

    if (!existingFile) {
      return NextResponse.json({
        success: false,
        error: 'File not found'
      }, { status: 404 });
    }

    // Delete the file
    await db.delete(files).where(eq(files.id, id));

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}