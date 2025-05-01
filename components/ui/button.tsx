import type React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "link" | "primary-accent"
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
        // Base styles
        "inline-flex items-center relative rounded-[0.5rem] cursor-pointer select-none",
        "transition-all duration-200 ease-in-out",
        "focus-visible:outline-[1px] focus-visible:outline-red-500 focus-visible:outline-offset-[0.0625rem]",
        "tap-highlight-transparent",
        "all-unset box-border",

        // Primary variant
        variant === "primary" && [
          "text-white bg-[#303030]",
          "enabled:hover:bg-[#1a1a1a] enabled:active:bg-[#1a1a1a]",
          "enabled:shadow-[0_-0.0625rem_0_0.0625rem_rgba(0,0,0,0.8)_inset,0_0_0_0.0625rem_rgba(48,48,48,1)_inset,0_0.03125rem_0_0.09375rem_rgba(255,255,255,0.25)_inset]",
          "enabled:active:shadow-[0_0.1875rem_0_0_rgb(0,0,0)_inset]",
          "enabled:bg-gradient-to-b enabled:from-[rgba(48,48,48,0)_63.53%] enabled:to-[rgba(255,255,255,0.15)_100%]",
          "disabled:bg-[rgba(0,0,0,0.17)] disabled:text-white/90 disabled:shadow-none",
        ],

        // Primary Accent variant
        variant === "primary-accent" && [
          "text-white bg-[#466F80]",
          "enabled:hover:bg-[#334E58] enabled:active:bg-[#334E58]",
          "enabled:shadow-[0_-0.0625rem_0_0.0625rem_rgba(0,0,0,0.8)_inset,0_0_0_0.0625rem_rgba(70,111,128,1)_inset,0_0.03125rem_0_0.09375rem_rgba(255,255,255,0.25)_inset]",
          "enabled:active:shadow-[0_0.1875rem_0_0_rgb(51,78,88)_inset]",
          "enabled:bg-gradient-to-b enabled:from-[rgba(70,111,128,0)_63.53%] enabled:to-[rgba(255,255,255,0.15)_100%]",
          "disabled:bg-[rgba(70,111,128,0.17)] disabled:text-white/90 disabled:shadow-none",
        ],

        // Secondary variant
        variant === "secondary" && [
          "text-[#303030] bg-[#e3e3e3]",
          "enabled:hover:bg-[#fafafa] enabled:active:bg-[#f7f7f7]",
          "enabled:shadow-none",
          "disabled:bg-[rgba(0,0,0,0.05)] disabled:text-[#b5b5b5]",
        ],

        // Link variant
        variant === "link" && [
          "bg-transparent",
          "text-[#303030] hover:text-[#1a1a1a]",
          "shadow-none",
          "p-0 min-h-0 min-w-0",
          "disabled:bg-transparent disabled:text-[#b5b5b5]",
          "rounded-none",
          "hover:underline",
        ],

        // Size styles - only apply to primary and secondary variants
        variant !== "link" && size === "medium" && [
          "min-h-8 min-w-8 px-4 py-3",
          "md:min-h-7 md:min-w-7 md:px-3 md:py-1.5",
        ],

        // Text alignment
        textAlign === "center" && "justify-center text-center",

        // Font styles
        "text-sm font-semibold",
        "md:text-xs",

        // Disabled state
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:select-none",

        // Pressable animation - only apply to primary and secondary variants
        variant !== "link" && pressable && "enabled:active:not-disabled:[&>*]:md:translate-y-[0.0625rem]",

        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

