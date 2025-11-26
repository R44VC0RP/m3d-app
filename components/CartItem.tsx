import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Minus, Plus, Link as LinkIcon, Copy, Check, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { PrintColor } from "@/lib/colors"
import { useState } from "react"
import dynamic from "next/dynamic"

// Dynamically import ModelViewer to avoid SSR issues with three.js
const ModelViewer = dynamic(() => import("@/components/ModelViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted/20">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  ),
})

export type FileStatus = "pending" | "processing" | "success" | "error"

export interface CartItemData {
  id: string
  fileUrl: string
  filename: string
  fileId: string
  status: FileStatus
  massGrams?: number | null
  dimensions?: {
    x: number
    y: number
    z: number
  } | null
  errorMessage?: string | null
  previewUrl?: string
  selectedColor: string
  layerHeight: string
  quantity: number
  basePrice: number
}

interface CartItemProps {
  item: CartItemData
  colors: PrintColor[]
  onUpdate: (id: string, updates: Partial<CartItemData>) => void
  onRemove: (id: string) => void
}

// Calculate base price from mass (simple pricing model: $0.05 per gram + $1 base)
function calculateBasePrice(massGrams: number | null | undefined): number {
  if (!massGrams) return 0
  return Number((massGrams * 0.05 + 1).toFixed(2))
}

export function CartItem({ item, colors, onUpdate, onRemove }: CartItemProps) {
  const [copied, setCopied] = useState(false)
  const [isEditingQuantity, setIsEditingQuantity] = useState(false)
  const [quantityInput, setQuantityInput] = useState(item.quantity.toString())
  
  // Calculate price based on quantity and mass
  const basePrice = item.basePrice || calculateBasePrice(item.massGrams)
  const totalPrice = (basePrice * item.quantity).toFixed(2)

  const handleCopyFileId = () => {
    navigator.clipboard.writeText(item.fileId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleQuantitySubmit = () => {
    const parsed = parseInt(quantityInput, 10)
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 100) {
      onUpdate(item.id, { quantity: parsed })
    } else {
      setQuantityInput(item.quantity.toString())
    }
    setIsEditingQuantity(false)
  }

  // Render status badge
  const renderStatusBadge = () => {
    switch (item.status) {
      case "processing":
      case "pending":
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 text-amber-600 rounded-md text-xs font-medium">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Processing...</span>
          </div>
        )
      case "error":
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-destructive/10 text-destructive rounded-md text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            <span>Error</span>
          </div>
        )
      case "success":
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 text-green-600 rounded-md text-xs font-medium">
            <CheckCircle2 className="w-3 h-3" />
            <span>Ready</span>
          </div>
        )
      default:
        return null
    }
  }

  const isProcessing = item.status === "processing" || item.status === "pending"
  const hasError = item.status === "error"

  return (
    <div className={`bg-card border rounded-lg p-3 mb-3 ${hasError ? 'border-destructive/50' : ''}`}>
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {/* Column 1: 3D Model Preview */}
        <div className="w-full sm:w-32 h-32 bg-muted/10 rounded-md flex items-center justify-center shrink-0 relative overflow-hidden border border-border/50">
          <ModelViewer 
            modelUrl={item.fileUrl}
            filename={item.filename}
            className="w-full h-full"
            enableControls={true}
          />
          {isProcessing && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
        </div>

        {/* Content Wrapper for Columns 2, 3, 4 */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          
          {/* Column 2: File Info */}
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-bold text-base truncate" title={item.filename}>{item.filename}</h3>
              <LinkIcon className="w-3.5 h-3.5 text-primary cursor-pointer hover:text-primary/80 shrink-0" />
            </div>
            
            {/* Status Badge */}
            <div>
              {renderStatusBadge()}
            </div>
            
            {/* Compact File ID */}
            <div 
                className="bg-muted/50 text-[10px] text-muted-foreground px-1.5 py-0.5 rounded inline-flex items-center gap-1.5 w-fit font-mono cursor-pointer hover:bg-muted transition-colors group"
                onClick={handleCopyFileId}
                title="Click to copy File ID"
            >
              <span>{item.fileId.substring(0, 12)}...</span>
              {copied ? (
                  <Check className="w-2.5 h-2.5 text-green-500" />
              ) : (
                  <Copy className="w-2.5 h-2.5 opacity-50 group-hover:opacity-100" />
              )}
            </div>

            {/* Error Message */}
            {hasError && item.errorMessage && (
              <div className="text-xs text-destructive bg-destructive/10 rounded p-2">
                {item.errorMessage}
              </div>
            )}

            {/* Mass and Dimensions (only show if available) */}
            {item.status === "success" && item.massGrams && item.dimensions ? (
              <div className="space-y-0.5 text-sm mt-1">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">Mass:</span>
                  <span className="font-medium text-xs">{item.massGrams.toFixed(2)}g</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs block mb-0.5">Dimensions:</span>
                  <div className="flex gap-2 text-muted-foreground text-xs font-mono">
                    <span>X:{Math.round(item.dimensions.x)}</span>
                    <span>Y:{Math.round(item.dimensions.y)}</span>
                    <span>Z:{Math.round(item.dimensions.z)}</span>
                  </div>
                </div>
              </div>
            ) : isProcessing ? (
              <div className="text-xs text-muted-foreground italic">
                Calculating dimensions and mass...
              </div>
            ) : null}
          </div>

          {/* Column 3: Options (Color / Layer Height) */}
          <div className="flex flex-col gap-2">
              {/* Color Select */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Color</label>
                <Select 
                  value={item.selectedColor} 
                  onValueChange={(value) => onUpdate(item.id, { selectedColor: value })}
                  disabled={hasError}
                >
                  <SelectTrigger className="w-full h-8 text-xs bg-card/50">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map((color) => (
                      <SelectItem key={color.id} value={color.id} className="text-xs">
                        {color.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Layer Height Select */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Quality</label>
                <Select 
                  value={item.layerHeight}
                  onValueChange={(value) => onUpdate(item.id, { layerHeight: value })}
                  disabled={hasError}
                >
                  <SelectTrigger className="w-full h-8 text-xs bg-card/50">
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.20" className="text-xs">0.20mm - Default</SelectItem>
                    <SelectItem value="0.16" className="text-xs">0.16mm - Fine</SelectItem>
                    <SelectItem value="0.12" className="text-xs">0.12mm - Extra Fine</SelectItem>
                    <SelectItem value="0.28" className="text-xs">0.28mm - Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
          </div>

          {/* Column 4: Quantity / Price / Remove */}
          <div className="flex flex-col justify-between items-end h-full gap-2">
             <div className="flex flex-col items-end gap-1 w-full">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Quantity</label>
                <div className="flex items-center gap-1 bg-card/50 rounded-md border border-input p-0.5">
                  <Button 
                    variant="secondary" 
                    size="medium"
                    className="!h-6 !w-6 !p-0 rounded-sm border-none shadow-none bg-transparent hover:bg-muted"
                    onClick={() => onUpdate(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                    disabled={hasError}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  
                  {isEditingQuantity ? (
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={quantityInput}
                      onChange={(e) => setQuantityInput(e.target.value)}
                      onBlur={handleQuantitySubmit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleQuantitySubmit()
                        if (e.key === 'Escape') {
                          setQuantityInput(item.quantity.toString())
                          setIsEditingQuantity(false)
                        }
                      }}
                      className="w-10 h-6 text-center font-medium text-sm bg-transparent border-none outline-none focus:ring-1 focus:ring-primary rounded [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      autoFocus
                      disabled={hasError}
                    />
                  ) : (
                    <div 
                      className={`flex items-center justify-center font-medium text-sm w-8 rounded transition-colors ${hasError ? 'opacity-50' : 'cursor-pointer hover:bg-muted'}`}
                      onClick={() => {
                        if (!hasError) {
                          setQuantityInput(item.quantity.toString())
                          setIsEditingQuantity(true)
                        }
                      }}
                      title={hasError ? "Cannot edit quantity" : "Click to edit quantity"}
                    >
                      {item.quantity}
                    </div>
                  )}

                  <Button 
                    variant="secondary" 
                    size="medium"
                    className="!h-6 !w-6 !p-0 rounded-sm border-none shadow-none bg-transparent hover:bg-muted"
                    onClick={() => onUpdate(item.id, { quantity: Math.min(100, item.quantity + 1) })}
                    disabled={hasError}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
             </div>
             
             <div className="flex flex-col items-end gap-1 mt-auto">
               {isProcessing ? (
                 <div className="text-lg font-bold text-muted-foreground">--</div>
               ) : hasError ? (
                 <div className="text-lg font-bold text-destructive">--</div>
               ) : (
                 <div className="text-lg font-bold">${totalPrice}</div>
               )}
               <button 
                  className="h-7 text-xs px-3 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors cursor-pointer"
                  onClick={() => onRemove(item.id)}
               >
                 Remove
               </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}
