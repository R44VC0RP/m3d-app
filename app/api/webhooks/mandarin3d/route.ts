import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { CallbackPayload, Mandarin3DApiClient } from '@/lib/mandarin3d-api';
import { db } from '@/db';
import { uploadedFile } from '@/db/schema';
import { emitFileStatusUpdate } from '@/lib/realtime';

export async function POST(request: NextRequest) {
  try {
    const payload: CallbackPayload = await request.json();

    // Log the received payload
    console.log('Mandarin3D Callback Received:', {
      timestamp: new Date().toISOString(),
      payload: payload,
    });

    // Get the file record to find the session ID for realtime updates
    const fileRecord = await db.query.uploadedFile.findFirst({
      where: eq(uploadedFile.id, payload.file_id),
    });

    if (!fileRecord) {
      console.error('❌ File not found in database:', payload.file_id);
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    // Type-safe handling based on status
    if (Mandarin3DApiClient.isSuccessCallback(payload)) {
      console.log('✅ Success callback:', {
        file_id: payload.file_id,
        mass_grams: payload.mass_grams,
        dimensions: payload.dimensions,
        processing_time: payload.processing_time,
        slicer_time: payload.slicer_time,
      });

      // Update file record with success results
      await db.update(uploadedFile)
        .set({
          status: 'success',
          massGrams: payload.mass_grams,
          dimensions: payload.dimensions,
          processingTime: payload.processing_time,
          slicerTime: payload.slicer_time,
          updatedAt: new Date(),
        })
        .where(eq(uploadedFile.id, payload.file_id));

      console.log('✅ Database updated for file:', payload.file_id);

      // Emit realtime event to the session channel
      await emitFileStatusUpdate(fileRecord.sessionId, {
        fileId: payload.file_id,
        status: 'success',
        massGrams: payload.mass_grams,
        dimensions: payload.dimensions,
        processingTime: payload.processing_time,
        slicerTime: payload.slicer_time,
      });

      console.log('✅ Realtime event emitted for session:', fileRecord.sessionId);

    } else if (Mandarin3DApiClient.isErrorCallback(payload)) {
      console.log('❌ Error callback:', {
        file_id: payload.file_id,
        error: payload.error,
        dimensions: payload.dimensions,
        processing_time: payload.processing_time,
      });

      // Update file record with error status
      await db.update(uploadedFile)
        .set({
          status: 'error',
          errorMessage: payload.error,
          dimensions: payload.dimensions,
          processingTime: payload.processing_time,
          updatedAt: new Date(),
        })
        .where(eq(uploadedFile.id, payload.file_id));

      console.log('✅ Database updated with error for file:', payload.file_id);

      // Emit realtime event to the session channel
      await emitFileStatusUpdate(fileRecord.sessionId, {
        fileId: payload.file_id,
        status: 'error',
        errorMessage: payload.error,
        dimensions: payload.dimensions,
        processingTime: payload.processing_time,
      });

      console.log('✅ Realtime error event emitted for session:', fileRecord.sessionId);
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
