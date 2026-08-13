import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import { Button } from "./Button";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  className,
  title = "Something went wrong",
  message = "We couldn't load this content right now.",
  onRetry,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-4 rounded-2xl border-2 border-[#e5e5e5] p-8 text-center",
        className
      )}
      {...props}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ff4b4b]/10 text-[#ff4b4b]">
        <AlertCircle className="h-8 w-8" />
      </div>
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-[#3c3c3c]">{title}</h3>
        <p className="text-[#777777]">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="mt-4">
          Try Again
        </Button>
      )}
    </div>
  );
}
