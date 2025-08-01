import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { 
  AddonGetRequest, 
  AddonGetResponse, 
  AddonPostRequest, 
  AddonPostResponse, 
  AddonDeleteRequest, 
  AddonDeleteResponse 
} from '@/lib/api-types';

// GET /api/addons or /api/addons?id=<id>
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (id) {
      const addon = await prisma.fileAddon.findUnique({
        where: { id }
      });

      if (!addon) {
        const response: AddonGetResponse = {
          success: false,
          error: 'Addon not found'
        };
        return NextResponse.json(response, { status: 404 });
      }

      const response: AddonGetResponse = {
        success: true,
        data: addon
      };
      return NextResponse.json(response);
    }

    const addons = await prisma.fileAddon.findMany({
      orderBy: { name: 'asc' }
    });

    const response: AddonGetResponse = {
      success: true,
      data: addons
    };
    return NextResponse.json(response);
  } catch (error) {
    const response: AddonGetResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/addons
export async function POST(request: NextRequest) {
  try {
    const body: AddonPostRequest = await request.json();

    const addon = await prisma.fileAddon.create({
      data: {
        name: body.name,
        description: body.description,
        price: body.price || 0,
        type: body.type
      }
    });

    const response: AddonPostResponse = {
      success: true,
      data: addon
    };
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const response: AddonPostResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/addons?id=<id>
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      const response: AddonDeleteResponse = {
        success: false,
        error: 'Addon ID is required'
      };
      return NextResponse.json(response, { status: 400 });
    }

    await prisma.fileAddon.delete({
      where: { id }
    });

    const response: AddonDeleteResponse = {
      success: true,
      message: 'Addon deleted successfully'
    };
    return NextResponse.json(response);
  } catch (error) {
    const response: AddonDeleteResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    };
    return NextResponse.json(response, { status: 500 });
  }
}