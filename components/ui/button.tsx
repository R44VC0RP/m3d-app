import type React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "link"
  size?: "medium" | "large"
  textAlign?: "center" | "left"
  children: React.ReactNode
  className?: string
  pressable?: boolean
}

export function Button({
  variant = "primary",
  size = "medium",
  textAlign = "center",
  pressable = true,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={cn(
        // Base styles with squircle corners
        // Layout: 6px horizontal padding, 4px gap between elements
        "inline-flex items-center gap-[4px] relative rounded-[12px] corner-squircle cursor-pointer select-none",
        "transition-all duration-150 ease-in-out",
        "focus-visible:outline-2 focus-visible:outline-[#466F80] focus-visible:outline-offset-1",
        "tap-highlight-transparent",
        "box-border",

        // Primary variant (Teal #466F80)
        variant === "primary" && [
          "text-white bg-[#466F80]",
          // Combined shadow: inset top shadow + outer shadow
          "shadow-[inset_0_-3px_4px_0_rgba(0,0,0,0.04),0_4px_4px_0_rgba(0,0,0,0.02)]",
          "enabled:hover:bg-[#3a5d6b]",
          "enabled:active:bg-[#2e4b57]",
          "disabled:bg-[#466F80]/40 disabled:text-white/70 disabled:shadow-none",
        ],

        // Secondary variant (White with border)
        variant === "secondary" && [
          "text-[#444444] bg-white",
          "border border-[#d1d1d1]",
          // Combined shadow: inset top shadow + outer shadow
          "shadow-[inset_0_-3px_4px_0_rgba(0,0,0,0.04),0_4px_4px_0_rgba(0,0,0,0.02)]",
          "enabled:hover:bg-[#f9f9f9] enabled:hover:border-[#b8b8b8]",
          "enabled:active:bg-[#f0f0f0]",
          "disabled:bg-[#f5f5f5] disabled:text-[#999999] disabled:border-[#e0e0e0] disabled:shadow-none",
        ],

        // Destructive variant (Red/Danger)
        variant === "destructive" && [
          "text-white bg-[#E40000]",
          "border-[1.4px] border-transparent",
          // Default shadow
          "shadow-[inset_0_-3px_4px_0_rgba(0,0,0,0.06),0_4px_4px_0_rgba(0,0,0,0.04)]",
          // Hover: #C30000 background with adjusted shadow
          "enabled:hover:bg-[#C30000]",
          "enabled:hover:shadow-[inset_0_-3px_4px_0_rgba(0,0,0,0.06),0_4px_4px_0_rgba(0,0,0,0.06)]",
          // Pressed: #E40000 background with #940000 border
          "enabled:active:bg-[#E40000]",
          "enabled:active:border-[#940000]",
          "enabled:active:shadow-[inset_0_-3px_4px_0_rgba(0,0,0,0.06),0_4px_4px_0_rgba(0,0,0,0.02)]",
          // Disabled: #F17F7F background
          "disabled:bg-[#F17F7F] disabled:text-white disabled:shadow-[inset_0_-3px_4px_0_rgba(0,0,0,0.06),0_4px_4px_0_rgba(0,0,0,0.04)]",
        ],

        // Link variant
        variant === "link" && [
          "bg-transparent",
          "text-[#444444] hover:text-[#222222]",
          "shadow-none",
          "p-0 min-h-0 min-w-0",
          "disabled:bg-transparent disabled:text-[#999999]",
          "rounded-none",
          "hover:underline",
        ],

        // Size styles - only apply to non-link variants
        variant !== "link" && size === "medium" && [
          "h-[32px] px-3 py-1.5",
        ],
        variant !== "link" && size === "large" && [
          "h-[40px] px-4 py-2",
        ],

        // Text alignment
        textAlign === "center" && "justify-center text-center",
        textAlign === "left" && "justify-start text-left",

        // Font styles
        "text-[15px] font-medium tracking-[-0.01em] leading-normal",

        // Disabled state
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:select-none",

        // Pressable animation
        variant !== "link" && pressable && "enabled:active:scale-[0.98]",

        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

