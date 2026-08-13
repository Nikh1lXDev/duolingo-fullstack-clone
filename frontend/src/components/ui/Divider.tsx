import * as React from "react";
import { cn } from "@/lib/utils";

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: "horizontal" | "vertical";
}

export function Divider({
  className,
  orientation = "horizontal",
  ...props
}: DividerProps) {
  return (
    <hr
      className={cn(
        "shrink-0 bg-[#e5e5e5] border-none",
        orientation === "horizontal" ? "h-0.5 w-full" : "h-full w-0.5",
        className
      )}
      role="separator"
      aria-orientation={orientation}
      {...props}
    />
  );
}
