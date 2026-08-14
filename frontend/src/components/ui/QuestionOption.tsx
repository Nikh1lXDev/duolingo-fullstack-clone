import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

export type QuestionOptionState = "default" | "selected" | "correct" | "incorrect" | "disabled";
export type QuestionOptionVariant = "dark" | "light";

export interface QuestionOptionProps {
  children: React.ReactNode;
  state?: QuestionOptionState;
  variant?: QuestionOptionVariant;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  index?: number; // For numbered options (e.g. 1, 2, 3)
  "aria-pressed"?: boolean;
}

/**
 * QuestionOption — guaranteed accessible contrast option button.
 * Works in both dark (onboarding) and light (lesson) contexts.
 * Never allows white-on-white or invisible states.
 */
export function QuestionOption({
  children,
  state = "default",
  variant = "light",
  onClick,
  disabled = false,
  className,
  index,
  ...props
}: QuestionOptionProps) {
  const isDisabled = disabled || state === "disabled";

  const baseClasses =
    "relative flex w-full min-h-[60px] items-center gap-3 rounded-2xl border-2 border-b-4 px-4 py-3 text-base font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 select-none";

  // Variant: light (white bg) — used in lessons (on white background)
  const lightVariantClasses: Record<QuestionOptionState, string> = {
    default:
      "bg-white border-[#e5e5e5] text-[#3c3c3c] hover:bg-[#f7f7f7] hover:border-[#c0c0c0] cursor-pointer active:translate-y-0.5 focus-visible:ring-[#1cb0f6]",
    selected:
      "bg-[#ddf4ff] border-[#1cb0f6] text-[#1b62a0] cursor-pointer focus-visible:ring-[#1cb0f6]",
    correct:
      "bg-[#d7ffb8] border-[#58cc02] text-[#2d7a00] cursor-default",
    incorrect:
      "bg-[#ffdfe0] border-[#ff4b4b] text-[#c02020] cursor-default",
    disabled:
      "bg-[#f7f7f7] border-[#e5e5e5] text-[#afafaf] cursor-not-allowed opacity-70",
  };

  // Variant: dark (dark bg) — used in onboarding (on #131f24 dark background)
  const darkVariantClasses: Record<QuestionOptionState, string> = {
    default:
      "bg-[#182830] border-[#2b3d47] text-white hover:bg-[#1e3340] hover:border-[#3a5568] cursor-pointer active:translate-y-0.5 focus-visible:ring-[#1cb0f6]",
    selected:
      "bg-[#1cb0f6]/15 border-[#1cb0f6] text-white cursor-pointer focus-visible:ring-[#1cb0f6]",
    correct:
      "bg-[#58cc02]/20 border-[#58cc02] text-[#7fff00] cursor-default",
    incorrect:
      "bg-[#ff4b4b]/20 border-[#ff4b4b] text-[#ff8080] cursor-default",
    disabled:
      "bg-[#131f24] border-[#1a2a33] text-[#5f7582] cursor-not-allowed opacity-60",
  };

  const variantClasses = variant === "dark" ? darkVariantClasses : lightVariantClasses;
  const stateClass = variantClasses[state];

  return (
    <button
      type="button"
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={cn(baseClasses, stateClass, className)}
      aria-pressed={state === "selected" || state === "correct"}
      aria-disabled={isDisabled}
      {...props}
    >
      {index !== undefined && (
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold",
            variant === "dark"
              ? "border-[#3a5568] text-[#afafaf]"
              : "border-[#e5e5e5] text-[#777777]",
            state === "selected" && "border-[#1cb0f6] text-[#1cb0f6]",
            state === "correct" && "border-[#58cc02] text-[#58cc02]",
            state === "incorrect" && "border-[#ff4b4b] text-[#ff4b4b]"
          )}
        >
          {index}
        </span>
      )}
      <span className="flex-1 text-left leading-snug">{children}</span>
      {state === "correct" && (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-[#58cc02]" aria-hidden />
      )}
      {state === "incorrect" && (
        <XCircle className="h-5 w-5 shrink-0 text-[#ff4b4b]" aria-hidden />
      )}
    </button>
  );
}
