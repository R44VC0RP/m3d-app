'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';

interface CartItemWithDetails {
  id: string;
  file_id: string;
  quality: 'good' | 'better' | 'best';
  quantity: number;
  color: string;
  created_at: string;
  updated_at: string;
  file: {
    id: string;
    name: string;
    filetype: string;
    filename: string;
    dimensions: { x: number; y: number; z: number };
    mass: number;
  };
  addons: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    is_active: boolean;
  }>;
}

interface Color {
  id: string;
  name: string;
  hex_code: string;
  is_available: boolean;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItemWithDetails[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const qualityOptions = {
    good: { label: 'Good (0.24mm layer height)', price: 1.0 },
    better: { label: 'Better (0.20mm layer height)', price: 1.2 },
    best: { label: 'Best (0.16mm layer height)', price: 1.5 }
  };

  useEffect(() => {
    fetchCartItems();
    fetchColors();
  }, []);

  const fetchCartItems = async () => {
    try {
      const response = await fetch('/api/cart');
      const data = await response.json();
      
      if (data.success) {
        setCartItems(data.data);
      } else {
        setError(data.error || 'Failed to fetch cart items');
      }
    } catch (err) {
      setError('Failed to fetch cart items');
    }
  };

  const fetchColors = async () => {
    try {
      const response = await fetch('/api/colors');
      const data = await response.json();
      
      if (data.success) {
        setColors(data.data);
      } else {
        setError(data.error || 'Failed to fetch colors');
      }
    } catch (err) {
      setError('Failed to fetch colors');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCartItems(prev => prev.filter(item => item.id !== itemId));
      } else {
        setError(data.error || 'Failed to remove item from cart');
      }
    } catch (err) {
      setError('Failed to remove item from cart');
    }
  };

  const clearCart = async () => {
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCartItems([]);
      } else {
        setError(data.error || 'Failed to clear cart');
      }
    } catch (err) {
      setError('Failed to clear cart');
    }
  };

  const calculateItemPrice = (item: CartItemWithDetails): number => {
    const basePrice = item.file.mass * 0.05; // $0.05 per gram base price
    const qualityMultiplier = qualityOptions[item.quality].price;
    const addonPrice = item.addons.reduce((sum, addon) => sum + addon.price, 0) / 100; // Convert cents to dollars
    
    return (basePrice * qualityMultiplier + addonPrice) * item.quantity;
  };

  const calculateTotal = (): number => {
    return cartItems.reduce((total, item) => total + calculateItemPrice(item), 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading cart...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear Cart
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-500 text-lg mb-4">Your cart is empty</div>
            <a
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {item.file.name}
                    </h3>
                    <p className="text-gray-600">
                      {item.file.filename} ({item.file.filetype})
                    </p>
                    <p className="text-sm text-gray-500">
                      Dimensions: {item.file.dimensions.x}mm × {item.file.dimensions.y}mm × {item.file.dimensions.z}mm
                    </p>
                    <p className="text-sm text-gray-500">
                      Mass: {item.file.mass}g
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quality
                    </label>
                    <div className="text-sm">
                      <span className="font-medium">{qualityOptions[item.quality].label}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <div className="text-sm">
                      <span className="font-medium">{item.quantity}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <div className="flex items-center space-x-2">
                      {colors.find(c => c.id === item.color) && (
                        <>
                          <div
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: colors.find(c => c.id === item.color)?.hex_code }}
                          />
                          <span className="text-sm font-medium">
                            {colors.find(c => c.id === item.color)?.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {item.addons.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add-ons
                    </label>
                    <div className="space-y-1">
                      {item.addons.map((addon) => (
                        <div key={addon.id} className="flex justify-between items-center text-sm">
                          <span>{addon.name}</span>
                          <span className="text-gray-600">
                            {addon.price > 0 ? `+$${(addon.price / 100).toFixed(2)}` : 'Free'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Item Total:</span>
                    <span className="text-lg font-semibold text-green-600">
                      ${calculateItemPrice(item).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span className="text-green-600">${calculateTotal().toFixed(2)}</span>
              </div>
              <button className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}