'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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

export default function FilesPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Demo file creation form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFile, setNewFile] = useState({
    name: '',
    filetype: 'STL',
    filename: '',
    dimensions: { x: 0, y: 0, z: 0 },
    mass: 0,
    metadata: {}
  });

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files');
      const data = await response.json();
      
      if (data.success) {
        setFiles(data.data);
      } else {
        setError(data.error || 'Failed to fetch files');
      }
    } catch (err) {
      setError('Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  const createFile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newFile.name || !newFile.filename || newFile.mass <= 0 || 
        newFile.dimensions.x <= 0 || newFile.dimensions.y <= 0 || newFile.dimensions.z <= 0) {
      setError('Please fill in all required fields with valid values');
      return;
    }

    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newFile),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFiles(prev => [data.data, ...prev]);
        setNewFile({
          name: '',
          filetype: 'STL',
          filename: '',
          dimensions: { x: 0, y: 0, z: 0 },
          mass: 0,
          metadata: {}
        });
        setShowCreateForm(false);
        setError(null);
      } else {
        setError(data.error || 'Failed to create file');
      }
    } catch (err) {
      setError('Failed to create file');
    }
  };

  const deleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFiles(prev => prev.filter(file => file.id !== fileId));
      } else {
        setError(data.error || 'Failed to delete file');
      }
    } catch (err) {
      setError('Failed to delete file');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading files...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Files</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Demo File
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
            <button 
              onClick={() => setError(null)}
              className="ml-4 text-red-800 hover:text-red-900"
            >
              ×
            </button>
          </div>
        )}

        {/* Create File Form */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Add Demo File</h2>
              <form onSubmit={createFile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newFile.name}
                    onChange={(e) => setNewFile(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filename *
                  </label>
                  <input
                    type="text"
                    value={newFile.filename}
                    onChange={(e) => setNewFile(prev => ({ ...prev, filename: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="example.stl"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      X (mm) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={newFile.dimensions.x}
                      onChange={(e) => setNewFile(prev => ({ 
                        ...prev, 
                        dimensions: { ...prev.dimensions, x: parseFloat(e.target.value) || 0 }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Y (mm) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={newFile.dimensions.y}
                      onChange={(e) => setNewFile(prev => ({ 
                        ...prev, 
                        dimensions: { ...prev.dimensions, y: parseFloat(e.target.value) || 0 }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Z (mm) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={newFile.dimensions.z}
                      onChange={(e) => setNewFile(prev => ({ 
                        ...prev, 
                        dimensions: { ...prev.dimensions, z: parseFloat(e.target.value) || 0 }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mass (grams) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={newFile.mass}
                    onChange={(e) => setNewFile(prev => ({ ...prev, mass: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Create File
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Files Grid */}
        {files.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-500 text-lg mb-4">No files found</div>
            <p className="text-gray-400">Add a demo file to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {files.map((file) => (
              <div key={file.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {file.name}
                  </h3>
                  <button
                    onClick={() => deleteFile(file.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p><span className="font-medium">File:</span> {file.filename}</p>
                  <p><span className="font-medium">Type:</span> {file.filetype}</p>
                  <p><span className="font-medium">Dimensions:</span> {file.dimensions.x}×{file.dimensions.y}×{file.dimensions.z}mm</p>
                  <p><span className="font-medium">Mass:</span> {file.mass}g</p>
                  <p>
                    <span className="font-medium">Status:</span>
                    <span className={`ml-1 px-2 py-1 rounded text-xs ${
                      file.slicing_status === 'completed' ? 'bg-green-100 text-green-800' :
                      file.slicing_status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      file.slicing_status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {file.slicing_status.charAt(0).toUpperCase() + file.slicing_status.slice(1)}
                    </span>
                  </p>
                </div>

                <Link
                  href={`/file/${file.id}`}
                  className="block w-full bg-blue-600 text-white text-center py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  View & Configure
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}