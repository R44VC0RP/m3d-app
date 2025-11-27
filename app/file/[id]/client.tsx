'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Loader2, ShoppingCart, Save, AlertCircle, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { PrintColor } from '@/lib/colors';
import { UploadedFile, CartItem } from '@/db/schema';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

// Dynamically import ModelViewer
const ModelViewer = dynamic(() => import('@/components/ModelViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted/20">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  ),
});

interface FileDetailClientProps {
  file: UploadedFile;
  initialCartItem: CartItem | null;
  colors: PrintColor[];
}

export default function FileDetailClient({ file, initialCartItem, colors }: FileDetailClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [quantity, setQuantity] = useState(initialCartItem?.quantity ?? 1);
  const [selectedColorId, setSelectedColorId] = useState(initialCartItem?.color ?? colors[0]?.id ?? 'black-pla');
  
  // Calculated derived state
  const selectedColor = colors.find(c => c.id === selectedColorId);
  const material = selectedColor?.material || 'PLA';
  
  const basePrice = file.massGrams ? (file.massGrams * 0.05 + 1) : 0;
  const priceModifier = selectedColor?.priceModifier || 1.0;
  const unitPrice = basePrice * priceModifier;
  const totalPrice = unitPrice * quantity;

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // If we have an initialCartItem, we want to UPDATE it.
      if (initialCartItem) {
         const response = await fetch('/api/cart', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: initialCartItem.id,
            quantity,
            color: selectedColorId,
            material,
          }),
        });
        if (!response.ok) throw new Error('Failed to update cart');
      } else {
        // If no cart item, we want to CREATE one.
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileId: file.id,
            quantity,
            color: selectedColorId,
            material,
          }),
        });
        if (!response.ok) throw new Error('Failed to add to cart');
      }

      router.push('/cart');
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="max-w-screen-2xl mx-auto w-full">
        <Header />
      </div>

      <div className="flex-grow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          
          {/* Back Link */}
          <div className="mb-8">
            <Link href="/cart" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Cart
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Model Viewer */}
            <div className="lg:col-span-7 space-y-6">
              <div className="aspect-square w-full bg-muted/10 rounded-2xl border border-border overflow-hidden relative shadow-sm">
                <ModelViewer 
                    modelUrl={file.uploadthingUrl} 
                    filename={file.fileName}
                    className="w-full h-full"
                    enableControls={true}
                    cameraZoom={80} // Zoomed in more as requested
                  />
                  {/* Status Overlays */}
                  {file.status === 'processing' && (
                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <span className="font-medium text-lg text-foreground">Processing Model...</span>
                      </div>
                    </div>
                  )}
                  {file.status === 'error' && (
                    <div className="absolute inset-0 bg-destructive/10 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="flex flex-col items-center gap-3 text-destructive">
                        <AlertCircle className="w-12 h-12" />
                        <span className="font-medium text-lg">Processing Error</span>
                      </div>
                    </div>
                  )}
              </div>
              
              {/* File Metadata Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-white border border-[#d1d1d1] shadow-[inset_0_-3px_4px_0_rgba(0,0,0,0.04),0_4px_4px_0_rgba(0,0,0,0.02)] rounded-[12px] corner-squircle">
                  <span className="text-muted-foreground text-sm uppercase tracking-wider font-semibold block mb-2">Dimensions</span>
                  {file.dimensions ? (
                    <span className="font-mono text-2xl font-medium tracking-tight">
                      {Math.round(file.dimensions.x)} × {Math.round(file.dimensions.y)} × {Math.round(file.dimensions.z)} <span className="text-base text-muted-foreground">mm</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic">Calculating...</span>
                  )}
                </div>
                <div className="p-6 bg-white border border-[#d1d1d1] shadow-[inset_0_-3px_4px_0_rgba(0,0,0,0.04),0_4px_4px_0_rgba(0,0,0,0.02)] rounded-[12px] corner-squircle">
                  <span className="text-muted-foreground text-sm uppercase tracking-wider font-semibold block mb-2">Mass</span>
                  {file.massGrams ? (
                    <span className="font-mono text-2xl font-medium tracking-tight">
                      {file.massGrams.toFixed(2)} <span className="text-base text-muted-foreground">g</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic">Calculating...</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Details & Form */}
            <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-24">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold break-words leading-tight tracking-tight mb-3 text-foreground">
                  {file.fileName}
                </h1>
                <div className="flex items-center gap-3 text-muted-foreground text-sm font-medium">
                  <span className="bg-muted px-2.5 py-1 rounded-md font-mono text-xs text-foreground/70 border border-border/50">
                    ID: {file.id.substring(0, 8)}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span>{(file.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                {file.errorMessage && (
                  <div className="mt-6 p-4 bg-destructive/10 text-destructive rounded-lg text-sm font-medium border border-destructive/20 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p>{file.errorMessage}</p>
                  </div>
                )}
              </div>

              <Separator className="my-8" />

              <div className="space-y-8">
                
                {/* Color Selection */}
                <div className="space-y-4">
                  <label className="text-base font-semibold flex justify-between">
                    Material & Color
                    <span className="text-xs font-normal text-muted-foreground self-center bg-muted/50 px-2 py-0.5 rounded">
                      {material}
                    </span>
                  </label>
                  <Select 
                    value={selectedColorId} 
                    onValueChange={setSelectedColorId}
                  >
                    <SelectTrigger className="w-full h-14 text-base px-4 rounded-xl border-input/50 hover:border-primary/50 transition-colors bg-card shadow-sm">
                      <SelectValue placeholder="Select a color" />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map((color) => (
                        <SelectItem key={color.id} value={color.id} className="py-3">
                          <div className="flex items-center justify-between w-full gap-4">
                            <span className="font-medium">{color.name}</span>
                            {color.priceModifier > 1 && (
                               <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                                 +{( (color.priceModifier - 1) * 100 ).toFixed(0)}%
                               </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {material === 'PLA' && 'Standard PLA is perfect for display models, prototypes, and non-structural parts. Eco-friendly and biodegradable.'}
                    {material === 'PETG' && 'PETG offers higher durability, flexibility, and heat resistance. Ideal for functional parts and outdoor use.'}
                  </p>
                </div>

                {/* Quantity */}
                <div className="space-y-4">
                  <label className="text-base font-semibold">Quantity</label>
                  <div className="flex items-center">
                    <div className="flex items-center border rounded-xl overflow-hidden shadow-sm bg-card h-14">
                      <button 
                        className="h-full w-16 flex items-center justify-center hover:bg-muted transition-colors border-r disabled:opacity-50"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        <span className="text-xl font-medium">-</span>
                      </button>
                      <div className="h-full w-20 flex items-center justify-center font-semibold text-lg tabular-nums">
                        {quantity}
                      </div>
                      <button 
                        className="h-full w-16 flex items-center justify-center hover:bg-muted transition-colors border-l disabled:opacity-50"
                        onClick={() => setQuantity(Math.min(100, quantity + 1))}
                        disabled={quantity >= 100}
                      >
                        <span className="text-xl font-medium">+</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Price Calculation */}
                <div className="bg-muted/30 p-8 rounded-2xl border border-border/50 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Unit Price</span>
                    <span className="font-mono">${unitPrice.toFixed(2)}</span>
                  </div>
                  <Separator className="bg-border/50" />
                  <div className="flex justify-between items-baseline pt-2">
                    <span className="font-bold text-lg">Total</span>
                    <span className="text-4xl font-bold tracking-tight text-primary">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Actions */}
                {error && (
                  <div className="text-sm text-destructive flex items-center gap-2 bg-destructive/10 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
                
                <Button 
                  className="w-full h-14 text-lg font-bold rounded-xl" 
                  variant="primary"
                  size="large"
                  onClick={handleSave}
                  disabled={isSubmitting || file.status === 'processing' || file.status === 'error'}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {initialCartItem ? <Save className="w-5 h-5 mr-2" /> : <ShoppingCart className="w-5 h-5 mr-2" />}
                      {initialCartItem ? 'Update Cart' : 'Add to Cart'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <Footer />
    </main>
  );
}
