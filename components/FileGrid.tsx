'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, ShoppingCart } from 'lucide-react';
import type { FileGetResponse } from '@/lib/api-types';
import { useCart } from '@/lib/cart-context';

export default function FileGrid() {
  const [files, setFiles] = useState<FileGetResponse['data']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch('/api/files')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setFiles(data.data);
        } else {
          setError('Failed to load files');
        }
      })
      .catch(() => setError('Failed to load files'))
      .finally(() => setLoading(false));
  }, []);

  const handleQuickAdd = async (fileId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(fileId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!Array.isArray(files) || files.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400">No files available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {files.map((file) => (
        <Link
          key={file.id}
          href={`/file/${file.id}`}
          className="group bg-gray-900 rounded-lg overflow-hidden hover:ring-2 hover:ring-orange-500 transition-all"
        >
          {file.images && file.images.length > 0 ? (
            <div className="aspect-square overflow-hidden bg-gray-800">
              <img
                src={file.images[0]}
                alt={file.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="aspect-square bg-gray-800 flex items-center justify-center">
              <span className="text-gray-600">No preview</span>
            </div>
          )}
          
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2 group-hover:text-orange-500 transition-colors">
              {file.name}
            </h3>
            
            <div className="text-sm text-gray-400 mb-3 space-y-1">
              <p>{file.dimensionX} × {file.dimensionY} × {file.dimensionZ} mm</p>
              <p>{file.mass}g • {file.filetype}</p>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-orange-500">
                ${file.price.toFixed(2)}
              </span>
              
              <button
                onClick={(e) => handleQuickAdd(file.id, e)}
                className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                title="Quick add to cart"
              >
                <ShoppingCart className="h-5 w-5" />
              </button>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}