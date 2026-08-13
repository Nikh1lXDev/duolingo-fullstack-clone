"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  color?: "brand" | "blue" | "yellow" | "purple";
}

export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value, max = 100, color = "brand", ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const colors = {
      brand: "bg-[#58cc02]",
      blue: "bg-[#1cb0f6]",
      yellow: "bg-[#ffc800]",
      purple: "bg-[#ce82ff]",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-full bg-[#e5e5e5]",
          className
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        {...props}
      >
        <motion.div
          className={cn("h-full rounded-full", colors[color])}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Subtle reflection overlay for tactile feel */}
          <div className="absolute top-0 h-1.5 w-full bg-white/20 rounded-full" />
        </motion.div>
      </div>
    );
  }
);
ProgressBar.displayName = "ProgressBar";
