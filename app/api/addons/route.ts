import { NextRequest, NextResponse } from 'next/server';
import { db, fileAddons } from '@/lib/db';
import { FileAddon } from '@/lib/types';
import { eq, asc } from 'drizzle-orm';

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
    const activeAddons = await db
      .select()
      .from(fileAddons)
      .where(eq(fileAddons.isActive, true))
      .orderBy(asc(fileAddons.name));

    const formattedAddons: FileAddon[] = activeAddons.map(addon => ({
      id: addon.id,
      name: addon.name,
      description: addon.description,
      price: addon.price,
      is_active: addon.isActive,
      created_at: addon.createdAt.toISOString(),
      updated_at: addon.updatedAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      data: formattedAddons
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}