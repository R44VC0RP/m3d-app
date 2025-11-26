import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UTApi } from 'uploadthing/server';
import { start } from 'workflow/api';
import { processFileWorkflow } from '@/workflows/process-file';
import { db } from '@/db';
import { uploadedFile, cartItem } from '@/db/schema';
import { SESSION_COOKIE_NAME } from '@/lib/session';

// Initialize UploadThing
const utapi = new UTApi();

export async function POST(request: NextRequest) {
  try {
    // Get session ID from cookie
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'No session found. Please refresh the page.' },
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

    // Validate file type (3D model formats)
    const validExtensions = [
      '.stl', '.obj', '.ply', '.off', '.3mf',
      '.gltf', '.glb', '.dae', '.x3d', '.wrl',
      '.vrml', '.step', '.stp', '.iges', '.igs',
      '.collada', '.blend'
    ];

    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!validExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a 3D model file.' },
        { status: 400 }
      );
    }

    console.log('Uploading file to UploadThing:', {
      filename: file.name,
      size: file.size,
      type: file.type,
      sessionId,
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
    console.log('File uploaded to UploadThing:', {
      key: uploadedFileData.key,
      ufsUrl: uploadedFileData.ufsUrl,
      name: uploadedFileData.name,
      size: uploadedFileData.size,
      type: uploadedFileData.type,
    });

    // Generate our own UUID for the file record
    const fileId = crypto.randomUUID();
    const cartItemId = crypto.randomUUID();

    // Save file to database with status "processing"
    await db.insert(uploadedFile).values({
      id: fileId,
      uploadthingKey: uploadedFileData.key,
      uploadthingUrl: uploadedFileData.ufsUrl,
      sessionId: sessionId,
      fileName: file.name,
      fileSize: file.size,
      status: 'processing',
    });

    console.log('✅ File saved to database:', { fileId, sessionId });

    // Create cart item immediately
    await db.insert(cartItem).values({
      id: cartItemId,
      sessionId: sessionId,
      uploadedFileId: fileId,
      quantity: 1,
      material: 'PLA',
      color: 'black-pla',
      infill: 20,
    });

    console.log('✅ Cart item created:', { cartItemId, fileId });

    // Get the callback base URL from environment (critical for callbacks to work)
    const callbackBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Start the file processing workflow with 30-second timeout
    // This runs asynchronously and handles:
    // 1. Submitting to Mandarin3D with the correct callback URL
    // 2. Waiting 30s then checking if callback was received
    // 3. Marking file as stale if no response
    console.log('Starting file processing workflow:', {
      fileId,
      sessionId,
      fileUrl: uploadedFileData.ufsUrl,
      fileName: file.name,
      callbackBaseUrl,
    });

    await start(processFileWorkflow, [{
      fileId,
      sessionId,
      fileUrl: uploadedFileData.ufsUrl,
      fileName: file.name,
      callbackBaseUrl,
      maxDimensions: { x: 250, y: 250, z: 250 }, // Default to P1S dimensions
    }]);

    console.log('✅ File processing workflow started');

    // Return success response with our file ID
    return NextResponse.json({
      success: true,
      fileId,
      cartItemId,
      uploadthingKey: uploadedFileData.key,
      uploadthingUrl: uploadedFileData.ufsUrl,
      message: 'File uploaded and processing started',
    });

  } catch (error) {
    console.error('Error in upload endpoint:', error);
    return NextResponse.json(
      {
        error: 'Failed to process upload',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Handle GET for health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Upload endpoint is active',
  });
}
