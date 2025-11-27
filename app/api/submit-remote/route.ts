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
    // Get session ID from cookie (optional for remote submissions)
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value || `remote-${crypto.randomUUID()}`;

    // Parse request - could be multipart/form-data or JSON
    const contentType = request.headers.get('content-type') || '';

    let file: File | null = null;
    let fileUrl: string | null = null;
    let externalSource = 'remote-submit';

    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData();
      file = formData.get('file') as File;
      externalSource = (formData.get('external_source') as string) || 'remote-submit';
      fileUrl = (formData.get('file_url') as string) || null;
    } else if (contentType.includes('application/json')) {
      // Handle JSON with file URL
      const body = await request.json();
      fileUrl = body.file_url || null;
      externalSource = body.external_source || 'remote-submit';
    }

    // Validate that we have either a file or a URL
    if (!file && !fileUrl) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'No file or file URL provided',
        },
        { status: 400 }
      );
    }

    console.log('Submit-remote request:', {
      hasFile: !!file,
      fileUrl,
      externalSource,
      sessionId,
    });

    // Upload to UploadThing
    let uploadResponse;

    if (file) {
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
          {
            status: 'error',
            message: 'Invalid file type. Please upload a 3D model file.',
          },
          { status: 400 }
        );
      }

      console.log('Uploading file to UploadThing:', {
        filename: file.name,
        size: file.size,
        type: file.type,
      });

      uploadResponse = await utapi.uploadFiles([file]);
    } else if (fileUrl) {
      console.log('Uploading file from URL to UploadThing:', fileUrl);
      uploadResponse = await utapi.uploadFilesFromUrl(fileUrl);
    }

    // Check upload success
    if (!uploadResponse || (Array.isArray(uploadResponse) && (!uploadResponse[0] || !uploadResponse[0].data))) {
      console.error('UploadThing upload failed:', uploadResponse);
      return NextResponse.json(
        {
          status: 'error',
          message: 'Failed to upload file',
        },
        { status: 500 }
      );
    }

    // Extract file data from response (handle both array and single object responses)
    const uploadData = Array.isArray(uploadResponse) ? uploadResponse[0].data : uploadResponse.data;

    if (!uploadData) {
      console.error('No upload data returned from UploadThing');
      return NextResponse.json(
        {
          status: 'error',
          message: 'No file uploaded',
        },
        { status: 400 }
      );
    }

    console.log('File uploaded to UploadThing:', {
      key: uploadData.key,
      ufsUrl: uploadData.ufsUrl,
      name: uploadData.name,
      size: uploadData.size,
    });

    // Generate our own UUID for the file record
    const fileId = crypto.randomUUID();
    const cartItemId = crypto.randomUUID();

    // Save file to database with status "processing"
    await db.insert(uploadedFile).values({
      id: fileId,
      uploadthingKey: uploadData.key,
      uploadthingUrl: uploadData.ufsUrl,
      sessionId: sessionId,
      fileName: uploadData.name,
      fileSize: uploadData.size || 0,
      status: 'processing',
    });

    console.log('✅ File saved to database:', { fileId, sessionId, externalSource });

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

    // Get the callback base URL from environment
    const callbackBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Start the file processing workflow
    console.log('Starting file processing workflow:', {
      fileId,
      sessionId,
      fileUrl: uploadData.ufsUrl,
      fileName: uploadData.name,
      callbackBaseUrl,
    });

    await start(processFileWorkflow, [{
      fileId,
      sessionId,
      fileUrl: uploadData.ufsUrl,
      fileName: uploadData.name,
      callbackBaseUrl,
      maxDimensions: { x: 250, y: 250, z: 250 }, // Default to P1S dimensions
    }]);

    console.log('✅ File processing workflow started');

    // Return success response matching the Express format
    return NextResponse.json({
      message: 'File uploaded successfully',
      url: `https://mandarin3d.com/file/${fileId}`,
      fileid: fileId,
      status: 'slicing',
    });

  } catch (error) {
    console.error('Form submission error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
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
    message: 'Submit-remote endpoint is active',
  });
}
