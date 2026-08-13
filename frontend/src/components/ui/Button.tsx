"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "super";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-xl font-bold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none";

    const variants = {
      primary:
        "bg-[#58cc02] text-white border-b-4 border-[#46a302] hover:bg-[#89e219] hover:border-[#58cc02] active:border-b-0 active:translate-y-1",
      secondary:
        "bg-white text-[#1cb0f6] border-2 border-b-4 border-[#e5e5e5] hover:bg-[#f7f7f7] hover:border-[#1cb0f6] active:border-b-2 active:translate-y-[2px]",
      outline:
        "bg-transparent text-[#afafaf] border-2 border-b-4 border-[#e5e5e5] hover:bg-[#f7f7f7] active:border-b-2 active:translate-y-[2px]",
      ghost:
        "bg-transparent text-[#777777] hover:bg-[#f7f7f7] border-2 border-transparent active:bg-[#e5e5e5]",
      danger:
        "bg-[#ff4b4b] text-white border-b-4 border-[#ea2b2b] hover:bg-[#ff7b7b] hover:border-[#ff4b4b] active:border-b-0 active:translate-y-1",
      super:
        "bg-[#1cb0f6] text-white border-b-4 border-[#1899d6] hover:bg-[#4dd0ff] hover:border-[#1cb0f6] active:border-b-0 active:translate-y-1",
    };

    const sizes = {
      sm: "h-10 px-4 text-sm",
      md: "h-12 px-6 text-base",
      lg: "h-14 px-8 text-lg",
      icon: "h-12 w-12",
    };

    const disabledStyles =
      "bg-[#e5e5e5] text-[#afafaf] border-b-4 border-[#cecece] active:translate-y-0 active:border-b-4";

    const isInteractive = !disabled && !isLoading;

    return (
      <motion.button
        ref={ref}
        whileTap={isInteractive ? { scale: 0.98 } : {}}
        className={cn(
          baseStyles,
          disabled || isLoading ? disabledStyles : variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : null}
        {children as React.ReactNode}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
