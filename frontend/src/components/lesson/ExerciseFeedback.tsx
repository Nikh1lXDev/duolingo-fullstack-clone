"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "framer-motion";

export type FeedbackState = "idle" | "correct" | "incorrect";

export interface ExerciseFeedbackProps {
  state: FeedbackState;
  onContinue: () => void;
  correctAnswer?: string;
  isSubmitting?: boolean;
}

export function ExerciseFeedback({ 
  state, 
  onContinue, 
  correctAnswer,
  isSubmitting = false 
}: ExerciseFeedbackProps) {
  const shouldReduceMotion = useReducedMotion();
  
  if (state === "idle") return null;

  const isCorrect = state === "correct";

  const variants = {
    hidden: { y: "100%" },
    visible: { y: 0 },
  };

  const reducedVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <AnimatePresence>
      <motion.div
        key="feedback-bar"
        variants={shouldReduceMotion ? reducedVariants : variants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 flex w-full flex-col border-t-2 bg-white px-4 py-8 sm:px-6 md:px-8",
          isCorrect ? "border-[#58cc02] bg-[#ddf4c5]" : "border-[#ff4b4b] bg-[#ffdfe0]"
        )}
        role="alert"
        aria-live="assertive"
      >
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div 
              className={cn(
                "flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white shadow-sm",
                isCorrect ? "text-[#58cc02]" : "text-[#ff4b4b]"
              )}
            >
              {isCorrect ? (
                <CheckCircle2 className="h-10 w-10" />
              ) : (
                <XCircle className="h-10 w-10" />
              )}
            </div>
            
            <div className="flex flex-col">
              <h2 className={cn("text-2xl font-bold", isCorrect ? "text-[#58cc02]" : "text-[#ff4b4b]")}>
                {isCorrect ? "Good job!" : "Incorrect"}
              </h2>
              {!isCorrect && correctAnswer && (
                <p className="mt-1 text-[#ff4b4b] font-bold">
                  Correct answer: <span className="font-normal">{correctAnswer}</span>
                </p>
              )}
            </div>
          </div>

          <Button 
            size="lg" 
            variant={isCorrect ? "primary" : "danger"} 
            className="w-full sm:w-auto sm:min-w-[150px]"
            onClick={onContinue}
            disabled={isSubmitting}
            autoFocus
          >
            CONTINUE
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
