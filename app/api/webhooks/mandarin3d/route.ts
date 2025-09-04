import { NextRequest, NextResponse } from 'next/server';
import { CallbackPayload, Mandarin3DApiClient } from '@/lib/mandarin3d-api';

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
      
      // TODO: Handle successful processing
      // - Store results in database
      // - Update file status
      // - Notify user
      
    } else if (Mandarin3DApiClient.isErrorCallback(payload)) {
      console.log('❌ Error callback:', {
        file_id: payload.file_id,
        error: payload.error,
        dimensions: payload.dimensions,
        processing_time: payload.processing_time,
      });
      
      // TODO: Handle processing error
      // - Update file status to error
      // - Store error message
      // - Notify user of failure
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
