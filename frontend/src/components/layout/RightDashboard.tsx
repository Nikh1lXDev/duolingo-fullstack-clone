"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Course, LeaderboardEntry, Quest } from "@/types/api";
import { Mascot } from "@/components/illustrations/Mascot";
import { Trophy, Target, Shield, ArrowRight } from "lucide-react";

interface RightDashboardProps {
  course?: Course | null;
  onStartLesson?: () => void;
}

export function RightDashboard({ course, onStartLesson }: RightDashboardProps) {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [lbRes, questRes] = await Promise.all([
        api.getLeaderboard().catch(() => ({ entries: [] })),
        api.getQuests().catch(() => [])
      ]);
      setLeaderboard(lbRes.entries ? lbRes.entries.slice(0, 3) : []);
      setQuests(questRes ? questRes.slice(0, 2) : []);
    } catch {
      console.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const handleStartLesson = () => {
    if (onStartLesson) {
      onStartLesson();
    } else {
      router.push("/lesson/1");
    }
  };

  return (
    <aside className="hidden lg:flex w-80 flex-col gap-6 shrink-0">
      {/* 1. Course & Motivational Super Card */}
      <div className="bg-[#182830] border-2 border-[#2b3d47] rounded-3xl p-5 relative overflow-hidden flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 bg-[#ce82ff]/20 text-[#ce82ff] text-xs font-black tracking-widest uppercase rounded-lg border border-[#ce82ff]/40">
            LINGOCLONE PRO
          </span>
          <Mascot variant="super" className="h-16 w-16" />
        </div>

        <div>
          <h3 className="font-extrabold text-lg text-white">
            {course ? `${course.source_language || course.name} → ${course.target_language || "English"}` : "Target Language Course"}
          </h3>
          <p className="text-sm font-bold text-[#afafaf] mt-1">
            Personalized dynamic lessons and unlimited practice!
          </p>
        </div>

        <button
          onClick={handleStartLesson}
          className="w-full py-3 bg-[#1cb0f6] hover:bg-[#1899d6] text-white font-extrabold tracking-wider uppercase rounded-2xl border-b-4 border-[#0081c9] active:border-b-0 transition-all cursor-pointer shadow-lg"
        >
          START LESSON
        </button>
      </div>

      {/* 2. Leaderboard Card */}
      <div className="bg-[#182830] border-2 border-[#2b3d47] rounded-3xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[#ffc800]" />
            <h3 className="font-extrabold text-white text-base">Leaderboard</h3>
          </div>
          <Link
            href="/leaderboard"
            className="text-xs font-extrabold text-[#1cb0f6] hover:text-[#84d8ff] tracking-wider uppercase flex items-center gap-1"
          >
            VIEW ALL <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {loading ? (
          <div className="h-20 animate-pulse bg-[#131f24] rounded-2xl"></div>
        ) : leaderboard.length > 0 ? (
          <div className="flex flex-col gap-2">
            {leaderboard.map((entry, idx) => (
              <div key={entry.user_id} className="flex items-center justify-between p-2 rounded-xl bg-[#131f24]/60 border border-[#2b3d47]/50">
                <div className="flex items-center gap-3">
                  <span className={`w-6 text-center font-extrabold text-sm ${idx === 0 ? "text-[#ffc800]" : idx === 1 ? "text-[#e5e5e5]" : "text-[#cd7f32]"}`}>
                    {idx + 1}
                  </span>
                  <span className="font-bold text-sm text-white">{entry.display_name || entry.username}</span>
                </div>
                <span className="font-extrabold text-xs text-[#1cb0f6]">{entry.xp} XP</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#131f24] text-xs font-bold text-[#afafaf]">
            <Shield className="h-5 w-5 text-[#afafaf]" />
            <span>Complete lessons to start competing!</span>
          </div>
        )}
      </div>

      {/* 3. Daily Quests Card */}
      <div className="bg-[#182830] border-2 border-[#2b3d47] rounded-3xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[#ff4b4b]" />
            <h3 className="font-extrabold text-white text-base">Daily Quests</h3>
          </div>
          <Link
            href="/quests"
            className="text-xs font-extrabold text-[#1cb0f6] hover:text-[#84d8ff] tracking-wider uppercase flex items-center gap-1"
          >
            VIEW ALL <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {loading ? (
          <div className="h-20 animate-pulse bg-[#131f24] rounded-2xl"></div>
        ) : quests.length > 0 ? (
          <div className="flex flex-col gap-3">
            {quests.map((q) => (
              <div key={q.id} className="flex flex-col gap-1.5 p-3 rounded-2xl bg-[#131f24]/60 border border-[#2b3d47]/50">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-white">{q.title}</span>
                  <span className="text-[#afafaf]">{Math.min(q.progress, q.target)} / {q.target}</span>
                </div>
                <div className="h-2.5 w-full bg-[#2b3d47] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#ffc800] transition-all"
                    style={{ width: `${Math.min(100, (q.progress / q.target) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs font-bold text-[#afafaf]">No active quests</div>
        )}
      </div>

      {/* 4. Motivational Card */}
      <div className="bg-[#182830] border-2 border-[#2b3d47] rounded-3xl p-5 flex flex-col gap-3">
        <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">KEEP LEARNING</h4>
        <p className="text-xs font-bold text-[#afafaf]">
          A few minutes every day keeps your progress moving forward!
        </p>
        <button
          onClick={handleStartLesson}
          className="w-full py-2.5 bg-[#58cc02] hover:bg-[#46a302] text-white font-extrabold text-xs tracking-wider uppercase rounded-xl border-b-4 border-[#3b8701] active:border-b-0 transition-all cursor-pointer"
        >
          CONTINUE PRACTICE
        </button>
      </div>

      {/* Footer Links */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold text-[#5f7582] px-2">
        <a href="#" className="hover:underline">ABOUT</a>
        <span>•</span>
        <a href="#" className="hover:underline">BLOG</a>
        <span>•</span>
        <a href="#" className="hover:underline">STORE</a>
        <span>•</span>
        <a href="#" className="hover:underline">EFFICACY</a>
        <span>•</span>
        <a href="#" className="hover:underline">CAREERS</a>
        <span>•</span>
        <a href="#" className="hover:underline">PRIVACY</a>
        <span>•</span>
        <a href="#" className="hover:underline">TERMS</a>
      </div>
    </aside>
  );
}
