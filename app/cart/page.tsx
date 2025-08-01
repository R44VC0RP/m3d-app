'use client';

import { useCart } from '@/lib/cart-context';
import { useState, useEffect } from 'react';
import { Loader2, Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import type { ColorGetResponse, AddonGetResponse } from '@/lib/api-types';

const qualityOptions = [
  { value: 'good', label: 'Good', layerHeight: '0.24mm' },
  { value: 'better', label: 'Better', layerHeight: '0.20mm' },
  { value: 'best', label: 'Best', layerHeight: '0.16mm' }
];

export default function CartPage() {
  const { cart, loading, error, updateCartItem, removeFromCart, clearCart } = useCart();
  const [colors, setColors] = useState<ColorGetResponse['data']>([]);
  const [addons, setAddons] = useState<AddonGetResponse['data']>([]);
  const [loadingColors, setLoadingColors] = useState(true);
  const [loadingAddons, setLoadingAddons] = useState(true);

  useEffect(() => {
    // Fetch colors
    fetch('/api/colors')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setColors(data.data);
        }
      })
      .finally(() => setLoadingColors(false));

    // Fetch addons
    fetch('/api/addons')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setAddons(data.data);
        }
      })
      .finally(() => setLoadingAddons(false));
  }, []);

  const calculateItemPrice = (item: any) => {
    let price = item.file.price || 0;
    
    // Adjust price based on quality
    if (item.quality === 'better') price *= 1.2;
    if (item.quality === 'best') price *= 1.5;
    
    // Add addon prices
    if (item.addons && Array.isArray(item.addons)) {
      item.addons.forEach((addon: any) => {
        price += addon.addon.price || 0;
      });
    }
    
    return price * item.quantity;
  };

  const calculateTotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => total + calculateItemPrice(item), 0);
  };

  const handleQuantityChange = async (itemId: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity >= 1 && newQuantity <= 100) {
      await updateCartItem(itemId, { quantity: newQuantity });
    }
  };

  const handleQualityChange = async (itemId: string, quality: string) => {
    await updateCartItem(itemId, { quality });
  };

  const handleColorChange = async (itemId: string, colorId: string) => {
    await updateCartItem(itemId, { colorId: colorId || null });
  };

  const handleAddonToggle = async (itemId: string, addonId: string, currentAddons: any[]) => {
    const currentAddonIds = currentAddons.map(a => a.addon.id);
    let newAddonIds: string[];
    
    if (currentAddonIds.includes(addonId)) {
      newAddonIds = currentAddonIds.filter(id => id !== addonId);
    } else {
      newAddonIds = [...currentAddonIds, addonId];
    }
    
    await updateCartItem(itemId, { addonIds: newAddonIds });
  };

  if (loading && !cart) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold mb-8">Your Cart</h1>
          <div className="text-center py-16">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-xl text-gray-400 mb-8">Your cart is empty</p>
            <Link 
              href="/"
              className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Browse Files
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Your Cart</h1>
          <button
            onClick={clearCart}
            className="text-red-500 hover:text-red-400 transition-colors"
          >
            Clear Cart
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {cart.items.map((item) => (
              <div key={item.id} className="bg-gray-900 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{item.file.name}</h3>
                    <p className="text-gray-400 text-sm">
                      Dimensions: {item.file.dimensionX} × {item.file.dimensionY} × {item.file.dimensionZ} mm
                    </p>
                    <p className="text-gray-400 text-sm">Mass: {item.file.mass}g</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Quality Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Quality</label>
                    <div className="grid grid-cols-3 gap-2">
                      {qualityOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleQualityChange(item.id, option.value)}
                          className={`px-4 py-2 rounded-lg border transition-colors ${
                            item.quality === option.value
                              ? 'bg-orange-500 border-orange-500 text-white'
                              : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                          }`}
                        >
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs opacity-75">{option.layerHeight}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Quantity</label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                        disabled={item.quantity <= 1}
                        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-16 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                        disabled={item.quantity >= 100}
                        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Color Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Color</label>
                    {loadingColors ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-gray-400">Loading colors...</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-6 gap-2">
                        <button
                          onClick={() => handleColorChange(item.id, '')}
                          className={`p-2 rounded-lg border-2 transition-colors ${
                            !item.colorId
                              ? 'border-orange-500'
                              : 'border-gray-700 hover:border-gray-600'
                          }`}
                        >
                          <div className="text-xs">None</div>
                        </button>
                        {Array.isArray(colors) && colors.map((color) => (
                          <button
                            key={color.id}
                            onClick={() => handleColorChange(item.id, color.id)}
                            className={`p-2 rounded-lg border-2 transition-colors ${
                              item.colorId === color.id
                                ? 'border-orange-500'
                                : 'border-gray-700 hover:border-gray-600'
                            }`}
                            title={color.name}
                          >
                            <div
                              className="w-full h-6 rounded"
                              style={{ backgroundColor: color.hexCode }}
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Addons */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Add-ons</label>
                    {loadingAddons ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-gray-400">Loading add-ons...</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {Array.isArray(addons) && addons.map((addon) => {
                          const isSelected = item.addons?.some(a => a.addon.id === addon.id);
                          return (
                            <button
                              key={addon.id}
                              onClick={() => handleAddonToggle(item.id, addon.id, item.addons || [])}
                              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                                isSelected
                                  ? 'bg-orange-500/20 border-orange-500'
                                  : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium">{addon.name}</div>
                                  {addon.description && (
                                    <div className="text-xs text-gray-400">{addon.description}</div>
                                  )}
                                </div>
                                {addon.price > 0 ? (
                                  <div className="text-sm">+${addon.price.toFixed(2)}</div>
                                ) : (
                                  <div className="text-sm text-gray-400">Free</div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-800">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Item Total:</span>
                    <span className="text-xl font-semibold">
                      ${calculateItemPrice(item).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg p-6 sticky top-6">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      {item.file.name} × {item.quantity}
                    </span>
                    <span>${calculateItemPrice(item).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-800 pt-4 mb-6">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <button className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold">
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}