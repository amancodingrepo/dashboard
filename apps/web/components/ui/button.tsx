import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-custom-indigo focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /** Primary Action — Indigo button */
        default:
          "bg-custom-indigo text-white hover:bg-indigo-700 focus-visible:ring-indigo-700",
        /** Destructive Action — Red tone */
        destructive:
          "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-700",
        /** Outline — Subtle border, used in filters/settings */
        outline:
          "border border-custom-slate-200 bg-white text-custom-slate-800 hover:bg-custom-slate-100",
        /** Secondary — Muted grey button */
        secondary:
          "bg-custom-slate-100 text-custom-slate-800 hover:bg-custom-slate-200",
        /** Ghost — Transparent, used in nav or icon actions */
        ghost:
          "text-custom-slate-600 hover:bg-custom-slate-100 hover:text-custom-slate-800",
        /** Link — Accent text with underline */
        link: "text-custom-indigo underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 rounded-md text-sm",
        lg: "h-11 px-6 text-base rounded-lg",
        icon: "h-10 w-10",
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
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
