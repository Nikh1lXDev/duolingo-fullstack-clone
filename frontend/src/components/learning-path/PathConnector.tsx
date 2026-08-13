import * as React from "react";
import { cn } from "@/lib/utils";

export interface PathConnectorProps {
  direction: "left" | "right" | "straight";
  isActive: boolean;
  className?: string;
}

export function PathConnector({ direction, isActive, className }: PathConnectorProps) {
  // We use a responsive SVG viewBox so it scales well without horizontal overflow.
  // The path depends on whether we need to meander left, right, or go straight.
  
  const color = isActive ? "#58cc02" : "#e5e5e5";
  
  // Height must match the visual spacing between nodes (e.g. 64px)
  return (
    <div className={cn("flex w-full justify-center h-16 my-[-4px]", className)} aria-hidden="true">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 64"
        preserveAspectRatio="none"
        className="overflow-visible max-w-[80px]"
      >
        {direction === "straight" && (
          <line x1="50" y1="0" x2="50" y2="64" stroke={color} strokeWidth="12" strokeLinecap="round" />
        )}
        {direction === "left" && (
          <path
            d="M 50 0 C 50 32, 20 32, 20 64"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
          />
        )}
        {direction === "right" && (
          <path
            d="M 50 0 C 50 32, 80 32, 80 64"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
          />
        )}
      </svg>
    </div>
  );
}
