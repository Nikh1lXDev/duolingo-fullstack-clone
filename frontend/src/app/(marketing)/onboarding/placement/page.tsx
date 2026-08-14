"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Lesson, Exercise } from "@/types/api";
import { useAuth } from "@/context/AuthContext";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import { PageTransition } from "@/components/motion/PageTransition";
import { ErrorState } from "@/components/ui/ErrorState";

export default function PlacementLessonPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, refreshUser } = useAuth();
  
  const [lesson, setLesson] = useState<(Lesson & { exercises: Exercise[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/signup");
      return;
    }

    const initLesson = async () => {
      if (!isAuthenticated) return;
      try {
        const courseIdStr = sessionStorage.getItem("onboarding_course_id");
        if (!courseIdStr) {
          router.replace("/onboarding/course");
          return;
        }

        const courseId = parseInt(courseIdStr, 10);
        const courseDetails = await api.getCourse(courseId);
        
        let firstLessonId: number | null = null;
        if (courseDetails.units?.[0]?.skills?.[0]?.lessons?.[0]) {
          firstLessonId = courseDetails.units[0].skills[0].lessons[0].id;
        }

        if (!firstLessonId) {
          throw new Error("No lessons available for this course.");
        }

        const lessonData = await api.getLesson(firstLessonId);
        setLesson(lessonData as Lesson & { exercises: Exercise[] });
      } catch (err) {
        console.error("Failed to load placement lesson", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    initLesson();
  }, [isAuthenticated, authLoading, router]);

  const handlePlacementComplete = async (score: number) => {
    try {
      const courseIdStr = sessionStorage.getItem("onboarding_course_id");
      const proficiency = sessionStorage.getItem("onboarding_proficiency") || "new";
      
      if (courseIdStr) {
        await api.updateSettings({
          course_id: parseInt(courseIdStr, 10),
          proficiency_level: proficiency,
          placement_completed: true,
          placement_score: score,
          starting_level: "placed",
          onboarding_completed: true,
        });
        await refreshUser();
        router.push("/learn");
      }
    } catch (err) {
      console.error(err);
      router.push("/learn");
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-20 w-20 relative animate-bounce">
            <div className="absolute inset-0 bg-[url('/illustrations/mascot.svg')] bg-contain bg-center bg-no-repeat" />
          </div>
          <p className="font-bold text-[#afafaf] animate-pulse">Getting your lesson ready...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <ErrorState 
          title="Lesson Unavailable"
          message="We couldn't load the placement lesson right now."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <PageTransition>
      <LessonPlayer 
        lesson={lesson} 
        isPlacement={true} 
        onPlacementComplete={handlePlacementComplete}
      />
    </PageTransition>
  );
}
