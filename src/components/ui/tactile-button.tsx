"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center whitespace-nowrap rounded-3xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        accent: "bg-accent text-accent-foreground shadow-md hover:bg-accent/90",
        outline: "border-2 border-primary/20 bg-transparent text-primary hover:bg-primary/5",
        ghost: "hover:bg-primary/5 text-primary",
      },
      size: {
        default: "h-14 px-8 py-2 text-base",
        sm: "h-10 px-4 py-2 text-sm",
        lg: "h-16 px-10 py-3 text-lg",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag">,
    VariantProps<typeof buttonVariants> {}

const TactileButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <motion.button
        whileTap={{ scale: 0.98 }}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
TactileButton.displayName = "TactileButton";

export { TactileButton, buttonVariants };
