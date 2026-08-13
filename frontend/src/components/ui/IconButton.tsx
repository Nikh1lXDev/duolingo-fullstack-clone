"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { motion, HTMLMotionProps } from "framer-motion";

export interface IconButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant = "secondary",
      size = "md",
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-2xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none";

    const variants = {
      primary:
        "bg-[#58cc02] text-white border-b-4 border-[#46a302] hover:bg-[#89e219] hover:border-[#58cc02] active:border-b-0 active:translate-y-1",
      secondary:
        "bg-white text-[#777777] border-2 border-b-4 border-[#e5e5e5] hover:bg-[#f7f7f7] hover:border-[#1cb0f6] hover:text-[#1cb0f6] active:border-b-2 active:translate-y-[2px]",
      ghost:
        "bg-transparent text-[#777777] hover:bg-[#f7f7f7] active:bg-[#e5e5e5]",
      danger:
        "bg-[#ff4b4b] text-white border-b-4 border-[#ea2b2b] hover:bg-[#ff7b7b] hover:border-[#ff4b4b] active:border-b-0 active:translate-y-1",
    };

    const sizes = {
      sm: "h-10 w-10",
      md: "h-12 w-12",
      lg: "h-14 w-14",
    };

    const disabledStyles =
      "bg-[#e5e5e5] text-[#afafaf] border-b-4 border-[#cecece] active:translate-y-0 active:border-b-4";

    const isInteractive = !disabled && !isLoading;

    return (
      <motion.button
        ref={ref}
        whileTap={isInteractive ? { scale: 0.95 } : {}}
        className={cn(
          baseStyles,
          disabled || isLoading ? disabledStyles : variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : children}
      </motion.button>
    );
  }
);
IconButton.displayName = "IconButton";
