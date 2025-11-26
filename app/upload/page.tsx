'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { useSessionContext } from '@/components/SessionProvider';
import { Loader2, Upload, CheckCircle2, AlertCircle, FileBox, Trash2 } from 'lucide-react';

// Supported 3D file formats
const ACCEPTED_FILE_TYPES = [
  '.stl', '.obj', '.ply', '.off', '.3mf',
  '.gltf', '.glb', '.dae', '.x3d', '.wrl',
  '.vrml', '.step', '.stp', '.iges', '.igs',
  '.collada', '.blend'
];

const FILE_SIZE_CAP_MB = 50;

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface UploadedFile {
  file: File;
  status: UploadStatus;
  progress: number;
  fileId?: string;
  error?: string;
}

export default function UploadPage() {
  const router = useRouter();
  const { sessionId, isLoading: sessionLoading } = useSessionContext();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!ACCEPTED_FILE_TYPES.includes(extension)) {
      return `Invalid file type. Supported: ${ACCEPTED_FILE_TYPES.join(', ')}`;
    }
    
    if (file.size > FILE_SIZE_CAP_MB * 1024 * 1024) {
      return `File too large. Maximum size: ${FILE_SIZE_CAP_MB}MB`;
    }
    
    return null;
  };

  const uploadFile = async (file: File) => {
    const uploadEntry: UploadedFile = {
      file,
      status: 'uploading',
      progress: 0,
    };
    
    setUploadedFiles(prev => [...prev, uploadEntry]);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Simulate progress (real progress would require XHR)
      const progressInterval = setInterval(() => {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.file.name === file.name && f.status === 'uploading'
              ? { ...f, progress: Math.min(f.progress + 10, 90) }
              : f
          )
        );
      }, 200);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.file.name === file.name
              ? { ...f, status: 'success', progress: 100, fileId: data.fileId }
              : f
          )
        );
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      setUploadedFiles(prev => 
        prev.map(f => 
          f.file.name === file.name
            ? { ...f, status: 'error', progress: 0, error: error instanceof Error ? error.message : 'Upload failed' }
            : f
        )
      );
    }
  };

  const handleFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        setUploadedFiles(prev => [...prev, {
          file,
          status: 'error',
          progress: 0,
          error,
        }]);
      } else {
        uploadFile(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragError(null);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragError(null);
    
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(f => f.file.name !== fileName));
  };

  const retryUpload = (file: File) => {
    setUploadedFiles(prev => prev.filter(f => f.file.name !== file.name));
    uploadFile(file);
  };

  const successfulUploads = uploadedFiles.filter(f => f.status === 'success');
  const hasSuccessfulUploads = successfulUploads.length > 0;
  const isUploading = uploadedFiles.some(f => f.status === 'uploading');

  const goToCart = () => {
    router.push('/cart');
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative z-50">
        <div className="max-w-screen-2xl mx-auto">
          <Header />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Upload Your 3D Models</h1>
          <p className="text-muted-foreground">
            Drop your files and we&apos;ll help you bring them to life.
          </p>
        </div>

        {/* Session Debug Info - Development Only */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg text-xs font-mono">
            <span className="text-muted-foreground">Session ID: </span>
            <span className="text-foreground">{sessionId || 'Loading...'}</span>
          </div>
        )}

        {/* Upload Zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : 'border-border hover:border-primary/50 hover:bg-muted/30'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPTED_FILE_TYPES.join(',')}
            className="hidden"
            onChange={handleFileSelect}
          />
          
          <div className="flex flex-col items-center gap-4">
            <div className={`p-4 rounded-full transition-colors ${isDragging ? 'bg-primary/10' : 'bg-muted'}`}>
              <Upload className={`w-8 h-8 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            
            {isDragging ? (
              <p className="text-lg font-medium text-primary">Drop files here...</p>
            ) : (
              <>
                <p className="text-lg">
                  <span className="font-medium text-primary">Click to upload</span>
                  <span className="text-muted-foreground"> or drag and drop</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports: STL, OBJ, 3MF, STEP, and more • Max {FILE_SIZE_CAP_MB}MB per file
                </p>
              </>
            )}
            
            {dragError && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {dragError}
              </p>
            )}
          </div>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="mt-8 space-y-3">
            <h3 className="font-semibold text-lg">Uploaded Files</h3>
            
            {uploadedFiles.map((uploadedFile) => (
              <div
                key={uploadedFile.file.name}
                className={`p-4 rounded-lg border transition-colors ${
                  uploadedFile.status === 'error'
                    ? 'border-destructive/50 bg-destructive/5'
                    : uploadedFile.status === 'success'
                    ? 'border-green-500/50 bg-green-500/5'
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`p-2 rounded-lg ${
                      uploadedFile.status === 'error' ? 'bg-destructive/10' :
                      uploadedFile.status === 'success' ? 'bg-green-500/10' :
                      'bg-muted'
                    }`}>
                      {uploadedFile.status === 'uploading' ? (
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      ) : uploadedFile.status === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : uploadedFile.status === 'error' ? (
                        <AlertCircle className="w-5 h-5 text-destructive" />
                      ) : (
                        <FileBox className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{uploadedFile.file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedFile.file.size / (1024 * 1024)).toFixed(2)} MB
                        {uploadedFile.fileId && (
                          <span className="ml-2 font-mono text-xs">
                            ID: {uploadedFile.fileId.substring(0, 8)}...
                          </span>
                        )}
                      </p>
                      {uploadedFile.error && (
                        <p className="text-sm text-destructive mt-1">{uploadedFile.error}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {uploadedFile.status === 'error' && (
                      <Button
                        variant="secondary"
                        size="medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          retryUpload(uploadedFile.file);
                        }}
                      >
                        Retry
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(uploadedFile.file.name);
                      }}
                      className="text-muted-foreground hover:text-destructive !p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Progress Bar */}
                {uploadedFile.status === 'uploading' && (
                  <div className="mt-3">
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300 ease-out"
                        style={{ width: `${uploadedFile.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      {uploadedFile.progress}%
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {hasSuccessfulUploads && (
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="large"
              onClick={goToCart}
              disabled={isUploading}
              className="min-w-[200px]"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  View Cart ({successfulUploads.length} item{successfulUploads.length !== 1 ? 's' : ''})
                </>
              )}
            </Button>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 p-6 bg-muted/30 rounded-xl">
          <h3 className="font-semibold mb-4">How it works</h3>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">1</span>
              <span><strong className="text-foreground">Upload</strong> — Drop your 3D model files above</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">2</span>
              <span><strong className="text-foreground">Process</strong> — We analyze dimensions and calculate pricing</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">3</span>
              <span><strong className="text-foreground">Configure</strong> — Choose colors, quantity, and options in cart</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">4</span>
              <span><strong className="text-foreground">Order</strong> — Checkout and we&apos;ll print your models</span>
            </li>
          </ol>
        </div>
      </div>
    </main>
  );
}

