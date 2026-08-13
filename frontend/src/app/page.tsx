"use client";

import { useEffect, useState, useCallback } from "react";
import { PageTransition } from "@/components/motion/PageTransition";
import { LearningPathContainer } from "@/components/learning-path/LearningPathContainer";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Target, Check } from "lucide-react";
import { api } from "@/lib/api";
import type { Quest } from "@/types/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function DailyGoalCard() {
  const [quest, setQuest] = useState<Quest | null>(null);

  const fetchQuests = useCallback(async () => {
    try {
      const data = await api.getQuests();
      const xpQuest = data.find((q) => q.id === "daily-xp");
      if (xpQuest) setQuest(xpQuest);
    } catch {
      console.error("Failed to load daily goal");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchQuests();
    const handleSync = () => fetchQuests();
    window.addEventListener("sync-user-stats", handleSync);
    return () => window.removeEventListener("sync-user-stats", handleSync);
  }, [fetchQuests]);

  if (!quest) return null;

  return (
    <Card padding="md" className="mb-6 flex flex-col md:flex-row items-center gap-4 border-[#1cb0f6]">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${quest.completed ? "bg-[#58cc02] text-white" : "bg-[#1cb0f6] text-white"}`}>
        {quest.completed ? <Check className="h-6 w-6" /> : <Target className="h-6 w-6" />}
      </div>
      <div className="flex flex-1 flex-col w-full">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-bold">Daily Goal</h3>
          <span className="text-sm font-bold text-[#afafaf]">{Math.min(quest.progress, quest.target)} / {quest.target} XP</span>
        </div>
        <ProgressBar 
          value={(Math.min(quest.progress, quest.target) / quest.target) * 100} 
          color={quest.completed ? "brand" : "blue"}
        />
      </div>
    </Card>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <PageTransition>
      <div className="py-8">
        <DailyGoalCard />
        <LearningPathContainer />
      </div>
    </PageTransition>
    </ProtectedRoute>
  );
}
