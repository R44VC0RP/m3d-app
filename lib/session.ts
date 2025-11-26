// Server-only session utilities
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, SESSION_COOKIE_MAX_AGE } from './session-constants';

// Re-export constants for convenience
export { SESSION_COOKIE_NAME, SESSION_COOKIE_MAX_AGE } from './session-constants';

/**
 * Generate a UUID v4
 */
export function generateSessionId(): string {
  return crypto.randomUUID();
}

/**
 * Get session ID from cookies (server-side)
 * Returns null if no session cookie exists
 */
export async function getSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  return sessionCookie?.value ?? null;
}

/**
 * Set session ID cookie (server-side)
 * Used in API routes to set the session cookie
 */
export async function setSessionCookie(sessionId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: sessionId,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_COOKIE_MAX_AGE,
  });
}

/**
 * Get or create session ID (server-side)
 * Returns existing session ID or creates a new one
 */
export async function getOrCreateSessionId(): Promise<string> {
  const existingSessionId = await getSessionId();
  
  if (existingSessionId) {
    return existingSessionId;
  }
  
  const newSessionId = generateSessionId();
  await setSessionCookie(newSessionId);
  return newSessionId;
}
