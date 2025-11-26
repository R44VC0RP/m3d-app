import { sleep, fetch } from "workflow";

// Timeout duration for slicing service (30 seconds)
const SLICING_TIMEOUT = "30s";

interface ProcessFileParams {
  fileId: string;
  sessionId: string;
  fileUrl: string;
  fileName: string;
  callbackBaseUrl: string; // Passed from the route so it uses NEXT_PUBLIC_APP_URL
  maxDimensions?: { x: number; y: number; z: number };
}

interface SubmitParams {
  fileUrl: string;
  fileName: string;
  callbackUrl: string;
  fileId: string;
  maxDimensions: { x: number; y: number; z: number };
}

// Step function to submit file to Mandarin3D using workflow's fetch
async function submitToMandarin3D(params: SubmitParams) {
  "use step";

  const apiUrl = process.env.MANDARIN3D_API_URL || 'https://m3d-api.sevalla.app';
  
  console.log(`[Step] Submitting to Mandarin3D:`, {
    ...params,
    apiUrl,
  });

  const response = await fetch(`${apiUrl}/api/slice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file_url: params.fileUrl,
      file_name: params.fileName,
      callback_url: params.callbackUrl,
      file_id: params.fileId,
      max_dimensions: params.maxDimensions,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP error ${response.status}: ${text}`);
  }

  const data = await response.json();
  console.log(`[Step] Mandarin3D response:`, data);
  return data;
}

// Step function to check if file has been updated by the callback
async function checkFileStatus(fileId: string): Promise<{ 
  status: 'pending' | 'processing' | 'success' | 'error';
  updated: boolean;
}> {
  "use step";

  const { db } = await import("@/db");
  const { uploadedFile } = await import("@/db/schema");
  const { eq } = await import("drizzle-orm");

  const file = await db.query.uploadedFile.findFirst({
    where: eq(uploadedFile.id, fileId),
  });

  if (!file) {
    return { status: 'error', updated: false };
  }

  // If status is still processing, callback hasn't arrived yet
  const updated = file.status === 'success' || file.status === 'error';
  
  console.log(`[Step] File status check:`, { fileId, status: file.status, updated });
  
  return { status: file.status as 'pending' | 'processing' | 'success' | 'error', updated };
}

// Step function to mark file as timed out
async function markFileAsTimedOut(params: { fileId: string; sessionId: string }) {
  "use step";

  const { db } = await import("@/db");
  const { uploadedFile } = await import("@/db/schema");
  const { eq } = await import("drizzle-orm");
  const { emitFileStatusUpdate } = await import("@/lib/realtime");

  const errorMessage = 'Processing timed out. The slicing service did not respond within 30 seconds.';

  console.log(`[Step] Marking file as timed out:`, params.fileId);

  await db.update(uploadedFile)
    .set({
      status: 'error',
      errorMessage: errorMessage,
      updatedAt: new Date(),
    })
    .where(eq(uploadedFile.id, params.fileId));

  await emitFileStatusUpdate(params.sessionId, {
    fileId: params.fileId,
    status: 'error',
    errorMessage: errorMessage,
  });

  console.log(`[Step] File marked as timed out and realtime event emitted`);
}

// Step function to mark file as error (submission failed)
async function markFileAsError(params: { fileId: string; sessionId: string; errorMessage: string }) {
  "use step";

  const { db } = await import("@/db");
  const { uploadedFile } = await import("@/db/schema");
  const { eq } = await import("drizzle-orm");
  const { emitFileStatusUpdate } = await import("@/lib/realtime");

  console.log(`[Step] Marking file as error:`, params.fileId, params.errorMessage);

  await db.update(uploadedFile)
    .set({
      status: 'error',
      errorMessage: params.errorMessage,
      updatedAt: new Date(),
    })
    .where(eq(uploadedFile.id, params.fileId));

  await emitFileStatusUpdate(params.sessionId, {
    fileId: params.fileId,
    status: 'error',
    errorMessage: params.errorMessage,
  });
}

/**
 * Workflow to process a 3D file with the Mandarin3D slicing service.
 * Uses the existing /api/webhooks/mandarin3d endpoint for callbacks (so it works with NEXT_PUBLIC_APP_URL).
 * Polls the database to check if callback was received, with a 30-second timeout.
 */
export async function processFileWorkflow(params: ProcessFileParams) {
  "use workflow";

  const { fileId, sessionId, fileUrl, fileName, callbackBaseUrl, maxDimensions } = params;

  // Use the app's webhook endpoint (works with NEXT_PUBLIC_APP_URL for production)
  const callbackUrl = `${callbackBaseUrl}/api/webhooks/mandarin3d`;

  console.log(`[Workflow] Starting file processing for ${fileId}`);
  console.log(`[Workflow] Callback URL: ${callbackUrl}`);

  // Submit to Mandarin3D
  try {
    await submitToMandarin3D({
      fileUrl,
      fileName,
      callbackUrl,
      fileId,
      maxDimensions: maxDimensions ?? { x: 250, y: 250, z: 250 },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to submit for processing';
    console.error(`[Workflow] Failed to submit to Mandarin3D:`, error);

    await markFileAsError({ fileId, sessionId, errorMessage });
    return { success: false, error: errorMessage };
  }

  // Wait for the timeout period, then check if the callback was received
  // The callback will update the database directly via /api/webhooks/mandarin3d
  console.log(`[Workflow] Waiting ${SLICING_TIMEOUT} for callback...`);
  await sleep(SLICING_TIMEOUT);

  // Check if the callback updated the file status
  const { status, updated } = await checkFileStatus(fileId);

  if (!updated) {
    // Callback never arrived - mark as timed out
    console.log(`[Workflow] Timeout reached for file ${fileId}, marking as stale`);
    await markFileAsTimedOut({ fileId, sessionId });
    return { success: false, error: 'timeout' };
  }

  // Callback was received - the webhook endpoint already updated the DB and emitted realtime events
  console.log(`[Workflow] File ${fileId} was updated by callback with status: ${status}`);
  return { success: status === 'success', status };
}
