"use client";

import * as React from "react";
import { X, Heart } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export interface LessonHeaderProps {
  progress: number;
  hearts: number | null;
  accentColor?: string; // Theme accent color
}

export function LessonHeader({ progress, hearts, accentColor = "#58cc02" }: LessonHeaderProps) {
  const router = useRouter();
  const [showExitConfirm, setShowExitConfirm] = React.useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex w-full items-center justify-between bg-white px-4 py-4 sm:px-6 shadow-sm">
        <IconButton 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowExitConfirm(true)}
          aria-label="Exit lesson"
        >
          <X className="h-6 w-6 text-[#afafaf]" />
        </IconButton>
        
        {/* Themed progress bar */}
        <div className="mx-4 flex-1 h-4 bg-[#f0f0f0] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${Math.max(0, Math.min(100, progress))}%`,
              backgroundColor: accentColor,
            }}
          />
        </div>

        {hearts !== null ? (
          <div className="flex items-center gap-2 text-[#ff4b4b] font-bold">
            <Heart className="h-6 w-6 fill-current" />
            <span>{hearts}</span>
          </div>
        ) : (
          // Placement mode — no hearts display
          <div className="w-10" />
        )}
      </header>

      <Modal
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        title="Leave lesson?"
      >
        <div className="flex flex-col gap-6">
          <p className="text-lg text-[#777777]">
            Your current lesson progress will be lost. Are you sure you want to quit?
          </p>
          <div className="flex w-full flex-col gap-2">
            <Button size="lg" className="w-full" onClick={() => setShowExitConfirm(false)}>
              STAY
            </Button>
            <Button size="lg" variant="danger" className="w-full" onClick={() => router.push("/learn")}>
              QUIT
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
