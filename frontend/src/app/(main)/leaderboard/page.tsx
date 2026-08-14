"use client";

import { useEffect, useState, useCallback } from "react";
import { PageTransition } from "@/components/motion/PageTransition";
import { RightDashboard } from "@/components/layout/RightDashboard";
import { User, Flame, Trophy, Shield } from "lucide-react";
import { api } from "@/lib/api";
import type { LeaderboardResponse, LeaderboardEntry } from "@/types/api";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await api.getLeaderboard();
      setData(res);
    } catch {
      console.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLeaderboard();

    const handleSync = () => {
      fetchLeaderboard();
    };
    window.addEventListener("sync-user-stats", handleSync);
    return () => window.removeEventListener("sync-user-stats", handleSync);
  }, [fetchLeaderboard]);

  return (
    <ProtectedRoute>
      <PageTransition>
        <div className="flex flex-col lg:flex-row gap-8 w-full items-start py-4 md:py-6">
          {/* Main Column */}
          <div className="flex-1 w-full max-w-2xl flex flex-col gap-6">
            {/* Header Card */}
            <div className="bg-[#182830] border-2 border-[#2b3d47] rounded-3xl p-6 flex items-center justify-between shadow-xl">
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl md:text-3xl font-black text-white">Bronze League</h1>
                <p className="text-xs font-bold text-[#afafaf]">Top 3 advance to the next league!</p>
              </div>
              <Trophy className="h-12 w-12 text-[#ffc800]" />
            </div>

            {loading ? (
              <div className="flex flex-col gap-3 animate-pulse">
                <div className="h-16 bg-[#182830] rounded-2xl"></div>
                <div className="h-16 bg-[#182830] rounded-2xl"></div>
              </div>
            ) : data ? (
              <div className="flex flex-col gap-2.5">
                {data.entries.map((entry) => (
                  <LeaderboardRow
                    key={entry.user_id}
                    entry={entry}
                    isCurrentUser={entry.user_id === user?.id}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-3xl bg-[#182830] border-2 border-[#2b3d47] text-sm font-bold text-[#afafaf]">
                <Shield className="h-6 w-6 text-[#afafaf]" />
                <span>Leaderboard data unavailable</span>
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

function LeaderboardRow({ entry, isCurrentUser }: { entry: LeaderboardEntry, isCurrentUser: boolean }) {
  let rankColor = "text-[#5f7582]";
  if (entry.rank === 1) rankColor = "text-[#ffc800]";
  else if (entry.rank === 2) rankColor = "text-[#e5e5e5]";
  else if (entry.rank === 3) rankColor = "text-[#cd7f32]";

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
        isCurrentUser
          ? "bg-[#182830] border-[#1cb0f6] shadow-[0_0_12px_rgba(28,176,246,0.2)]"
          : "bg-[#182830]/80 border-[#2b3d47]"
      }`}
    >
      <div className="flex items-center gap-4">
        <span className={`w-8 text-center font-black text-lg ${rankColor}`}>
          {entry.rank}
        </span>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1cb0f6] text-white border-2 border-[#2b3d47]">
          <User className="h-6 w-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-base text-white">
            {entry.display_name} {isCurrentUser && "(You)"}
          </span>
          <span className="text-xs font-bold text-[#1cb0f6]">{entry.xp} XP</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 font-extrabold text-xs text-[#ff9600]">
        <Flame className="h-4 w-4 fill-current" />
        <span>{entry.streak}</span>
      </div>
    </div>
  );
}
