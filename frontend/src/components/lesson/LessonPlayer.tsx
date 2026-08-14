"use client";

import * as React from "react";
import { Lesson, Exercise } from "@/types/api";
import { api } from "@/lib/api";
import { LessonHeader } from "./LessonHeader";
import { ExerciseRenderer } from "./ExerciseRenderer";
import { ExerciseFeedback, FeedbackState } from "./ExerciseFeedback";
import { LessonComplete } from "./LessonComplete";
import { evaluateAnswer } from "@/lib/lesson/evaluateAnswer";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AnimatedMascot, MascotState } from "@/components/illustrations/AnimatedMascot";
import { getThemeForLesson } from "@/lib/lessonThemes";

export interface LessonPlayerProps {
  lesson: Lesson & { exercises: Exercise[] };
  isPlacement?: boolean;
  onPlacementComplete?: (score: number) => void;
}

export function LessonPlayer({ lesson, isPlacement, onPlacementComplete }: LessonPlayerProps) {
  const router = useRouter();

  // Lesson state
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [currentAnswer, setCurrentAnswer] = React.useState<unknown>(null);
  const [feedbackState, setFeedbackState] = React.useState<FeedbackState>("idle");
  const [isCompleted, setIsCompleted] = React.useState(false);
  const [correctCount, setCorrectCount] = React.useState(0);
  const [attempts, setAttempts] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [correctStreak, setCorrectStreak] = React.useState(0);

  // Gamification state
  const [hearts, setHearts] = React.useState<number | null>(isPlacement ? null : 5);
  const [gems, setGems] = React.useState<number | null>(isPlacement ? null : 0);
  const [showOutOfHearts, setShowOutOfHearts] = React.useState(false);
  const [finalStats, setFinalStats] = React.useState<Record<string, number> | null>(null);

  // Mascot state
  const [mascotState, setMascotState] = React.useState<MascotState>("idle");

  // Lesson theme (stable per lesson ID)
  const theme = getThemeForLesson(lesson.id);

  React.useEffect(() => {
    if (!isPlacement) {
      api.getProfile().then(profile => {
        setHearts(profile.stats.hearts);
        setGems(profile.stats.gems);
      }).catch(() => console.error("Failed to fetch profile"));
    }
  }, [isPlacement]);

  const exercises = lesson.exercises;
  const currentExercise = exercises[currentIndex];
  const progress = (currentIndex / exercises.length) * 100;

  const handleSubmitAnswer = async () => {
    const isCorrect = evaluateAnswer(currentExercise.type, currentAnswer, currentExercise.correct_answer);
    
    setAttempts(prev => prev + 1);
    
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      const newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);
      setFeedbackState("correct");
      // Mascot reacts to streak
      setMascotState(newStreak >= 3 ? "excited" : "happy");
    } else {
      setCorrectStreak(0);
      setMascotState("sad");
      if (isPlacement) {
        setFeedbackState("incorrect");
      } else {
        try {
          setIsSubmitting(true);
          const currentAttempt = attempts + 1;
          const deductionId = `${lesson.id}-${currentExercise.id}-${currentAttempt}`;
          const newStats = await api.deductHeart(deductionId);
          setHearts(newStats.hearts);
          window.dispatchEvent(new Event("sync-user-stats"));
          if (newStats.hearts <= 0) {
            setShowOutOfHearts(true);
            setMascotState("concerned");
          }
        } catch (err) {
          const error = err as Error;
          if (error.message?.includes("No hearts") || error.message?.includes("400")) {
            setHearts(0);
            setShowOutOfHearts(true);
            setMascotState("concerned");
          }
        } finally {
          setIsSubmitting(false);
          setFeedbackState("incorrect");
        }
      }
    }
  };

  const handleRefillHearts = async () => {
    try {
      setIsSubmitting(true);
      await api.refillHearts();
      const updatedProfile = await api.getProfile();
      setHearts(updatedProfile.stats.hearts);
      setGems(updatedProfile.stats.gems);
      window.dispatchEvent(new Event("sync-user-stats"));
      setShowOutOfHearts(false);
      setMascotState("happy");
    } catch {
      console.error("Failed to refill hearts");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = async () => {
    setFeedbackState("idle");
    setCurrentAnswer(null);
    // Brief idle between questions
    setMascotState("idle");

    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
      setMascotState("celebrating");
      await finishLesson();
    }
  };

  const finishLesson = async () => {
    try {
      setIsSubmitting(true);
      const score = Math.round((correctCount / exercises.length) * 100);
      
      if (isPlacement) {
        if (onPlacementComplete) {
          onPlacementComplete(score);
        }
        return;
      }

      await api.updateLessonProgress(lesson.id, {
        completed: true,
        score: score
      });
      
      const updatedUser = await api.getProfile();
      setFinalStats({
        xpEarned: score === 100 ? 15 : 10,
        streak: updatedUser.stats.streak,
        hearts: updatedUser.stats.hearts,
        dailyProgress: updatedUser.stats.daily_xp_progress,
        dailyGoal: updatedUser.stats.daily_xp_goal
      });
      
    } catch {
      console.error("Failed to save lesson progress");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCompleted && finalStats) {
    return (
      <LessonComplete 
        score={Math.round((correctCount / exercises.length) * 100)}
        totalAttempts={attempts}
        totalExercises={exercises.length}
        xpEarned={finalStats.xpEarned}
        streak={finalStats.streak}
        hearts={finalStats.hearts}
        dailyProgress={finalStats.dailyProgress}
        dailyGoal={finalStats.dailyGoal}
        isSubmitting={isSubmitting}
        theme={theme}
        onContinue={() => {
          router.push("/learn");
        }}
      />
    );
  } else if (isCompleted) {
    return <div className="flex h-screen items-center justify-center font-bold text-[#afafaf]">Saving progress...</div>;
  }

  return (
    <div className="flex h-screen w-full flex-col bg-white">
      <LessonHeader progress={progress} hearts={hearts} accentColor={theme.accent} />
      
      <main className="flex w-full flex-1 flex-col overflow-y-auto px-4 pb-32 pt-6 sm:px-8">
        {/* Mascot + exercise area */}
        <div className="max-w-2xl mx-auto w-full flex flex-col gap-4">
          {/* Mascot — centered, reacts to answer state */}
          <div className="flex justify-start">
            <AnimatedMascot state={mascotState} size={90} />
          </div>

          <ExerciseRenderer 
            key={`exercise-${currentIndex}`}
            exercise={currentExercise}
            submitted={feedbackState !== "idle"}
            onAnswerSelected={setCurrentAnswer}
            onSubmit={handleSubmitAnswer}
            theme={theme}
          />
        </div>
      </main>

      <ExerciseFeedback 
        state={feedbackState}
        correctAnswer={currentExercise.correct_answer}
        onContinue={handleContinue}
        isSubmitting={isSubmitting}
        theme={theme}
      />

      <Modal isOpen={showOutOfHearts} onClose={() => {}} title="Out of Hearts!">
        <div className="flex flex-col gap-6 text-center pt-4">
          <AnimatedMascot state="concerned" size={80} className="mx-auto" />
          <p className="text-lg text-[#777777]">
            You have run out of hearts. Refill using your gems to keep learning!
          </p>
          <div className="flex justify-between items-center bg-[#f7f7f7] p-4 rounded-2xl border-2 border-[#e5e5e5]">
            <span className="font-bold text-[#777777]">Your Gems</span>
            <span className="font-bold text-[#1cb0f6]">{gems !== null ? gems : "..."}</span>
          </div>
          <div className="flex flex-col gap-3 mt-2">
            <Button 
              size="lg" 
              className="w-full" 
              onClick={handleRefillHearts} 
              disabled={isSubmitting || (gems !== null && gems < 500)}
            >
              REFILL HEARTS (500 GEMS)
            </Button>
            <Button size="lg" variant="danger" className="w-full" onClick={() => router.push("/learn")}>
              QUIT LESSON
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
