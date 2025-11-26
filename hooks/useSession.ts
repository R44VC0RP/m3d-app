'use client';

import { useState, useEffect, useCallback } from 'react';
import { SESSION_COOKIE_NAME } from '@/lib/session-constants';

const LOCAL_STORAGE_KEY = 'm3d-session-id';

/**
 * Generate a UUID v4 (client-side)
 */
function generateSessionId(): string {
  return crypto.randomUUID();
}

/**
 * Get cookie value by name
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() ?? null;
  }
  
  return null;
}

/**
 * Set a cookie with the given name, value, and max age
 */
function setCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === 'undefined') return;
  
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${value}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

/**
 * Custom hook for session management
 * Syncs session ID between localStorage and cookie
 */
export function useSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    const initializeSession = () => {
      // Try to get session from localStorage first (persists across browser sessions)
      let storedSessionId = localStorage.getItem(LOCAL_STORAGE_KEY);
      
      // If not in localStorage, check cookie (may have been set by server)
      if (!storedSessionId) {
        storedSessionId = getCookie(SESSION_COOKIE_NAME);
      }
      
      // If we have a session ID from either source, use it
      if (storedSessionId) {
        // Sync to both storage mechanisms
        localStorage.setItem(LOCAL_STORAGE_KEY, storedSessionId);
        setCookie(SESSION_COOKIE_NAME, storedSessionId, 60 * 60 * 24 * 365); // 1 year
        setSessionId(storedSessionId);
      } else {
        // Generate new session ID
        const newSessionId = generateSessionId();
        localStorage.setItem(LOCAL_STORAGE_KEY, newSessionId);
        setCookie(SESSION_COOKIE_NAME, newSessionId, 60 * 60 * 24 * 365); // 1 year
        setSessionId(newSessionId);
      }
      
      setIsLoading(false);
    };

    initializeSession();
  }, []);

  // Sync session to API to ensure server-side cookie is set
  const syncSession = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
    } catch (error) {
      console.error('Failed to sync session:', error);
    }
  }, [sessionId]);

  return {
    sessionId,
    isLoading,
    syncSession,
  };
}

