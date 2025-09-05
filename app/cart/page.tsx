'use client';

import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { Upload, Package, Loader2, Info } from 'lucide-react';
import { Header } from '@/components/header';
import BackgroundMask from '@/components/BackgroundMask';
import { CartItem } from '@/components/CartItem';

// Generate or get session ID
const getSessionId = () => {
    if (typeof window === 'undefined') return '';

    let sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        localStorage.setItem('cart_session_id', sessionId);
    }
    return sessionId;
};

export default function CartPage() {
    const router = useRouter();
    const [sessionId, setSessionId] = useState('');
    const [uploading, setUploading] = useState(false);

    // Initialize session ID
    useEffect(() => {
        setSessionId(getSessionId());
    }, []);

    // Convex queries and mutations
    const cartItems = useQuery(api.cart.getCartItems,
        sessionId ? { sessionId, userId: undefined } : 'skip'
    );

    const cartSummary = useQuery(api.cart.getCartSummary,
        sessionId ? { sessionId, userId: undefined } : 'skip'
    );

    // Handle file upload
    const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);

        for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('sessionId', sessionId);

            try {
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                const result = await response.json();

                if (!response.ok) {
                    console.error('Upload failed:', result.error);
                    alert(`Failed to upload ${file.name}: ${result.error}`);
                } else {
                    console.log('File uploaded successfully:', result);
                }
            } catch (error) {
                console.error('Upload error:', error);
                alert(`Failed to upload ${file.name}`);
            }
        }

        setUploading(false);
        event.target.value = ''; // Reset input
    }, [sessionId]);

    // Loading state
    if (!sessionId || cartItems === undefined) {
        return (
            <main className="[&::-webkit-scrollbar]:hidden">
                <div className="max-w-5xl mx-auto">
                    <Header />
                    <div className="min-h-screen flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="[&::-webkit-scrollbar]:hidden">
            <div className="max-w-7xl mx-auto">
                <Header />

                <div className="container mx-auto px-4 py-8">
                    {/* Page Title */}
                    <div className="mb-8 text-center">
                        <h1 className="text-4xl font-bold mb-2">Your Cart</h1>
                        <p className="text-muted-foreground">
                            Review your items and proceed to checkout
                        </p>
                    </div>

                    {cartItems.length === 0 ? (
                        <Card className="p-12 text-center max-w-2xl mx-auto">
                            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
                            <p className="text-muted-foreground mb-6">
                                Upload 3D models to get started with instant quotes
                            </p>
                            <input
                                type="file"
                                multiple
                                accept=".stl,.obj,.ply,.off,.3mf,.gltf,.glb,.dae,.x3d,.wrl,.vrml,.step,.stp,.iges,.igs,.collada,.blend"
                                onChange={handleFileUpload}
                                disabled={uploading}
                                className="hidden"
                                id="empty-cart-upload"
                            />
                            <label htmlFor="empty-cart-upload">
                                <Button
                                    disabled={uploading}
                                    variant="primary-accent"
                                    size="medium"
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document.getElementById('empty-cart-upload')?.click();
                                    }}
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4 mr-2" />
                                            Upload Files
                                        </>
                                    )}
                                </Button>
                            </label>
                        </Card>
                                         ) : (
                         <div className="flex flex-col lg:flex-row gap-8">
                             {/* Mobile: Order Summary First, Desktop: Right Column */}
                             {cartSummary && cartSummary.itemCount > 0 && (
                                 <div className="lg:hidden">
                                     <Card className="p-4 sm:p-6">
                                         <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Order Summary</h2>
                                         
                                         {/* Price Breakdown */}
                                         <div className="space-y-2 sm:space-y-3 pb-3 sm:pb-4 border-b">
                                             <div className="flex justify-between text-xs sm:text-sm">
                                                 <span className="text-muted-foreground">Subtotal</span>
                                                 <span className="font-medium">${cartSummary.totalPrice.toFixed(2)}</span>
                                             </div>
                                             <div className="flex justify-between text-xs sm:text-sm">
                                                 <span className="text-muted-foreground">Shipping</span>
                                                 <span className="font-medium text-green-500">Free</span>
                                             </div>
                                         </div>
                                         
                                         {/* Total */}
                                         <div className="flex justify-between py-3 sm:py-4 text-base sm:text-lg font-bold">
                                             <span>Total</span>
                                             <span>${cartSummary.totalPrice.toFixed(2)}</span>
                                         </div>

                                         {/* Action Buttons */}
                                         <div className="space-y-2 sm:space-y-3">
                                             <Button
                                                 className="w-full"
                                                 variant="primary-accent"
                                                 size="medium"
                                                 disabled={cartSummary.readyCount === 0}
                                             >
                                                 {cartSummary.readyCount === 0
                                                     ? 'Processing Files...'
                                                     : '🛒 Proceed to Checkout'
                                                 }
                                             </Button>
                                             
                                             <Button
                                                 className="w-full"
                                                 variant="secondary"
                                                 size="medium"
                                             >
                                                 📋 Create Quote
                                             </Button>
                                         </div>
                                     </Card>
                                 </div>
                             )}

                             {/* Cart Items */}
                             <div className="flex-1">
                                 <div className="divide-y divide-border">
                                     {cartItems.map((item, index) => (
                                         <CartItem key={item._id} item={item} />
                                     ))}

                                    {/* Add More Files Button */}
                                    <div className="mt-6 pt-6 border-t border-border">
                                        <input
                                            type="file"
                                            multiple
                                            accept=".stl,.obj,.ply,.off,.3mf,.gltf,.glb,.dae,.x3d,.wrl,.vrml,.step,.stp,.iges,.igs,.collada,.blend"
                                            onChange={handleFileUpload}
                                            disabled={uploading}
                                            className="hidden"
                                            id="add-more-files"
                                        />
                                        <label htmlFor="add-more-files">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                className="w-full border-2 border-dashed border-border hover:border-muted-foreground"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    document.getElementById('add-more-files')?.click();
                                                }}
                                                disabled={uploading}
                                            >
                                                {uploading ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Uploading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="w-4 h-4 mr-2" />
                                                        Add More Files
                                                    </>
                                                )}
                                            </Button>
                                        </label>
                                    </div>
                                </div>
                            </div>

                                                         {/* Desktop: Right Column - Order Summary */}
                             {cartSummary && cartSummary.itemCount > 0 && (
                                 <div className="hidden lg:block w-96">
                                     <Card className="p-6 sticky top-4">
                                        <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                                        {/* Price Breakdown */}
                                        <div className="space-y-3 pb-4 border-b">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Subtotal</span>
                                                <span className="font-medium">${cartSummary.totalPrice.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Shipping</span>
                                                <span className="font-medium text-green-500">Free</span>
                                            </div>
                                        </div>

                                        {/* Total */}
                                        <div className="flex justify-between py-4 text-lg font-bold">
                                            <span>Total</span>
                                            <span>${cartSummary.totalPrice.toFixed(2)}</span>
                                        </div>

                                        {/* Production Time Estimate */}
                                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-6">
                                            <div className="flex items-start gap-2">
                                                <Info className="w-4 h-4 text-primary mt-0.5" />
                                                <div className="text-sm">
                                                    <div className="font-medium text-primary mb-1">
                                                        Estimated Production Time
                                                    </div>
                                                    <div className="text-foreground/80">
                                                        Based on our current order volume, your order will take approximately{' '}
                                                        <span className="font-semibold">17 days</span> to complete before shipping.
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-2">
                                                        This estimate includes production time only. Shipping time will vary based on your location and selected shipping method.
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="space-y-3">
                                            <Button
                                                className="w-full"
                                                variant="primary-accent"
                                                size="medium"
                                                disabled={cartSummary.readyCount === 0}
                                            >
                                                {cartSummary.readyCount === 0
                                                    ? 'Processing Files...'
                                                    : '🛒 Proceed to Checkout'
                                                }
                                            </Button>

                                            <Button
                                                className="w-full"
                                                variant="secondary"
                                                size="medium"
                                            >
                                                📋 Create Quote
                                            </Button>
                                        </div>

                                        {/* Order Options */}
                                        <div className="mt-6 pt-6 border-t">
                                            <h3 className="font-semibold mb-4">Order Options</h3>

                                            {/* Shipping Method */}
                                            <div className="mb-4">
                                                <label className="text-sm text-muted-foreground mb-2 block">
                                                    🚚 Shipping Method
                                                </label>
                                                <Select defaultValue="priority">
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="priority">Priority Shipping (3-4 Days)</SelectItem>
                                                        <SelectItem value="standard">Standard Shipping (5-7 Days)</SelectItem>
                                                        <SelectItem value="economy">Economy Shipping (7-10 Days)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Order Comments */}
                                            <div>
                                                <label className="text-sm text-muted-foreground mb-2 block">
                                                    💬 Order Comments
                                                </label>
                                                <Textarea
                                                    className="resize-none"
                                                    rows={3}
                                                    placeholder="Add any special instructions here..."
                                                />
                                            </div>
                                        </div>

                                        {/* Additional Options */}
                                        <div className="mt-6 space-y-3">
                                            <div className="flex items-start gap-3">
                                                <Checkbox id="multicolor" defaultChecked className="mt-0.5" />
                                                <label htmlFor="multicolor" className="cursor-pointer">
                                                    <div className="text-sm">
                                                        <div className="font-medium">Enable MultiColor Printing? (+$2.00)</div>
                                                        <div className="text-muted-foreground text-xs">
                                                            Requires a followup email with our design team, we will reach out with you before your order goes to print.
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <Checkbox id="priority" className="mt-0.5" />
                                                <label htmlFor="priority" className="cursor-pointer">
                                                    <div className="text-sm">
                                                        <div className="font-medium">Queue Priority? (+$15.00)</div>
                                                        <div className="text-muted-foreground text-xs">
                                                            Move your order once placed to the top of the queue. This normally speeds up order fulfillment time by 3-4 days.
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <Checkbox id="assistance" className="mt-0.5" />
                                                <label htmlFor="assistance" className="cursor-pointer">
                                                    <div className="text-sm">
                                                        <div className="font-medium">Print Assistance?</div>
                                                        <div className="text-muted-foreground text-xs">
                                                            Get help making sure that print presets and print options are setup correctly for the best print quality. We will reach out to you before your order goes to print.
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <Checkbox id="testmode" className="mt-0.5" />
                                                <label htmlFor="testmode" className="cursor-pointer">
                                                    <div className="text-sm">
                                                        <div className="font-medium">Test Mode</div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Terms */}
                                        <div className="mt-6 pt-6 border-t text-xs text-muted-foreground">
                                            By placing this order you agree to Mandarin 3D's{' '}
                                            <a href="#" className="text-primary hover:underline">Terms and Conditions</a>
                                        </div>
                                    </Card>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
