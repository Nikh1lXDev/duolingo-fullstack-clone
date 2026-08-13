"use client";

import { useEffect, useState, useCallback } from "react";
import { PageTransition } from "@/components/motion/PageTransition";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Target, Check } from "lucide-react";
import { api } from "@/lib/api";
import type { Quest } from "@/types/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function QuestsPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuests = useCallback(async () => {
    try {
      const data = await api.getQuests();
      setQuests(data);
    } catch {
      console.error("Failed to load quests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchQuests();

    const handleSync = () => {
      fetchQuests();
    };
    window.addEventListener("sync-user-stats", handleSync);
    return () => window.removeEventListener("sync-user-stats", handleSync);
  }, [fetchQuests]);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e5e5e5] border-t-[#1cb0f6]"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <PageTransition>
      <div className="flex flex-col gap-6 py-8 pb-32">
        <h1 className="text-2xl font-bold uppercase tracking-wide border-b-2 border-[#e5e5e5] pb-4">
          Daily Quests
        </h1>
        
        <div className="flex flex-col gap-4">
          {quests.map((quest) => (
            <Card key={quest.id} padding="md" className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex flex-1 flex-col w-full">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg">{quest.title}</h3>
                  <span className="text-sm font-bold text-[#ffc800]">+{quest.reward_xp} XP</span>
                </div>
                <p className="text-sm text-[#777777] mb-4">{quest.description}</p>
                <div className="flex items-center gap-4">
                  <ProgressBar 
                    value={(Math.min(quest.progress, quest.target) / quest.target) * 100} 
                    color={quest.completed ? "brand" : "yellow"}
                  />
                  <span className="text-sm font-bold w-12 text-right">
                    {Math.min(quest.progress, quest.target)} / {quest.target}
                  </span>
                </div>
              </div>
              <div className="hidden md:flex shrink-0">
                 <div className={`flex h-12 w-12 items-center justify-center rounded-full ${quest.completed ? "bg-[#58cc02] text-white" : "bg-[#e5e5e5] text-[#afafaf]"}`}>
                   {quest.completed ? <Check className="h-6 w-6" /> : <Target className="h-6 w-6" />}
                 </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageTransition>
    </ProtectedRoute>
  );
}
