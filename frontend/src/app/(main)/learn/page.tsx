"use client";

import { PageTransition } from "@/components/motion/PageTransition";
import { LearningPathContainer } from "@/components/learning-path/LearningPathContainer";

export default function Home() {
  return (
    <PageTransition>
      <div className="py-4 md:py-6">
        <LearningPathContainer />
      </div>
    </PageTransition>
  );
}
