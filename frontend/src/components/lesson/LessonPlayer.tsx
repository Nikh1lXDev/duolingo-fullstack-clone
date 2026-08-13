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

export interface LessonPlayerProps {
  lesson: Lesson & { exercises: Exercise[] };
}

export function LessonPlayer({ lesson }: LessonPlayerProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [currentAnswer, setCurrentAnswer] = React.useState<unknown>(null);
  const [feedbackState, setFeedbackState] = React.useState<FeedbackState>("idle");
  const [isCompleted, setIsCompleted] = React.useState(false);
  const [correctCount, setCorrectCount] = React.useState(0);
  const [attempts, setAttempts] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Gamification state
  const [hearts, setHearts] = React.useState<number | null>(null);
  const [gems, setGems] = React.useState<number | null>(null);
  const [showOutOfHearts, setShowOutOfHearts] = React.useState(false);
  const [finalStats, setFinalStats] = React.useState<Record<string, number> | null>(null);

  React.useEffect(() => {
    // Fetch profile to get stats (for hearts)
    api.getProfile().then(profile => {
      setHearts(profile.stats.hearts);
      setGems(profile.stats.gems);
    }).catch(() => console.error("Failed to fetch profile"));
  }, []);

  const exercises = lesson.exercises;
  const currentExercise = exercises[currentIndex];
  
  // Progress goes from 0 to 100 based on index
  const progress = (currentIndex / exercises.length) * 100;

  const handleSubmitAnswer = async () => {
    const isCorrect = evaluateAnswer(currentExercise.type, currentAnswer, currentExercise.correct_answer);
    
    setAttempts(prev => prev + 1);
    
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      setFeedbackState("correct");
    } else {
      try {
        setIsSubmitting(true);
        // Uses Attempts + 1 because we just incremented state locally but it might not be batched yet
        const currentAttempt = attempts + 1;
        const deductionId = `${lesson.id}-${currentExercise.id}-${currentAttempt}`;
        const newStats = await api.deductHeart(deductionId);
        setHearts(newStats.hearts);
        window.dispatchEvent(new Event("sync-user-stats"));
        if (newStats.hearts <= 0) {
          setShowOutOfHearts(true);
        }
      } catch (err) {
        const error = err as Error;
        if (error.message?.includes("No hearts") || error.message?.includes("400")) {
          setHearts(0);
          setShowOutOfHearts(true);
        }
      } finally {
        setIsSubmitting(false);
        setFeedbackState("incorrect");
      }
    }
  };

  const handleRefillHearts = async () => {
    try {
      setIsSubmitting(true);
      await api.refillHearts();
      // Refetch stats for post-lesson display
      const updatedProfile = await api.getProfile();
      setHearts(updatedProfile.stats.hearts);
      setGems(updatedProfile.stats.gems);
      window.dispatchEvent(new Event("sync-user-stats"));
      setShowOutOfHearts(false);
    } catch {
      console.error("Failed to refill hearts");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = async () => {
    setFeedbackState("idle");
    setCurrentAnswer(null);

    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
      await finishLesson();
    }
  };

  const finishLesson = async () => {
    try {
      setIsSubmitting(true);
      const score = Math.round((correctCount / exercises.length) * 100);
      
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
        onContinue={() => {
          router.push("/");
        }}
      />
    );
  } else if (isCompleted) {
    // Waiting for final stats to load
    return <div className="flex h-screen items-center justify-center font-bold text-[#afafaf]">Loading rewards...</div>;
  }

  return (
    <div className="flex h-screen w-full flex-col bg-white">
      <LessonHeader progress={progress} hearts={hearts} />
      
      <main className="flex w-full flex-1 flex-col overflow-y-auto px-4 pb-32 pt-8 sm:px-8">
        <ExerciseRenderer 
          key={`exercise-${currentIndex}`}
          exercise={currentExercise}
          submitted={feedbackState !== "idle"}
          onAnswerSelected={setCurrentAnswer}
          onSubmit={handleSubmitAnswer}
        />
      </main>

      <ExerciseFeedback 
        state={feedbackState}
        correctAnswer={currentExercise.correct_answer}
        onContinue={handleContinue}
        isSubmitting={isSubmitting}
      />

      <Modal isOpen={showOutOfHearts} onClose={() => {}} title="Out of Hearts!">
        <div className="flex flex-col gap-6 text-center pt-4">
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
            <Button size="lg" variant="danger" className="w-full" onClick={() => router.push("/")}>
              QUIT LESSON
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
