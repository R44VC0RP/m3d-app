'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { Loader2, ShoppingCart, Plus, Minus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { FileGetResponse, ColorGetResponse, AddonGetResponse } from '@/lib/api-types';

const qualityOptions = [
  { value: 'good', label: 'Good', layerHeight: '0.24mm', multiplier: 1 },
  { value: 'better', label: 'Better', layerHeight: '0.20mm', multiplier: 1.2 },
  { value: 'best', label: 'Best', layerHeight: '0.16mm', multiplier: 1.5 }
];

export default function FilePage() {
  const params = useParams();
  const fileId = params.id as string;
  const { addToCart, loading: cartLoading } = useCart();

  const [file, setFile] = useState<FileGetResponse['data'] | null>(null);
  const [colors, setColors] = useState<ColorGetResponse['data']>([]);
  const [addons, setAddons] = useState<AddonGetResponse['data']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configuration state
  const [selectedQuality, setSelectedQuality] = useState('better');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    Promise.all([
      // Fetch file
      fetch(`/api/files?id=${fileId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data && !Array.isArray(data.data)) {
            setFile(data.data);
          } else {
            setError('File not found');
          }
        }),
      // Fetch colors
      fetch('/api/colors')
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.data)) {
            setColors(data.data);
          }
        }),
      // Fetch addons
      fetch('/api/addons')
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.data)) {
            setAddons(data.data);
          }
        })
    ]).finally(() => setLoading(false));
  }, [fileId]);

  const calculatePrice = () => {
    if (!file || !('price' in file)) return 0;
    
    let price = file.price || 0;
    
    // Apply quality multiplier
    const qualityOption = qualityOptions.find(q => q.value === selectedQuality);
    if (qualityOption) {
      price *= qualityOption.multiplier;
    }
    
    // Add addon prices
    if (Array.isArray(addons)) {
      selectedAddons.forEach(addonId => {
        const addon = addons.find(a => a.id === addonId);
        if (addon && 'price' in addon) {
          price += addon.price || 0;
        }
      });
    }
    
    return price * selectedQuantity;
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = selectedQuantity + change;
    if (newQuantity >= 1 && newQuantity <= 100) {
      setSelectedQuantity(newQuantity);
    }
  };

  const handleAddonToggle = (addonId: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const handleAddToCart = async () => {
    if (!file || !('id' in file)) return;
    
    setAdding(true);
    try {
      await addToCart(file.id, {
        quantity: selectedQuantity,
        quality: selectedQuality,
        colorId: selectedColor || undefined,
        addonIds: selectedAddons
      });
      // Reset selections after adding
      setSelectedQuantity(1);
      setSelectedAddons([]);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !file || Array.isArray(file)) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">File Not Found</h1>
            <p className="text-gray-400 mb-8">{error || 'The requested file could not be found.'}</p>
            <Link 
              href="/"
              className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Go Back Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-16">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Images and Info */}
          <div>
            {file.images && file.images.length > 0 ? (
              <div className="bg-gray-900 rounded-lg overflow-hidden mb-6">
                <img 
                  src={file.images[0]} 
                  alt={file.name}
                  className="w-full h-96 object-cover"
                />
                {file.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 p-4">
                    {file.images.slice(1, 5).map((image, index) => (
                      <img 
                        key={index}
                        src={image} 
                        alt={`${file.name} ${index + 2}`}
                        className="w-full h-20 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-900 rounded-lg h-96 flex items-center justify-center mb-6">
                <p className="text-gray-500">No preview available</p>
              </div>
            )}

            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">File Details</h2>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-gray-400">File Type:</dt>
                  <dd className="font-medium">{file.filetype}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Filename:</dt>
                  <dd className="font-medium">{file.filename}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Dimensions:</dt>
                  <dd className="font-medium">
                    {file.dimensionX} × {file.dimensionY} × {file.dimensionZ} mm
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Mass:</dt>
                  <dd className="font-medium">{file.mass}g</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Slicing Status:</dt>
                  <dd className="font-medium capitalize">{file.slicing_status}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Right Column - Configuration and Add to Cart */}
          <div>
            <h1 className="text-4xl font-bold mb-2">{file.name}</h1>
            <div className="text-3xl font-bold text-orange-500 mb-8">
              ${calculatePrice().toFixed(2)}
            </div>

            <div className="space-y-6">
              {/* Quality Selection */}
              <div>
                <label className="block text-lg font-medium mb-3">Print Quality</label>
                <div className="grid grid-cols-3 gap-3">
                  {qualityOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedQuality(option.value)}
                      className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                        selectedQuality === option.value
                          ? 'bg-orange-500 border-orange-500 text-white'
                          : 'bg-gray-900 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm opacity-75">{option.layerHeight}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-lg font-medium mb-3">Quantity</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={selectedQuantity <= 1}
                    className="p-3 rounded-lg bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <span className="w-20 text-center text-xl font-medium">{selectedQuantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={selectedQuantity >= 100}
                    className="p-3 rounded-lg bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Color Selection */}
              {colors.length > 0 && (
                <div>
                  <label className="block text-lg font-medium mb-3">Color (Optional)</label>
                  <div className="grid grid-cols-8 gap-2">
                    <button
                      onClick={() => setSelectedColor(null)}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        !selectedColor
                          ? 'border-orange-500'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-xs">None</div>
                    </button>
                    {Array.isArray(colors) && colors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setSelectedColor(color.id)}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          selectedColor === color.id
                            ? 'border-orange-500'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                        title={color.name}
                      >
                        <div
                          className="w-full h-8 rounded"
                          style={{ backgroundColor: color.hexCode }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Addons */}
              {addons.length > 0 && (
                <div>
                  <label className="block text-lg font-medium mb-3">Add-ons</label>
                  <div className="space-y-2">
                    {Array.isArray(addons) && addons.map((addon) => {
                      const isSelected = selectedAddons.includes(addon.id);
                      return (
                        <button
                          key={addon.id}
                          onClick={() => handleAddonToggle(addon.id)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                            isSelected
                              ? 'bg-orange-500/20 border-orange-500'
                              : 'bg-gray-900 border-gray-700 hover:border-gray-600'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{addon.name}</div>
                              {addon.description && (
                                <div className="text-sm text-gray-400">{addon.description}</div>
                              )}
                            </div>
                            {addon.price > 0 ? (
                              <div className="text-lg">+${addon.price.toFixed(2)}</div>
                            ) : (
                              <div className="text-lg text-gray-400">Free</div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={adding || cartLoading}
                className="w-full bg-orange-500 text-white py-4 rounded-lg hover:bg-orange-600 transition-colors font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Adding to Cart...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
                  </>
                )}
              </button>

              <Link 
                href="/cart"
                className="block w-full text-center bg-gray-900 text-white py-4 rounded-lg hover:bg-gray-800 transition-colors font-semibold"
              >
                View Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}