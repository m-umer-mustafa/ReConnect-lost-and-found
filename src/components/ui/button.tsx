import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-transparent text-sm font-medium text-slate-900 shadow-card ring-offset-background transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:text-slate-100 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-border bg-white/90 text-slate-800 hover:bg-slate-100 dark:bg-slate-900/90 dark:text-slate-100 dark:hover:bg-slate-800",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/85",
        ghost: "bg-transparent text-slate-700 hover:bg-accent hover:text-accent-foreground dark:text-slate-200 dark:hover:bg-slate-800",
        link: "h-auto border-0 bg-transparent p-0 shadow-none text-primary underline-offset-4 hover:underline",
        hero: "bg-primary text-primary-foreground hover:bg-primary/90",
        success: "bg-success text-success-foreground hover:bg-success/90",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90",
        glass: "border-border bg-white/70 text-slate-900 backdrop-blur-sm hover:bg-white dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-900",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-11 px-3 text-sm",
        lg: "h-12 px-8 text-base",
        icon: "h-11 w-11",
        xl: "h-11 px-6 text-sm sm:h-12 sm:px-10 sm:text-base",
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
