import { NextRequest, NextResponse } from 'next/server';
import { UTApi } from 'uploadthing/server';
import { Mandarin3DApiClient } from '@/lib/mandarin3d-api';
import { api } from '@/convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';

// Initialize UploadThing
const utapi = new UTApi();

// Initialize Convex HTTP client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Initialize Mandarin3D client
const mandarin3dClient = new Mandarin3DApiClient();

export async function POST(request: NextRequest) {
  try {
    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const sessionId = formData.get('sessionId') as string;
    const userId = formData.get('userId') as string | null;
    const title = formData.get('title') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
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

    const uploadedFile = uploadResponse[0].data;
    console.log('File uploaded to UploadThing:', {
      key: uploadedFile.key,
      ufsUrl: uploadedFile.ufsUrl, // Use the non-deprecated URL
      name: uploadedFile.name,
      size: uploadedFile.size,
      type: uploadedFile.type,
    });

    // Add file to Convex cart - use ufsUrl instead of deprecated url
    const convexUserId = userId ? userId as any : undefined;
    const cartFileId = await convex.mutation(api.cart.addFileToCart, {
      sessionId,
      userId: convexUserId,
      filename: file.name,
      title: title || undefined,
      uploadthingFileKey: uploadedFile.key,
      uploadthingFileUrl: uploadedFile.ufsUrl, // Use ufsUrl instead of url
    });

    console.log('File added to cart:', cartFileId);

    // Submit to Mandarin3D for processing
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhooks/mandarin3d`;
    
    console.log('Submitting to Mandarin3D API:', {
      file_url: uploadedFile.ufsUrl,
      file_name: file.name, // Include original filename
      callback_url: callbackUrl,
      file_id: uploadedFile.key,
      max_dimensions: { x: 250, y: 250, z: 250 },
    });
    
    try {
      const slicingResponse = await mandarin3dClient.sliceFromUrl({
        file_url: uploadedFile.ufsUrl, // Use ufsUrl instead of url
        file_name: file.name, // Pass the original filename with extension
        callback_url: callbackUrl,
        file_id: uploadedFile.key, // Use UploadThing key as file ID
        max_dimensions: {
          x: 250, // Default to P1S dimensions
          y: 250,
          z: 250,
        },
      });

      console.log('✅ Successfully submitted to Mandarin3D:', slicingResponse);
    } catch (slicingError: any) {
      console.error('❌ Failed to submit to Mandarin3D:', {
        error: slicingError.message,
        status: slicingError.status,
        details: slicingError.response || slicingError,
      });
      
      // Don't fail the whole upload, just mark as error
      await convex.mutation(api.cart.updateFileProcessingResults, {
        uploadthingFileKey: uploadedFile.key,
        status: 'error',
        errorMessage: `Failed to submit for processing: ${slicingError.message || 'Unknown error'}`,
      });
    }

    // Return success response
    return NextResponse.json({
      success: true,
      fileId: cartFileId,
      uploadthingKey: uploadedFile.key,
      uploadthingUrl: uploadedFile.ufsUrl, // Use ufsUrl instead of deprecated url
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
