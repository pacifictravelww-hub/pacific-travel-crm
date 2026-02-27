import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    "overflow-hidden",
    // Shimmer pseudo-element
    "before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
    "hover:before:translate-x-full before:transition-transform before:duration-500",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600",
          "text-white shadow-lg shadow-blue-500/30",
          "hover:from-blue-400 hover:via-blue-500 hover:to-indigo-500",
          "hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5",
          "active:translate-y-0 active:shadow-md",
          "border border-blue-400/30",
        ].join(" "),
        destructive: [
          "bg-gradient-to-br from-red-500 via-red-600 to-rose-700",
          "text-white shadow-lg shadow-red-500/30",
          "hover:from-red-400 hover:via-red-500 hover:to-rose-600",
          "hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5",
          "active:translate-y-0",
          "border border-red-400/30",
        ].join(" "),
        outline: [
          "border border-slate-200 bg-white/80 backdrop-blur-sm text-slate-700",
          "shadow-sm shadow-slate-100",
          "hover:bg-white hover:border-blue-300 hover:text-blue-700",
          "hover:shadow-md hover:shadow-blue-100 hover:-translate-y-0.5",
          "active:translate-y-0",
        ].join(" "),
        secondary: [
          "bg-gradient-to-br from-slate-100 to-slate-200",
          "text-slate-700 shadow-sm",
          "hover:from-slate-200 hover:to-slate-300 hover:-translate-y-0.5",
          "hover:shadow-md border border-slate-200",
          "active:translate-y-0",
        ].join(" "),
        ghost: [
          "text-slate-600 hover:text-blue-700",
          "hover:bg-blue-50/80 hover:backdrop-blur-sm",
          "rounded-lg transition-all",
        ].join(" "),
        link: "text-blue-600 underline-offset-4 hover:underline font-medium",
        success: [
          "bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700",
          "text-white shadow-lg shadow-green-500/30",
          "hover:from-emerald-400 hover:to-teal-600",
          "hover:shadow-xl hover:shadow-green-500/40 hover:-translate-y-0.5",
          "active:translate-y-0",
          "border border-green-400/30",
        ].join(" "),
        glass: [
          "bg-white/20 backdrop-blur-md border border-white/30",
          "text-white shadow-lg",
          "hover:bg-white/30 hover:-translate-y-0.5",
          "active:translate-y-0",
        ].join(" "),
      },
      size: {
        default: "h-9 px-5 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-8 text-base",
        xl: "h-13 rounded-2xl px-10 text-base",
        icon: "h-9 w-9 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
