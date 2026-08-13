"use client";

import * as React from "react";
import { X, Heart } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export interface LessonHeaderProps {
  progress: number;
  hearts: number | null;
}

export function LessonHeader({ progress, hearts }: LessonHeaderProps) {
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
        
        <div className="mx-4 flex-1">
          <ProgressBar value={progress} max={100} color="brand" className="h-4" />
        </div>

        <div className="flex items-center gap-2 text-[#ff4b4b] font-bold">
          <Heart className="h-6 w-6 fill-current" />
          <span>{hearts !== null ? hearts : "..."}</span>
        </div>
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
            <Button size="lg" variant="danger" className="w-full" onClick={() => router.push("/")}>
              QUIT
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
