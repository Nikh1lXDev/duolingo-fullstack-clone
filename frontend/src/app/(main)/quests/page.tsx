"use client";

import { useEffect, useState, useCallback } from "react";
import { PageTransition } from "@/components/motion/PageTransition";
import { Mascot } from "@/components/illustrations/Mascot";
import { RightDashboard } from "@/components/layout/RightDashboard";
import { Zap, Lock, Clock, Gift } from "lucide-react";
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

  return (
    <ProtectedRoute>
      <PageTransition>
        <div className="flex flex-col lg:flex-row gap-8 w-full items-start py-4 md:py-6">
          {/* Main Column */}
          <div className="flex-1 w-full max-w-2xl flex flex-col gap-6">
            {/* 1. Purple Hero Welcome Card */}
            <div className="w-full bg-gradient-to-r from-[#ce82ff] to-[#7752fe] rounded-3xl p-6 relative overflow-hidden flex items-center justify-between shadow-xl text-white">
              <div className="flex flex-col gap-2 max-w-sm z-10">
                <h1 className="text-3xl font-black tracking-tight">Welcome!</h1>
                <p className="text-sm font-extrabold opacity-90 leading-relaxed">
                  Complete quests to earn rewards! Quests refresh every day.
                </p>
              </div>
              <div className="relative shrink-0 z-10 flex items-center gap-2">
                <Gift className="h-10 w-10 text-[#ffc800] animate-bounce" />
                <Mascot variant="waving" className="h-28 w-28" />
              </div>
            </div>

            {/* 2. Daily Quests Section */}
            <div className="flex items-center justify-between mt-2">
              <h2 className="text-2xl font-black text-white">Daily Quests</h2>
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#ff9600]">
                <Clock className="h-4 w-4" />
                <span>23 HOURS</span>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col gap-4 animate-pulse">
                <div className="h-24 bg-[#182830] rounded-3xl"></div>
                <div className="h-24 bg-[#182830] rounded-3xl"></div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {quests.map((quest) => (
                  <div
                    key={quest.id}
                    className="bg-[#182830] border-2 border-[#2b3d47] rounded-3xl p-5 flex items-center justify-between gap-4 shadow-md"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#ffc800]/20 text-[#ffc800]">
                        <Zap className="h-7 w-7 fill-current" />
                      </div>

                      <div className="flex flex-col gap-2 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-extrabold text-white text-base">{quest.title}</h3>
                          <span className="text-xs font-extrabold text-[#ffc800]">+{quest.reward_xp} XP</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-3 bg-[#2b3d47] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#ffc800] rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, (quest.progress / quest.target) * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-extrabold text-[#afafaf]">
                            {Math.min(quest.progress, quest.target)} / {quest.target}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 pl-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2b3d47] text-[#ffc800]">
                        <Gift className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Locked Extra Quests Card */}
                <div className="bg-[#131f24] border-2 border-[#2b3d47] rounded-3xl p-6 flex items-center gap-4 text-[#5f7582]">
                  <Lock className="h-6 w-6" />
                  <span className="font-extrabold text-sm tracking-wide">More quests unlock soon</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Dashboard Column */}
          <RightDashboard />
        </div>
      </PageTransition>
    </ProtectedRoute>
  );
}
