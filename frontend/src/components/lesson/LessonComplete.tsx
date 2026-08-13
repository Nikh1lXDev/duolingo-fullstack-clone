"use client";

import * as React from "react";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface LessonCompleteProps {
  score: number;
  totalAttempts: number;
  totalExercises: number;
  xpEarned: number;
  streak: number;
  hearts: number;
  dailyProgress: number;
  dailyGoal: number;
  onContinue: () => void;
  isSubmitting: boolean;
}

export function LessonComplete({ 
  score, 
  totalAttempts, 
  totalExercises, 
  xpEarned,
  streak,
  hearts,
  dailyProgress,
  dailyGoal,
  onContinue, 
  isSubmitting 
}: LessonCompleteProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 text-center bg-white max-w-2xl mx-auto">
      <Trophy className="h-40 w-40 text-[#ffc800] mb-8" />
      
      <h1 className="text-4xl font-bold text-[#3c3c3c] mb-4">Lesson Complete!</h1>
      
      <div className="flex flex-col gap-4 w-full max-w-sm mb-12">
        <div className="flex justify-between items-center bg-[#f7f7f7] p-4 rounded-2xl border-2 border-[#e5e5e5]">
          <span className="font-bold text-[#777777]">Total Score</span>
          <span className="font-bold text-[#58cc02]">{score}%</span>
        </div>
        <div className="flex justify-between items-center bg-[#f7f7f7] p-4 rounded-2xl border-2 border-[#e5e5e5]">
          <span className="font-bold text-[#777777]">Accuracy</span>
          <span className="font-bold text-[#1cb0f6]">
            {Math.round((totalExercises / totalAttempts) * 100)}%
          </span>
        </div>
        <div className="flex justify-between items-center bg-[#f7f7f7] p-4 rounded-2xl border-2 border-[#e5e5e5]">
          <span className="font-bold text-[#777777]">XP Earned</span>
          <span className="font-bold text-[#ff9600]">+{xpEarned} XP</span>
        </div>
        <div className="flex justify-between items-center bg-[#f7f7f7] p-4 rounded-2xl border-2 border-[#e5e5e5]">
          <span className="font-bold text-[#777777]">Daily Goal</span>
          <span className="font-bold text-[#ce82ff]">{dailyProgress} / {dailyGoal}</span>
        </div>
        <div className="flex justify-between items-center bg-[#f7f7f7] p-4 rounded-2xl border-2 border-[#e5e5e5]">
          <span className="font-bold text-[#777777]">Current Streak</span>
          <span className="font-bold text-[#ff9600]">{streak} 🔥</span>
        </div>
        <div className="flex justify-between items-center bg-[#f7f7f7] p-4 rounded-2xl border-2 border-[#e5e5e5]">
          <span className="font-bold text-[#777777]">Hearts Remaining</span>
          <span className="font-bold text-[#ff4b4b]">{hearts} ❤️</span>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full">
        <Button size="lg" className="w-full" onClick={onContinue} disabled={isSubmitting}>
          {isSubmitting ? "SAVING..." : "CONTINUE"}
        </Button>
        <Button size="lg" variant="ghost" className="w-full" onClick={() => window.location.reload()} disabled={isSubmitting}>
          REVIEW LESSON
        </Button>
      </div>
    </div>
  );
}
