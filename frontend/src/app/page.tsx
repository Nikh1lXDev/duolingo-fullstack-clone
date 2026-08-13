"use client";

import { PageTransition } from "@/components/motion/PageTransition";
import { LearningPathContainer } from "@/components/learning-path/LearningPathContainer";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute>
      <PageTransition>
        <div className="py-4 md:py-6">
          <LearningPathContainer />
        </div>
      </PageTransition>
    </ProtectedRoute>
  );
}
