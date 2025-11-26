import { NextRequest, NextResponse } from 'next/server';
import { UTApi } from 'uploadthing/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Initialize UploadThing
const utapi = new UTApi();

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type (image formats only)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    console.log('Uploading avatar to UploadThing:', {
      filename: file.name,
      size: file.size,
      type: file.type,
      userId: session.user.id,
    });

    // Upload to UploadThing
    const uploadResponse = await utapi.uploadFiles([file]);

    if (!uploadResponse[0] || !uploadResponse[0].data) {
      console.error('UploadThing upload failed:', uploadResponse);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    const uploadedFileData = uploadResponse[0].data;
    console.log('Avatar uploaded to UploadThing:', {
      key: uploadedFileData.key,
      ufsUrl: uploadedFileData.ufsUrl,
    });

    // Update user's image in the database
    await db
      .update(user)
      .set({ 
        image: uploadedFileData.ufsUrl,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id));

    console.log('✅ User avatar updated:', { userId: session.user.id });

    return NextResponse.json({
      success: true,
      imageUrl: uploadedFileData.ufsUrl,
      message: 'Avatar updated successfully',
    });

  } catch (error) {
    console.error('Error in avatar upload endpoint:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload avatar',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Delete avatar
export async function DELETE(request: NextRequest) {
  try {
    // Get authenticated user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    // Update user's image to null in the database
    await db
      .update(user)
      .set({ 
        image: null,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id));

    console.log('✅ User avatar removed:', { userId: session.user.id });

    return NextResponse.json({
      success: true,
      message: 'Avatar removed successfully',
    });

  } catch (error) {
    console.error('Error removing avatar:', error);
    return NextResponse.json(
      {
        error: 'Failed to remove avatar',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

