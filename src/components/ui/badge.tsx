import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-gradient-gaming text-white shadow-glow",
        secondary: "border-transparent bg-secondary/90 text-secondary-foreground backdrop-blur-sm hover:bg-secondary",
        destructive: "border-transparent bg-destructive/90 text-destructive-foreground backdrop-blur-sm hover:bg-destructive animate-glow-pulse",
        outline: "text-foreground border-2 border-border hover:border-primary/50 hover:bg-primary/5",
        accent: "border-transparent bg-accent/20 text-accent border-accent/30 backdrop-blur-sm",
        gold: "border-transparent bg-gradient-gold text-white shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
