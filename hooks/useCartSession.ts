import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

// Generate or get session ID
export const getSessionId = () => {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('cart_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem('cart_session_id', sessionId);
  }
  return sessionId;
};

// Hook to manage cart session and merge on login
export const useCartSession = () => {
  const { user, isLoaded } = useUser();
  const mergeCartsOnLogin = useMutation(api.cart.mergeCartsOnLogin);
  const getOrCreateSession = useMutation(api.cart.getOrCreateSession);

  useEffect(() => {
    if (!isLoaded) return;

    const sessionId = getSessionId();
    
    // If user is logged in, merge any anonymous cart items
    if (user?.id && sessionId) {
      // Get the user from Convex (assuming you have a way to get Convex user ID)
      // For now, we'll use Clerk ID as a placeholder
      // You may need to adjust this based on your user management setup
      
      // Create or update session with user ID
      getOrCreateSession({
        sessionId,
        userId: undefined, // You'll need to get the actual Convex user ID here
      });
    }
  }, [user, isLoaded, mergeCartsOnLogin, getOrCreateSession]);

  return {
    sessionId: getSessionId(),
    userId: user?.id,
    isAuthenticated: !!user,
  };
};
