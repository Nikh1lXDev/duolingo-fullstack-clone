"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { AnimatedMascot } from "@/components/illustrations/AnimatedMascot";
import type { LessonTheme } from "@/lib/lessonThemes";
import { motion } from "framer-motion";

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
  theme?: LessonTheme;
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
  isSubmitting,
  theme,
}: LessonCompleteProps) {
  const accentColor = theme?.accent ?? "#58cc02";
  const accentBg = theme?.bg ?? "#ddf4c5";
  const accuracy = totalAttempts > 0 ? Math.round((totalExercises / totalAttempts) * 100) : 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 text-center bg-white max-w-2xl mx-auto">
      {/* Mascot celebrating */}
      <motion.div
        initial={{ scale: 0, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="mb-4"
      >
        <AnimatedMascot state="celebrating" size={140} />
      </motion.div>
      
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-4xl font-black mb-2"
        style={{ color: accentColor }}
      >
        Lesson Complete!
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-[#afafaf] font-bold mb-8"
      >
        Great work, keep it up! 🎉
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col gap-3 w-full max-w-sm mb-10"
      >
        <StatRow label="Score" value={`${score}%`} color={accentColor} bg={accentBg} />
        <StatRow label="Accuracy" value={`${accuracy}%`} color="#1cb0f6" bg="#d7f5ff" />
        <StatRow label="XP Earned" value={`+${xpEarned} XP`} color="#ff9600" bg="#fff3d9" />
        <StatRow label="Daily Goal" value={`${dailyProgress} / ${dailyGoal}`} color="#ce82ff" bg="#f0d9ff" />
        <StatRow label="Streak" value={`${streak} 🔥`} color="#ff9600" bg="#fff3d9" />
        <StatRow label="Hearts Remaining" value={`${hearts} ❤️`} color="#ff4b4b" bg="#ffdfe0" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col gap-4 w-full max-w-sm"
      >
        <Button
          size="lg"
          className="w-full font-extrabold tracking-widest"
          onClick={onContinue}
          disabled={isSubmitting}
          style={{ backgroundColor: accentColor, borderColor: theme?.accentDark ?? "#46a302" }}
        >
          {isSubmitting ? "SAVING..." : "CONTINUE"}
        </Button>
      </motion.div>
    </div>
  );
}

function StatRow({ label, value, color, bg }: { label: string; value: string; color: string; bg: string }) {
  return (
    <div
      className="flex justify-between items-center p-4 rounded-2xl border-2"
      style={{ backgroundColor: bg, borderColor: color + "40" }}
    >
      <span className="font-bold text-[#555]">{label}</span>
      <span className="font-black text-base" style={{ color }}>{value}</span>
    </div>
  );
}
