import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "brand" | "blue" | "red" | "yellow" | "purple" | "default";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      brand: "bg-[#58cc02] text-white",
      blue: "bg-[#1cb0f6] text-white",
      red: "bg-[#ff4b4b] text-white",
      yellow: "bg-[#ffc800] text-white",
      purple: "bg-[#ce82ff] text-white",
      default: "bg-[#e5e5e5] text-[#777777]",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);
Badge.displayName = "Badge";
