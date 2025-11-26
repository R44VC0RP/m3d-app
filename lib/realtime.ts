import { Realtime, InferRealtimeEvents } from "@upstash/realtime";
import { redis } from "./redis";
import { z } from "zod";

// Define the schema for realtime events
const schema = {
  file: {
    // Event emitted when a file's processing status changes
    statusUpdate: z.object({
      sessionId: z.string(), // Include sessionId for client-side filtering
      fileId: z.string(),
      status: z.enum(["pending", "processing", "success", "error"]),
      massGrams: z.number().optional(),
      dimensions: z.object({
        x: z.number(),
        y: z.number(),
        z: z.number(),
      }).optional(),
      errorMessage: z.string().optional(),
      processingTime: z.number().optional(),
      slicerTime: z.number().optional(),
    }),
  },
};

// Create the realtime instance with verbose logging for debugging
export const realtime = new Realtime({ 
  schema, 
  redis,
  verbose: true, // Enable debug logging
});

// Export the event types for use in client components
export type RealtimeEvents = InferRealtimeEvents<typeof realtime>;

// Helper function to emit file status updates
export async function emitFileStatusUpdate(
  sessionId: string,
  data: {
    fileId: string;
    status: "pending" | "processing" | "success" | "error";
    massGrams?: number;
    dimensions?: { x: number; y: number; z: number };
    errorMessage?: string;
    processingTime?: number;
    slicerTime?: number;
  }
) {
  const payload = {
    sessionId,
    ...data,
  };
  
  console.log('📤 Emitting realtime event:', {
    event: 'file.statusUpdate',
    payload,
  });
  
  try {
    // Emit to the default channel
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rt = realtime as any;
    await rt.emit("file.statusUpdate", payload);
    console.log('✅ Realtime event emitted successfully for session:', sessionId);
  } catch (error) {
    console.error('❌ Failed to emit realtime event:', error);
    // Don't throw - webhook should still succeed even if realtime fails
  }
}
