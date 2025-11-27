import { notFound } from 'next/navigation';
import { db } from '@/db';
import { uploadedFile, cartItem } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSessionId } from '@/lib/session';
import { getAvailableColors } from '@/lib/colors';
import FileDetailClient from './client';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FileDetailPage({ params }: PageProps) {
  const { id } = await params;
  const sessionId = await getSessionId();

  if (!sessionId) {
    // Should not happen if middleware or flow is correct, but fallback
    return notFound();
  }

  // Fetch file details
  const [file] = await db
    .select()
    .from(uploadedFile)
    .where(eq(uploadedFile.id, id))
    .limit(1);

  if (!file) {
    return notFound();
  }

  // Fetch associated cart item if it exists for this session
  // We want to pre-fill the form if the user has this file in their cart
  const [item] = await db
    .select()
    .from(cartItem)
    .where(
      and(
        eq(cartItem.uploadedFileId, id),
        eq(cartItem.sessionId, sessionId)
      )
    )
    .limit(1);

  // Fetch colors
  const colors = await getAvailableColors();

  return (
    <FileDetailClient 
      file={file} 
      initialCartItem={item || null} 
      colors={colors} 
    />
  );
}

