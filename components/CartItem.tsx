'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Loader2, Edit2, Minus, Plus, Sparkles, Zap, Wrench, Package } from 'lucide-react';

const showPrintEnhancements = false;

interface CartItemData {
    _id: Id<'cartFiles'>;
    filename: string;
    title?: string;
    status: 'uploading' | 'processing' | 'ready' | 'error';
    massGrams?: number;
    dimensions?: { x: number; y: number; z: number };
    calculatedPrice?: number;
    priceOverride?: number;
    errorMessage?: string;
    uploadthingFileUrl?: string; // Add this for 3D model viewing
}

interface CartItemProps {
    item: CartItemData;
}

export function CartItem({ item }: CartItemProps) {
    const [editingTitle, setEditingTitle] = useState(false);
    const [titleValue, setTitleValue] = useState(item.title || '');

    const removeFromCart = useMutation(api.cart.removeFromCart);
    const updateCartItem = useMutation(api.cart.updateCartItem);

    // Handle title editing
    const handleTitleEdit = () => {
        setEditingTitle(true);
        setTitleValue(item.title || '');
    };

    const handleTitleSave = async () => {
        await updateCartItem({ fileId: item._id, title: titleValue });
        setEditingTitle(false);
    };

    const handleRemoveItem = async () => {
        if (confirm('Are you sure you want to remove this item from your cart?')) {
            await removeFromCart({ fileId: item._id });
        }
    };

    // Format price
    const formatPrice = (price: number | undefined) => {
        if (price === undefined) return '--';
        return `$${price.toFixed(2)}`;
    };

    return (
        <div className="p-4 sm:p-6 gap-0">
            {/* Row 1: Title */}
            <div className="mb-1">
                {editingTitle ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <Input
                            type="text"
                            value={titleValue}
                            onChange={(e) => setTitleValue(e.target.value)}
                            placeholder="Enter title (optional)"
                            className="flex-1 h-8 text-sm"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <Button
                                size="medium"
                                onClick={handleTitleSave}
                                variant="primary-accent"
                                className="h-8 px-3 text-xs"
                            >
                                Save
                            </Button>
                            <Button
                                size="medium"
                                variant="secondary"
                                onClick={() => setEditingTitle(false)}
                                className="h-8 px-3 text-xs"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-xl font-semibold">
                            {item.title || item.filename}
                        </h3>
                        <button
                            onClick={handleTitleEdit}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Edit2 className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>

            {/* Row 2: ID (dev only) */}
            {process.env.NODE_ENV !== 'production' && (
                <div className="mb-3">
                    <p className="text-xs text-muted-foreground break-all">
                        {item.filename} · {String(item._id)}
                    </p>
                </div>
            )}

            {/* Row 3: 4-Column Layout (Desktop) / Stacked (Mobile) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-start">
                {/* Column 1: Image */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-1">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-secondary rounded-lg flex items-center justify-center">
                        <Package className="w-8 h-8 text-muted-foreground" />
                    </div>
                </div>

                {/* Column 2: Mass and Dimensions */}
                <div className="col-span-1">
                    <div className="space-y-1 sm:space-y-2">
                        <div>
                            <div className="text-xs sm:text-sm text-muted-foreground">File Mass</div>
                            <div className="font-semibold text-sm sm:text-base">
                                {item.massGrams !== undefined ? `${item.massGrams.toFixed(1)}g` : '--'}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs sm:text-sm text-muted-foreground">Part Dimensions</div>
                            <div className="text-xs sm:text-sm">
                                {item.dimensions ? (
                                    <>
                                        <div>X: {item.dimensions.x.toFixed(0)}mm</div>
                                        <div>Y: {item.dimensions.y.toFixed(0)}mm</div>
                                        <div>Z: {item.dimensions.z.toFixed(0)}mm</div>
                                    </>
                                ) : '--'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 3: Color and Quality Dropdowns */}
                <div className="col-span-1">
                    <div className="space-y-2 sm:space-y-3">
                        <div>
                            <div className="text-xs sm:text-sm text-muted-foreground mb-1">File Color</div>
                            <Select defaultValue="black-pla">
                                <SelectTrigger className="h-7 sm:h-8 w-full text-xs sm:text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="black-pla">Black PLA</SelectItem>
                                    <SelectItem value="white-pla">White PLA</SelectItem>
                                    <SelectItem value="gray-pla">Gray PLA</SelectItem>
                                    <SelectItem value="red-pla">Red PLA</SelectItem>
                                    <SelectItem value="blue-pla">Blue PLA</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <div className="text-xs sm:text-sm text-muted-foreground mb-1">Layer Height (Quality)</div>
                            <Select defaultValue="0.20mm">
                                <SelectTrigger className="h-7 sm:h-8 w-full text-xs sm:text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0.10mm">0.10mm - Fine</SelectItem>
                                    <SelectItem value="0.20mm">0.20mm - Default</SelectItem>
                                    <SelectItem value="0.30mm">0.30mm - Draft</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Column 4: Quantity and Price */}
                <div className="col-span-1">
                    <div className="space-y-2 sm:space-y-3">
                        <div className="text-right">
                            <div className="text-xs sm:text-sm text-muted-foreground mb-1">Part Quantity</div>
                            <div className="flex items-center justify-end">
                                <Button variant="secondary" size="medium" className="h-7 sm:h-8 w-7 sm:w-8 rounded-r-none px-1 sm:px-2" onClick={() => { }}>
                                    <Minus className="h-3 w-3" />
                                </Button>
                                <div className="h-7 sm:h-8 w-10 sm:w-12 border-y border-border flex items-center justify-center font-semibold bg-background text-xs sm:text-sm">
                                    1
                                </div>
                                <Button variant="secondary" size="medium" className="h-7 sm:h-8 w-7 sm:w-8 rounded-l-none px-1 sm:px-2" onClick={() => { }}>
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg sm:text-2xl font-bold">
                                {formatPrice(item.priceOverride || item.calculatedPrice)}
                            </div>
                            {item.status === 'processing' && (
                                <div className="text-xs text-muted-foreground">Calculating...</div>
                            )}
                            <button
                                onClick={handleRemoveItem}
                                className="text-xs sm:text-sm text-destructive hover:text-destructive/80 transition-colors mt-1 sm:mt-2"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Add-ons Row */}
            {showPrintEnhancements && (
                <div className="border-t pt-3 sm:pt-4 mt-3 sm:mt-4">
                    <h4 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3">Enhance Your Print</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                        {/* Premium Filament */}
                        <div className="border rounded-lg p-2 sm:p-3 bg-primary/5 border-primary/20">
                            <div className="flex items-start gap-2 mb-1 sm:mb-2">
                                <div className="w-6 sm:w-8 h-6 sm:h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Sparkles className="w-3 sm:w-4 h-3 sm:h-4 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h5 className="font-semibold text-xs sm:text-sm">Premium Filament</h5>
                                    <p className="text-xs text-muted-foreground">PETG • Better finish</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-1 sm:mt-2">
                                <span className="text-xs sm:text-sm font-semibold">+$25.00</span>
                                <Button variant="secondary" size="medium" className="h-6 sm:h-7 px-2 sm:px-3 text-xs">
                                    Add
                                </Button>
                            </div>
                        </div>

                        {/* Express Processing */}
                        <div className="border rounded-lg p-2 sm:p-3 bg-yellow-500/5 border-yellow-500/20">
                            <div className="flex items-start gap-2 mb-1 sm:mb-2">
                                <div className="w-6 sm:w-8 h-6 sm:h-8 rounded bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                                    <Zap className="w-3 sm:w-4 h-3 sm:h-4 text-yellow-600" />
                                </div>
                                <div className="flex-1">
                                    <h5 className="font-semibold text-xs sm:text-sm">Express Processing</h5>
                                    <p className="text-xs text-muted-foreground">48hr turnaround</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-1 sm:mt-2">
                                <span className="text-xs sm:text-sm font-semibold">+$15.00</span>
                                <Button variant="secondary" size="medium" className="h-6 sm:h-7 px-2 sm:px-3 text-xs">
                                    Add
                                </Button>
                            </div>
                        </div>

                        {/* Support Removal */}
                        <div className="border rounded-lg p-2 sm:p-3 bg-green-500/5 border-green-500/20">
                            <div className="flex items-start gap-2 mb-1 sm:mb-2">
                                <div className="w-6 sm:w-8 h-6 sm:h-8 rounded bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                    <Wrench className="w-3 sm:w-4 h-3 sm:h-4 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <h5 className="font-semibold text-xs sm:text-sm">Support Removal</h5>
                                    <p className="text-xs text-muted-foreground">Professional cleanup</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-1 sm:mt-2">
                                <span className="text-xs sm:text-sm font-semibold">+$5.00</span>
                                <Button variant="secondary" size="medium" className="h-6 sm:h-7 px-2 sm:px-3 text-xs">
                                    Add
                                </Button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* Status Bar */}
            {(item.status === 'processing' || item.status === 'uploading' || item.status === 'error') && (
                <div className="mt-4 pt-4 border-t">
                    {item.status === 'processing' || item.status === 'uploading' ? (
                        <div className="flex items-center gap-2 text-sm">
                            <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />
                            <span className="text-yellow-500">Processing file...</span>
                        </div>
                    ) : item.status === 'error' && item.errorMessage ? (
                        <div className="flex items-start gap-2 text-sm text-red-400">
                            <AlertCircle className="w-4 h-4 mt-0.5" />
                            <span>{item.errorMessage}</span>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}
