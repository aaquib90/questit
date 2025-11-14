/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/15 text-primary shadow-[inset_0_0_0_1px_hsl(var(--ring)/0.6)]",
        secondary:
          "border border-border/50 bg-background/80 text-foreground shadow-[0_4px_14px_rgba(15,23,42,0.08)] dark:border-border/30 dark:bg-slate-900/70 dark:text-slate-100",
        destructive:
          "border-transparent bg-destructive/15 text-destructive shadow-[inset_0_0_0_1px_rgba(244,63,94,0.4)]",
        outline: "border border-border/50 bg-transparent text-foreground",
        subtle: "border-transparent bg-muted text-muted-foreground",
      },
      size: {
        xs: "px-2 py-0.5 text-[10px] tracking-[0.25em]",
        sm: "px-3 py-1 text-xs",
        md: "px-3.5 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "sm",
    },
  }
)

function Badge({
  className,
  variant,
  size,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant, size }), className)} {...props} />);
}

export { Badge, badgeVariants }
