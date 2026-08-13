"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Lesson, Exercise } from "@/types/api";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function LessonPage() {
  const params = useParams();
  const lessonId = Number(params.lessonId);

  const [lesson, setLesson] = React.useState<(Lesson & { exercises: Exercise[] }) | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  const fetchLesson = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const data = await api.getLesson(lessonId);
      setLesson(data as Lesson & { exercises: Exercise[] });
    } catch {
      console.error("Failed to fetch lesson data");
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLesson();
  }, [fetchLesson]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen w-full flex-col bg-white">
          <header className="sticky top-0 z-40 flex w-full items-center justify-between px-4 py-4 sm:px-6 shadow-sm">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="mx-4 flex-1">
              <Skeleton className="h-4 w-full rounded-full" />
            </div>
          </header>
        <main className="flex w-full flex-1 flex-col p-8">
          <Skeleton className="h-12 w-3/4 mb-12" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </main>
      </div>
      </ProtectedRoute>
    );
  }

  if (error || !lesson) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <ErrorState 
          title="Unable to load this lesson"
          message="There was a problem communicating with the server."
          onRetry={fetchLesson} 
        />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <LessonPlayer lesson={lesson} />
    </ProtectedRoute>
  );
}
