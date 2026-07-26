import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-pill font-bold tracking-tight transition-all duration-150 ease-out active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100",
  {
    variants: {
      variant: {
        default: "bg-clay text-white hover:bg-primary-600",
        dark: "bg-ink text-white hover:bg-ink/90",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline: "border border-pebble bg-white text-ink hover:bg-pebble/20",
        ghost: "text-ink hover:bg-pebble/20",
        link: "text-ink underline-offset-4 hover:underline rounded-none",
        secondary: "bg-white text-ink border border-ink hover:bg-ink hover:text-white",
      },
      size: {
        default: "h-10 px-22 py-2 text-caption",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-8 text-caption",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
