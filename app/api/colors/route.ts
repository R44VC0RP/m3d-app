import { NextRequest, NextResponse } from 'next/server';
import { db, colors } from '@/lib/db';
import { Color } from '@/lib/types';
import { eq, asc } from 'drizzle-orm';

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
    const availableColors = await db
      .select()
      .from(colors)
      .where(eq(colors.isAvailable, true))
      .orderBy(asc(colors.name));

    const formattedColors: Color[] = availableColors.map(color => ({
      id: color.id,
      name: color.name,
      hex_code: color.hexCode,
      is_available: color.isAvailable,
      created_at: color.createdAt.toISOString(),
      updated_at: color.updatedAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: formattedColors
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}