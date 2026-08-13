"use client";

import { useEffect, useState, useCallback } from "react";
import { PageTransition } from "@/components/motion/PageTransition";
import { Card } from "@/components/ui/Card";
import { User, Flame } from "lucide-react";
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

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e5e5e5] border-t-[#1cb0f6]"></div>
      </div>
    );
  }

  if (!data) return null;

  const top3 = data.entries.slice(0, 3);
  const others = data.entries.slice(3);
  const currentUserEntry = data.entries.find(e => e.user_id === user?.id);
  const isCurrentUserInOthers = others.some(e => e.user_id === user?.id);
  const showStickyUser = currentUserEntry && !isCurrentUserInOthers && data.current_user_rank && data.current_user_rank > 3;

  return (
    <ProtectedRoute>
      <PageTransition>
      <div className="flex flex-col gap-6 py-8 pb-32">
        <h1 className="text-2xl font-bold uppercase tracking-wide border-b-2 border-[#e5e5e5] pb-4">
          Leaderboard
        </h1>
        
        <div className="flex flex-col gap-2">
          {/* Top 3 */}
          {top3.map((entry) => (
            <LeaderboardRow key={entry.user_id} entry={entry} isCurrentUser={entry.user_id === user?.id} />
          ))}

          {/* Spacer if there are others */}
          {others.length > 0 && <div className="h-4"></div>}

          {/* Others */}
          {others.map((entry) => (
            <LeaderboardRow key={entry.user_id} entry={entry} isCurrentUser={entry.user_id === user?.id} />
          ))}

          {/* Sticky Current User if they are completely hidden (not possible with 5 users, but good for completeness) */}
          {showStickyUser && (
            <>
              <div className="flex justify-center py-2 text-[#afafaf] font-bold">...</div>
              <LeaderboardRow entry={currentUserEntry!} isCurrentUser={true} />
            </>
          )}
        </div>
      </div>
    </PageTransition>
    </ProtectedRoute>
  );
}

function LeaderboardRow({ entry, isCurrentUser }: { entry: LeaderboardEntry, isCurrentUser: boolean }) {
  let rankColor = "text-[#afafaf]";
  if (entry.rank === 1) rankColor = "text-[#ffc800]";
  else if (entry.rank === 2) rankColor = "text-[#ce82ff]";
  else if (entry.rank === 3) rankColor = "text-[#ff9600]";

  return (
    <Card padding="sm" className={`flex items-center gap-4 ${isCurrentUser ? "bg-[#e5e5e5]/50 border-[#1cb0f6]" : ""}`}>
      <div className={`w-8 text-center font-bold text-lg ${rankColor}`}>
        {entry.rank}
      </div>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1cb0f6] text-white">
        <User className="h-6 w-6" />
      </div>
      <div className="flex flex-1 flex-col">
        <span className="font-bold text-lg">{entry.display_name} {isCurrentUser && "(You)"}</span>
        <span className="text-sm font-bold text-[#afafaf]">{entry.xp} XP</span>
      </div>
      <div className="hidden sm:flex items-center gap-1 font-bold text-[#ff9600]">
        <Flame className="h-5 w-5" />
        {entry.streak}
      </div>
    </Card>
  );
}
