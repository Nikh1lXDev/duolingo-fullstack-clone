import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  color?: "brand" | "muted" | "white";
}

export function LoadingSpinner({
  className,
  size = "md",
  color = "brand",
  ...props
}: LoadingSpinnerProps) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const colors = {
    brand: "text-[#58cc02]",
    muted: "text-[#afafaf]",
    white: "text-white",
  };

  return (
    <div
      role="status"
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      <Loader2 className={cn("animate-spin", sizes[size], colors[color])} />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
