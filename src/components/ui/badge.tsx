import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border border-transparent bg-destructive/30 text-destructive hover:bg-destructive/30",
        outline: "text-foreground",
        noentina:
          "border-[#6B6C33] bg-status-noentina/20 text-status-noentina border-status-noentina/30",
        najanona:
          "border-transparent bg-status-najanona/20 text-status-najanona border-status-najanona/30",
        nampindramina:
          "border-transparent bg-status-nampindramina/20 text-status-nampindramina border-status-nampindramina/30",
        responsable:
          "border-transparent bg-primary/10 text-primary border-primary/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
