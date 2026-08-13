"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

export interface StatPillProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  icon: React.ReactNode;
  value: number | string;
  label?: string;
  color?: "red" | "blue" | "yellow" | "brand";
  size?: "sm" | "md";
}

export const StatPill = React.forwardRef<HTMLDivElement, StatPillProps>(
  ({ className, icon, value, label, color = "brand", size = "md", ...props }, ref) => {
    const colors = {
      red: "text-[#ff4b4b] hover:bg-[#ff4b4b]/10",
      blue: "text-[#1cb0f6] hover:bg-[#1cb0f6]/10",
      yellow: "text-[#ffc800] hover:bg-[#ffc800]/10",
      brand: "text-[#58cc02] hover:bg-[#58cc02]/10",
    };

    const sizes = {
      sm: "h-10 px-3 gap-2 text-sm",
      md: "h-12 px-4 gap-3 text-base",
    };

    return (
      <motion.div
        ref={ref}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "inline-flex cursor-pointer items-center justify-center rounded-2xl font-bold transition-colors",
          colors[color],
          sizes[size],
          className
        )}
        {...props}
      >
        <span className="flex items-center justify-center shrink-0">
          {icon}
        </span>
        <span>{value}</span>
        {label && <span className="sr-only">{label}</span>}
      </motion.div>
    );
  }
);
StatPill.displayName = "StatPill";
