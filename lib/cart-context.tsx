'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartGetResponse, CartPostRequest } from '@/lib/api-types';

interface CartContextType {
  cart: CartGetResponse['data'] | null;
  loading: boolean;
  error: string | null;
  sessionId: string;
  addToCart: (fileId: string, options?: Partial<CartPostRequest>) => Promise<void>;
  updateCartItem: (itemId: string, updates: any) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartGetResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');

  // Initialize session ID
  useEffect(() => {
    let storedSessionId = localStorage.getItem('sessionId');
    if (!storedSessionId) {
      storedSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('sessionId', storedSessionId);
    }
    setSessionId(storedSessionId);
    fetchCart(storedSessionId);
  }, []);

  const fetchCart = async (sessionId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/cart?sessionId=${sessionId}`);
      const data: CartGetResponse = await response.json();
      
      if (data.success && data.data) {
        setCart(data.data);
      } else if (response.status === 404) {
        // Cart doesn't exist yet, that's okay
        setCart(null);
      } else {
        setError(data.error || 'Failed to fetch cart');
      }
    } catch (err) {
      setError('Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (fileId: string, options?: Partial<CartPostRequest>) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          fileId,
          ...options
        })
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchCart(sessionId);
      } else {
        setError(data.error || 'Failed to add to cart');
      }
    } catch (err) {
      setError('Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId: string, updates: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          itemId,
          ...updates
        })
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchCart(sessionId);
      } else {
        setError(data.error || 'Failed to update cart item');
      }
    } catch (err) {
      setError('Failed to update cart item');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/cart?sessionId=${sessionId}&itemId=${itemId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchCart(sessionId);
      } else {
        setError(data.error || 'Failed to remove from cart');
      }
    } catch (err) {
      setError('Failed to remove from cart');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/cart?sessionId=${sessionId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        setCart(null);
      } else {
        setError(data.error || 'Failed to clear cart');
      }
    } catch (err) {
      setError('Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  const refreshCart = async () => {
    await fetchCart(sessionId);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        sessionId,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}