'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRealtime } from '@upstash/realtime/client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CartItem, CartItemData, FileStatus } from '@/components/CartItem';
import { getAvailableColors, PrintColor } from '@/lib/colors';
import { useSessionContext } from '@/components/SessionProvider';
import type { RealtimeEvents } from '@/lib/realtime';
import { Loader2, ShoppingCart, Check, Copy, Plus, Upload, AlertCircle } from 'lucide-react';
import { useRef } from 'react';
import Link from 'next/link';
import { 
  useQueryStates,
  parseAsString, 
  parseAsBoolean,
} from 'nuqs';

// API response type
interface CartApiItem {
  id: string;
  quantity: number;
  material: string;
  color: string;
  infill: number;
  unitPrice: number | null;
  createdAt: string;
  fileId: string;
  fileName: string;
  fileSize: number;
  uploadthingUrl: string;
  status: FileStatus;
  massGrams: number | null;
  dimensions: { x: number; y: number; z: number } | null;
  errorMessage: string | null;
}

// Calculate base price from mass
function calculateBasePrice(massGrams: number | null | undefined): number {
  if (!massGrams) return 0;
  return Number((massGrams * 0.05 + 1).toFixed(2));
}

// Default quality value
const DEFAULT_QUALITY = '0.20';

function CartPageContent() {
  const { sessionId, isLoading: sessionLoading } = useSessionContext();
  const [colors, setColors] = useState<PrintColor[]>([]);
  const [items, setItems] = useState<CartItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quoteCopied, setQuoteCopied] = useState(false);
  
  // Upload dropzone state
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<'sending' | 'processing' | 'done'>('sending');
  const [uploadingFileName, setUploadingFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Checkout state
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Order Options in URL state
  const [orderOptions, setOrderOptions] = useQueryStates({
    comments: parseAsString.withDefault(''),
    multicolor: parseAsBoolean.withDefault(false),
    priority: parseAsBoolean.withDefault(false),
    assistance: parseAsBoolean.withDefault(false),
    testMode: parseAsBoolean.withDefault(false),
  });

  // Fetch cart items from API
  const fetchCartItems = useCallback(async () => {
    try {
      const response = await fetch('/api/cart');
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      const data = await response.json();
      
      // Transform API data to CartItemData format
      const cartItems: CartItemData[] = data.items.map((item: CartApiItem) => ({
        id: item.id,
        fileUrl: item.uploadthingUrl,
        filename: item.fileName,
        fileId: item.fileId,
        status: item.status,
        massGrams: item.massGrams,
        dimensions: item.dimensions,
        errorMessage: item.errorMessage,
        previewUrl: '/stl-file-icon.png',
        selectedColor: item.color,
        layerHeight: DEFAULT_QUALITY, // TODO: Add to cart item table if needed
        quantity: item.quantity,
        basePrice: calculateBasePrice(item.massGrams),
      }));
      
      setItems(cartItems);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  }, []);

  // Load colors and cart items
  useEffect(() => {
    async function loadData() {
      try {
        const availableColors = await getAvailableColors();
        setColors(availableColors);
        await fetchCartItems();
      } catch (error) {
        console.error('Failed to load data', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (!sessionLoading) {
      loadData();
    }
  }, [sessionLoading, fetchCartItems]);

  // Subscribe to realtime updates for file status changes
  // Using default channel - server emits with sessionId in payload for filtering
  useRealtime<RealtimeEvents>({
    enabled: !!sessionId,
    event: "file.statusUpdate",
    onData(data) {
      console.log('Realtime file status update received:', data);
      
      // Filter by sessionId - only process events for this session
      if (data.sessionId !== sessionId) {
        console.log('Ignoring event for different session:', data.sessionId);
        return;
      }
      
      console.log('Processing event for our session:', data.fileId);
      
      // Update the item in state with new status and data
      setItems(prevItems => 
        prevItems.map(item => {
          if (item.fileId === data.fileId) {
            console.log('Updating item:', item.fileId, 'to status:', data.status);
            return {
              ...item,
              status: data.status as FileStatus,
              massGrams: data.massGrams ?? item.massGrams,
              dimensions: data.dimensions ?? item.dimensions,
              errorMessage: data.errorMessage ?? item.errorMessage,
              basePrice: calculateBasePrice(data.massGrams ?? item.massGrams),
            };
          }
          return item;
        })
      );
    },
  });

  const handleUpdateItem = async (id: string, updates: Partial<CartItemData>) => {
    // Optimistically update local state
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    );

    // Persist changes to API
    try {
      const response = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          quantity: updates.quantity,
          color: updates.selectedColor,
          // material: updates.material, // Add if needed
        }),
      });

      if (!response.ok) {
        // Revert on error
        await fetchCartItems();
      }
    } catch (error) {
      console.error('Failed to update cart item:', error);
      await fetchCartItems();
    }
  };

  const handleRemoveItem = async (id: string) => {
    // Optimistically remove from local state
    setItems(prevItems => prevItems.filter(item => item.id !== id));

    // Delete from API
    try {
      const response = await fetch(`/api/cart?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        // Revert on error
        await fetchCartItems();
      }
    } catch (error) {
      console.error('Failed to remove cart item:', error);
      await fetchCartItems();
    }
  };

  // File upload handlers with progress tracking
  const handleUploadFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;
    
    setIsUploading(true);
    
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setUploadingFileName(file.name);
      setUploadProgress(0);
      setUploadStage('sending');
      
      try {
        // Use XMLHttpRequest for progress tracking
        const result = await new Promise<{ ok: boolean; data?: { error?: string } }>((resolve) => {
          const xhr = new XMLHttpRequest();
          const formData = new FormData();
          formData.append('file', file);
          
          // Track upload progress (sending to our server)
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              // First 60% is uploading to our server
              const percent = Math.round((event.loaded / event.total) * 60);
              setUploadProgress(percent);
            }
          };
          
          xhr.upload.onload = () => {
            // Upload complete, now server is processing
            setUploadStage('processing');
            setUploadProgress(70);
          };
          
          xhr.onload = () => {
            setUploadProgress(100);
            setUploadStage('done');
            const ok = xhr.status >= 200 && xhr.status < 300;
            let data;
            try {
              data = JSON.parse(xhr.responseText);
            } catch {
              data = {};
            }
            resolve({ ok, data });
          };
          
          xhr.onerror = () => {
            resolve({ ok: false, data: { error: 'Network error' } });
          };
          
          xhr.open('POST', '/api/upload');
          xhr.send(formData);
        });
        
        if (result.ok) {
          // Refresh cart to show new item
          await fetchCartItems();
        } else {
          console.error('Upload failed:', result.data?.error);
        }
      } catch (error) {
        console.error('Upload error:', error);
      }
    }
    
    setIsUploading(false);
    setUploadProgress(0);
    setUploadStage('sending');
    setUploadingFileName('');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUploadFiles(e.target.files);
    }
    e.target.value = '';
  };

  // Calculations - only include items that have been processed successfully
  const processedItems = items.filter(item => item.status === 'success');
  const subtotal = processedItems.reduce((sum, item) => sum + (item.basePrice * item.quantity), 0);
  
  const multicolorCost = orderOptions.multicolor ? 2.00 : 0;
  const priorityCost = orderOptions.priority ? 15.00 : 0;
  
  // Total before shipping (shipping calculated by Shopify at checkout)
  const total = subtotal + multicolorCost + priorityCost;

  // Check if any items are still processing
  const hasProcessingItems = items.some(item => item.status === 'processing' || item.status === 'pending');
  const hasErrorItems = items.some(item => item.status === 'error');

  // Handle checkout - creates Shopify draft order and redirects
  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comments: orderOptions.comments || undefined,
          multicolor: orderOptions.multicolor,
          priority: orderOptions.priority,
          assistance: orderOptions.assistance,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      // Redirect to Shopify checkout
      if (data.invoiceUrl) {
        window.location.href = data.invoiceUrl;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setCheckoutError(error instanceof Error ? error.message : 'Checkout failed');
      setIsCheckingOut(false);
    }
  };

  if (isLoading || sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-20 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <Header />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex-grow w-full">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Your Cart</h1>
            {hasProcessingItems && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-amber-500/10 text-amber-600 rounded-full">
                <Loader2 className="w-3 h-3 animate-spin" />
                Processing
              </span>
            )}
          </div>
          <p className="text-muted-foreground mt-1">Review your items and proceed to checkout</p>
        </div>

        {items.length === 0 ? (
          <div
            className={`text-center py-16 bg-card rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer ${
              isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".stl,.obj,.ply,.off,.3mf,.gltf,.glb,.dae,.x3d,.wrl,.vrml,.step,.stp,.iges,.igs,.collada,.blend"
              className="hidden"
              onChange={handleFileSelect}
            />
            
            {isUploading ? (
              <div className="flex flex-col items-center gap-4 px-8">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-lg font-medium">
                    {uploadStage === 'sending' && 'Uploading...'}
                    {uploadStage === 'processing' && 'Processing...'}
                    {uploadStage === 'done' && 'Done!'}
                  </p>
                  {uploadingFileName && (
                    <span className="text-sm text-muted-foreground truncate max-w-[300px]">
                      {uploadingFileName}
                    </span>
                  )}
                </div>
                <div className="w-full max-w-sm">
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300 ease-out" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>{uploadProgress}%</span>
                    <span>
                      {uploadStage === 'sending' && 'Sending to server'}
                      {uploadStage === 'processing' && 'Cloud processing'}
                      {uploadStage === 'done' && 'Complete'}
                    </span>
                  </div>
                </div>
              </div>
            ) : isDragging ? (
              <div className="flex flex-col items-center gap-4">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <p className="text-lg font-medium text-primary">Drop files here</p>
              </div>
            ) : (
              <>
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Drop your 3D model files here or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports: STL, OBJ, 3MF, STEP, and more
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Cart Items */}
            <div className="lg:col-span-8 space-y-4">
              {/* Items List */}
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItem 
                    key={item.id} 
                    item={item} 
                    colors={colors}
                    onUpdate={handleUpdateItem}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>

              {/* Add More Files Dropzone */}
              <div
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-border/50 hover:border-primary/50 hover:bg-muted/30'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".stl,.obj,.ply,.off,.3mf,.gltf,.glb,.dae,.x3d,.wrl,.vrml,.step,.stp,.iges,.igs,.collada,.blend"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-4 px-6 w-full">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-sm font-medium">
                        {uploadStage === 'sending' && 'Uploading...'}
                        {uploadStage === 'processing' && 'Processing...'}
                        {uploadStage === 'done' && 'Done!'}
                      </span>
                    </div>
                    {uploadingFileName && (
                      <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {uploadingFileName}
                      </span>
                    )}
                    <div className="w-full max-w-xs">
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300 ease-out" 
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                        <span>{uploadProgress}%</span>
                        <span>
                          {uploadStage === 'sending' && 'Sending to server'}
                          {uploadStage === 'processing' && 'Cloud processing'}
                          {uploadStage === 'done' && 'Complete'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : isDragging ? (
                  <div className="flex items-center justify-center gap-2 py-2">
                    <Upload className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Drop files here</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 py-2">
                    <Plus className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Add more files
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Order Summary & Options */}
            <div className="lg:col-span-4 space-y-6">
              {/* Order Summary */}
              <div className="bg-card border rounded-lg p-6 space-y-6">
                <h2 className="text-xl font-bold">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    {hasProcessingItems ? (
                      <span className="font-medium text-muted-foreground">Calculating...</span>
                    ) : (
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                     )}
                  </div>

                  {orderOptions.multicolor && (
                    <div className="flex justify-between animate-in fade-in slide-in-from-top-1">
                      <span className="text-muted-foreground">MultiColor Printing</span>
                      <span className="font-medium">$2.00</span>
                    </div>
                  )}
                  
                  {orderOptions.priority && (
                    <div className="flex justify-between animate-in fade-in slide-in-from-top-1">
                      <span className="text-muted-foreground">Queue Priority</span>
                      <span className="font-medium">$15.00</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="text-xs italic">Calculated at checkout</span>
                  </div>
                  
                  <div className="border-t pt-3 mt-3 flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    {hasProcessingItems ? (
                      <span className="text-2xl font-bold text-muted-foreground">--</span>
                    ) : (
                      <span className="text-2xl font-bold">${total.toFixed(2)}</span>
                    )}
                  </div>
                </div>

                {/* Production Time Estimate */}
                {(() => {
                  const baseProductionDays = 20;
                  const prioritySpeedup = 5;
                  const estimatedDays = orderOptions.priority 
                    ? baseProductionDays - prioritySpeedup 
                    : baseProductionDays;
                  const showPriorityUpsell = !orderOptions.priority && baseProductionDays > 14;
                  
                  return (
                    <div className="py-4 border-t border-b border-border/50">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </div>
                        <span className="font-semibold text-sm">Estimated Production Time</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Based on our current order volume, your order will take approximately{' '}
                        <span className={`font-medium ${orderOptions.priority ? 'text-primary' : 'text-foreground'}`}>
                          {estimatedDays} days
                        </span>
                        {orderOptions.priority && (
                          <span className="text-primary/80 text-xs ml-1">(priority)</span>
                        )}
                        {' '}to complete before shipping.
                        {showPriorityUpsell && (
                          <>
                            {' '}
                            <button
                              type="button"
                              onClick={() => setOrderOptions({ priority: true })}
                              className="inline text-primary hover:text-primary/80 underline underline-offset-2 decoration-primary/50 hover:decoration-primary font-medium transition-colors cursor-pointer"
                            >
                              Add Queue Priority for ${15} to speed up by {prioritySpeedup} days
                            </button>
                          </>
                        )}
                      </p>
                    </div>
                  );
                })()}

                {/* Checkout Error */}
                {checkoutError && (
                  <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm">
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-destructive">Checkout Error</p>
                      <p className="text-destructive/80">{checkoutError}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3 pt-2">
                  <Button 
                    className="w-full h-12 text-base font-semibold" 
                    size="large"
                    disabled={hasProcessingItems || hasErrorItems || items.length === 0 || isCheckingOut}
                    onClick={handleCheckout}
                  >
                    {isCheckingOut ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Checkout...
                      </>
                    ) : hasProcessingItems ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                        Proceed to Checkout
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="w-full h-12 text-base font-medium" 
                    size="large"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      setQuoteCopied(true);
                      setTimeout(() => setQuoteCopied(false), 2000);
                    }}
                  >
                    {quoteCopied ? (
                      <>
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        Quote URL Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Create Quote
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Order Options Section */}
              <div className="bg-card border rounded-lg p-6 space-y-6">
                <h2 className="text-xl font-bold">Order Options</h2>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Order Comments</label>
                  <Textarea 
                    placeholder="Add any special instructions here..." 
                    className="min-h-[100px] resize-y"
                    value={orderOptions.comments}
                    onChange={(e) => setOrderOptions({ comments: e.target.value || null })}
                  />
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="multicolor" 
                      checked={orderOptions.multicolor}
                      onCheckedChange={(checked) => setOrderOptions({ multicolor: checked as boolean })}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="multicolor"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Enable MultiColor Printing? <span className="text-primary font-bold">(+$2.00)</span>
                      </label>
                      {/* TODO: When checkout is completed with multicolor enabled, initiate callout email to design team */}
                      <p className="text-sm text-muted-foreground">
                        Requires a followup email with our design team, we will reach out with you before your order goes to print.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="priority" 
                      checked={orderOptions.priority}
                      onCheckedChange={(checked) => setOrderOptions({ priority: checked as boolean })}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="priority"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Queue Priority? <span className="text-primary font-bold">(+$15.00)</span>
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Move your order once placed to the top of the queue. This normally speeds up order fulfillment time by 3-4 days.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="assistance" 
                      checked={orderOptions.assistance}
                      onCheckedChange={(checked) => setOrderOptions({ assistance: checked as boolean })}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="assistance"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Print Assistance?
                      </label>
                      <p className="text-sm text-muted-foreground">
                        Get help making sure that print presets and print options are setup correctly for the best print quality. We will reach out to you before your order goes to print.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="testMode" 
                        checked={orderOptions.testMode}
                        onCheckedChange={(checked) => setOrderOptions({ testMode: checked as boolean })}
                      />
                      <label
                        htmlFor="testMode"
                        className="text-sm text-muted-foreground cursor-pointer"
                      >
                        Test Mode
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <CartPageContent />
    </Suspense>
  );
}
