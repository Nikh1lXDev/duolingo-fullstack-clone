import * as React from "react";
import { cn } from "@/lib/utils";
import { Bird } from "lucide-react";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  className,
  title,
  description,
  icon,
  action,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-6 rounded-2xl border-2 border-dashed border-[#e5e5e5] p-12 text-center",
        className
      )}
      {...props}
    >
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#f7f7f7] text-[#afafaf]">
        {icon || <Bird className="h-12 w-12" />}
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-[#3c3c3c]">{title}</h3>
        {description && (
          <p className="max-w-xs text-[#777777]">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
