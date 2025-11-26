'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useSession } from '@/hooks/useSession';

interface SessionContextType {
  sessionId: string | null;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType>({
  sessionId: null,
  isLoading: true,
});

export function useSessionContext() {
  return useContext(SessionContext);
}

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const { sessionId, isLoading, syncSession } = useSession();

  // Sync session to server when it's available
  useEffect(() => {
    if (sessionId && !isLoading) {
      syncSession();
    }
  }, [sessionId, isLoading, syncSession]);

  return (
    <SessionContext.Provider value={{ sessionId, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
}

