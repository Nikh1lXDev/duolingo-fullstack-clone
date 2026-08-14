"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, XCircle } from "lucide-react";
import type { LessonTheme } from "@/lib/lessonThemes";

export type FeedbackState = "idle" | "correct" | "incorrect";

export interface ExerciseFeedbackProps {
  state: FeedbackState;
  onContinue: () => void;
  correctAnswer?: string;
  isSubmitting?: boolean;
  theme?: LessonTheme;
}

export function ExerciseFeedback({ 
  state, 
  onContinue, 
  correctAnswer,
  isSubmitting = false,
  theme,
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

  // Use theme accent for correct, always red for incorrect
  const correctBg = theme ? theme.bg : "#ddf4c5";
  const correctBorder = theme ? theme.accent : "#58cc02";
  const correctText = theme ? theme.text : "#2d7a00";

  return (
    <AnimatePresence>
      <motion.div
        key="feedback-bar"
        variants={shouldReduceMotion ? reducedVariants : variants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 z-50 flex w-full flex-col border-t-2 bg-white px-4 py-8 sm:px-6 md:px-8"
        style={isCorrect ? {
          borderTopColor: correctBorder,
          backgroundColor: correctBg,
        } : {
          borderTopColor: "#ff4b4b",
          backgroundColor: "#ffdfe0",
        }}
        role="alert"
        aria-live="assertive"
      >
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
              style={{ color: isCorrect ? correctBorder : "#ff4b4b" }}
            >
              {isCorrect ? (
                <CheckCircle2 className="h-9 w-9" />
              ) : (
                <XCircle className="h-9 w-9" />
              )}
            </div>
            
            <div className="flex flex-col">
              <h2
                className="text-2xl font-bold"
                style={{ color: isCorrect ? correctText : "#c02020" }}
              >
                {isCorrect ? "Correct!" : "Incorrect"}
              </h2>
              {!isCorrect && correctAnswer && (
                <p className="mt-1 text-[#c02020] font-bold">
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
            style={isCorrect && theme ? {
              backgroundColor: theme.accent,
              borderColor: theme.accentDark,
            } : undefined}
            autoFocus
          >
            CONTINUE
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
