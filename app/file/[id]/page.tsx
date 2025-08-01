'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/header';

interface File {
  id: string;
  name: string;
  filetype: string;
  filename: string;
  dimensions: {
    x: number;
    y: number;
    z: number;
  };
  mass: number;
  slicing_status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface Color {
  id: string;
  name: string;
  hex_code: string;
  is_available: boolean;
}

interface FileAddon {
  id: string;
  name: string;
  description: string;
  price: number;
  is_active: boolean;
}

export default function FilePage() {
  const params = useParams();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [colors, setColors] = useState<Color[]>([]);
  const [addons, setAddons] = useState<FileAddon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);

  // Configuration state
  const [selectedQuality, setSelectedQuality] = useState<'good' | 'better' | 'best'>('better');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const qualityOptions = {
    good: { label: 'Good (0.24mm layer height)', price: 1.0 },
    better: { label: 'Better (0.20mm layer height)', price: 1.2 },
    best: { label: 'Best (0.16mm layer height)', price: 1.5 }
  };

  useEffect(() => {
    if (params.id) {
      fetchFile(params.id as string);
      fetchColors();
      fetchAddons();
    }
  }, [params.id]);

  const fetchFile = async (id: string) => {
    try {
      const response = await fetch(`/api/files/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setFile(data.data);
      } else {
        setError(data.error || 'File not found');
      }
    } catch (err) {
      setError('Failed to fetch file');
    }
  };

  const fetchColors = async () => {
    try {
      const response = await fetch('/api/colors');
      const data = await response.json();
      
      if (data.success) {
        setColors(data.data);
        if (data.data.length > 0) {
          setSelectedColor(data.data[0].id); // Set default color
        }
      } else {
        setError(data.error || 'Failed to fetch colors');
      }
    } catch (err) {
      setError('Failed to fetch colors');
    }
  };

  const fetchAddons = async () => {
    try {
      const response = await fetch('/api/addons');
      const data = await response.json();
      
      if (data.success) {
        setAddons(data.data);
      } else {
        setError(data.error || 'Failed to fetch addons');
      }
    } catch (err) {
      setError('Failed to fetch addons');
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = (): number => {
    if (!file) return 0;
    
    const basePrice = file.mass * 0.05; // $0.05 per gram base price
    const qualityMultiplier = qualityOptions[selectedQuality].price;
    const addonPrice = selectedAddons.reduce((sum, addonId) => {
      const addon = addons.find(a => a.id === addonId);
      return sum + (addon ? addon.price : 0);
    }, 0) / 100; // Convert cents to dollars
    
    return (basePrice * qualityMultiplier + addonPrice) * selectedQuantity;
  };

  const addToCart = async () => {
    if (!file || !selectedColor) return;
    
    setAddingToCart(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_id: file.id,
          quality: selectedQuality,
          quantity: selectedQuantity,
          color: selectedColor,
          addon_ids: selectedAddons
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        router.push('/cart');
      } else {
        setError(data.error || 'Failed to add to cart');
      }
    } catch (err) {
      setError('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading file...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {error || 'File not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* File Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{file.name}</h1>
            
            {/* File Image Placeholder */}
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center mb-6">
              <div className="text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <p className="text-sm">File Preview</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="font-semibold text-gray-700">Filename:</span>
                <span className="ml-2 text-gray-600">{file.filename}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">File Type:</span>
                <span className="ml-2 text-gray-600">{file.filetype}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Dimensions:</span>
                <span className="ml-2 text-gray-600">
                  {file.dimensions.x}mm × {file.dimensions.y}mm × {file.dimensions.z}mm
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Mass:</span>
                <span className="ml-2 text-gray-600">{file.mass}g</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                  file.slicing_status === 'completed' ? 'bg-green-100 text-green-800' :
                  file.slicing_status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                  file.slicing_status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {file.slicing_status.charAt(0).toUpperCase() + file.slicing_status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Configuration & Pricing */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Configure Your Print</h2>
            
            {/* Quality Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Print Quality
              </label>
              <div className="space-y-2">
                {Object.entries(qualityOptions).map(([key, option]) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="radio"
                      name="quality"
                      value={key}
                      checked={selectedQuality === key}
                      onChange={(e) => setSelectedQuality(e.target.value as 'good' | 'better' | 'best')}
                      className="mr-3"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Quantity Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={selectedQuantity}
                onChange={(e) => setSelectedQuantity(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Color Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Color
              </label>
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color) => (
                  <label key={color.id} className="flex flex-col items-center cursor-pointer">
                    <input
                      type="radio"
                      name="color"
                      value={color.id}
                      checked={selectedColor === color.id}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="sr-only"
                    />
                    <div
                      className={`w-8 h-8 rounded-full border-2 ${
                        selectedColor === color.id ? 'border-blue-500' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color.hex_code }}
                    />
                    <span className="text-xs mt-1">{color.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Add-ons */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Add-ons
              </label>
              <div className="space-y-2">
                {addons.map((addon) => (
                  <label key={addon.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedAddons.includes(addon.id)}
                        onChange={() => toggleAddon(addon.id)}
                        className="mr-3"
                      />
                      <div>
                        <span className="text-sm font-medium">{addon.name}</span>
                        <p className="text-xs text-gray-500">{addon.description}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {addon.price > 0 ? `+$${(addon.price / 100).toFixed(2)}` : 'Free'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price and Add to Cart */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold">Total Price:</span>
                <span className="text-xl font-bold text-green-600">
                  ${calculatePrice().toFixed(2)}
                </span>
              </div>
              
              <button
                onClick={addToCart}
                disabled={addingToCart || !selectedColor}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}