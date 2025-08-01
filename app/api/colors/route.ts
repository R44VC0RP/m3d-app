import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { 
  ColorGetRequest, 
  ColorGetResponse, 
  ColorPostRequest, 
  ColorPostResponse, 
  ColorDeleteRequest, 
  ColorDeleteResponse 
} from '@/lib/api-types';

// GET /api/colors or /api/colors?id=<id>
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (id) {
      const color = await prisma.color.findUnique({
        where: { id }
      });

      if (!color) {
        const response: ColorGetResponse = {
          success: false,
          error: 'Color not found'
        };
        return NextResponse.json(response, { status: 404 });
      }

      const response: ColorGetResponse = {
        success: true,
        data: color
      };
      return NextResponse.json(response);
    }

    const colors = await prisma.color.findMany({
      where: { available: true },
      orderBy: { name: 'asc' }
    });

    const response: ColorGetResponse = {
      success: true,
      data: colors
    };
    return NextResponse.json(response);
  } catch (error) {
    const response: ColorGetResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/colors
export async function POST(request: NextRequest) {
  try {
    const body: ColorPostRequest = await request.json();

    const color = await prisma.color.create({
      data: {
        name: body.name,
        hexCode: body.hexCode,
        available: body.available ?? true
      }
    });

    const response: ColorPostResponse = {
      success: true,
      data: color
    };
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const response: ColorPostResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/colors?id=<id>
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      const response: ColorDeleteResponse = {
        success: false,
        error: 'Color ID is required'
      };
      return NextResponse.json(response, { status: 400 });
    }

    await prisma.color.delete({
      where: { id }
    });

    const response: ColorDeleteResponse = {
      success: true,
      message: 'Color deleted successfully'
    };
    return NextResponse.json(response);
  } catch (error) {
    const response: ColorDeleteResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    };
    return NextResponse.json(response, { status: 500 });
  }
}