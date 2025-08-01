import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { 
  FileGetRequest, 
  FileGetResponse, 
  FilePostRequest, 
  FilePostResponse, 
  FileDeleteRequest, 
  FileDeleteResponse 
} from '@/lib/api-types';

// GET /api/files or /api/files?id=<id>
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (id) {
      const file = await prisma.file.findUnique({
        where: { id }
      });

      if (!file) {
        const response: FileGetResponse = {
          success: false,
          error: 'File not found'
        };
        return NextResponse.json(response, { status: 404 });
      }

      const response: FileGetResponse = {
        success: true,
        data: file
      };
      return NextResponse.json(response);
    }

    const files = await prisma.file.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const response: FileGetResponse = {
      success: true,
      data: files
    };
    return NextResponse.json(response);
  } catch (error) {
    const response: FileGetResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/files
export async function POST(request: NextRequest) {
  try {
    const body: FilePostRequest = await request.json();

    const file = await prisma.file.create({
      data: {
        name: body.name,
        filetype: body.filetype,
        filename: body.filename,
        dimensionX: body.dimensionX,
        dimensionY: body.dimensionY,
        dimensionZ: body.dimensionZ,
        mass: body.mass,
        slicing_status: body.slicing_status || 'pending',
        metadata: body.metadata,
        price: body.price || 0,
        images: body.images || []
      }
    });

    const response: FilePostResponse = {
      success: true,
      data: file
    };
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const response: FilePostResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/files?id=<id>
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      const response: FileDeleteResponse = {
        success: false,
        error: 'File ID is required'
      };
      return NextResponse.json(response, { status: 400 });
    }

    await prisma.file.delete({
      where: { id }
    });

    const response: FileDeleteResponse = {
      success: true,
      message: 'File deleted successfully'
    };
    return NextResponse.json(response);
  } catch (error) {
    const response: FileDeleteResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    };
    return NextResponse.json(response, { status: 500 });
  }
}