import { NextRequest, NextResponse } from 'next/server';
import { CallbackPayload, Mandarin3DApiClient } from '@/lib/mandarin3d-api';
import { api } from '@/convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';

// Initialize Convex HTTP client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const payload: CallbackPayload = await request.json();
    
    // Log the received payload
    console.log('Mandarin3D Callback Received:', {
      timestamp: new Date().toISOString(),
      payload: payload,
    });

    // Type-safe handling based on status
    if (Mandarin3DApiClient.isSuccessCallback(payload)) {
      console.log('✅ Success callback:', {
        file_id: payload.file_id,
        mass_grams: payload.mass_grams,
        dimensions: payload.dimensions,
        processing_time: payload.processing_time,
        slicer_time: payload.slicer_time,
      });
      
      // Update file in Convex with processing results
      await convex.mutation(api.cart.updateFileProcessingResults, {
        uploadthingFileKey: payload.file_id, // file_id is the UploadThing key
        status: 'ready',
        massGrams: payload.mass_grams,
        dimensions: payload.dimensions,
        processingTime: payload.processing_time,
        slicerTime: payload.slicer_time,
      });
      
      console.log('✅ Updated Convex with processing results');
      
    } else if (Mandarin3DApiClient.isErrorCallback(payload)) {
      console.log('❌ Error callback:', {
        file_id: payload.file_id,
        error: payload.error,
        dimensions: payload.dimensions,
        processing_time: payload.processing_time,
      });
      
      // Update file in Convex with error status
      await convex.mutation(api.cart.updateFileProcessingResults, {
        uploadthingFileKey: payload.file_id, // file_id is the UploadThing key
        status: 'error',
        errorMessage: payload.error,
        dimensions: payload.dimensions,
        processingTime: payload.processing_time,
      });
      
      console.log('❌ Updated Convex with error status');
    }

    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook received successfully' 
    });

  } catch (error) {
    console.error('Error processing Mandarin3D webhook:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process webhook' 
      },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ 
    message: 'Mandarin3D webhook endpoint is active',
    methods: ['POST']
  });
}
