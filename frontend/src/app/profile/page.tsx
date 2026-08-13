"use client";

import { useEffect, useState, useCallback } from "react";
import { PageTransition } from "@/components/motion/PageTransition";
import { User, Flame, Hexagon, Shield, Trophy, Edit3, Search, UserPlus } from "lucide-react";
import { api } from "@/lib/api";
import type { ProfileResponse } from "@/types/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Link from "next/link";

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"following" | "followers">("following");

  const fetchProfile = useCallback(async () => {
    try {
      const data = await api.getProfile();
      setProfile(data);
    } catch {
      console.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();

    const handleSync = () => {
      fetchProfile();
    };
    window.addEventListener("sync-user-stats", handleSync);
    return () => window.removeEventListener("sync-user-stats", handleSync);
  }, [fetchProfile]);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2b3d47] border-t-[#1cb0f6]"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <ProtectedRoute>
      <PageTransition>
        <div className="flex flex-col lg:flex-row gap-8 w-full items-start py-4 md:py-6">
          {/* Main Column */}
          <div className="flex-1 w-full max-w-2xl flex flex-col gap-6">
            {/* 1. Avatar Header Card */}
            <div className="bg-[#182830] border-2 border-[#2b3d47] rounded-3xl p-6 relative flex flex-col gap-6 shadow-xl">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-6">
                  {/* Avatar Frame */}
                  <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-[#1cb0f6] text-white border-4 border-[#2b3d47]">
                    <User className="h-16 w-16" />
                    <Link
                      href="/settings"
                      className="absolute top-0 right-0 p-2 bg-[#131f24] border-2 border-[#2b3d47] rounded-full text-white hover:text-[#1cb0f6] transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="flex flex-col gap-1">
                    <h1 className="text-2xl md:text-3xl font-black text-white">{profile.user.display_name}</h1>
                    <p className="text-sm font-bold text-[#afafaf]">{profile.user.username}</p>
                    <p className="text-xs font-bold text-[#5f7582] mt-1">Joined August 2026</p>
                    <div className="flex items-center gap-4 text-xs font-extrabold text-[#1cb0f6] mt-2">
                      <span>0 Following</span>
                      <span>0 Followers</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Statistics Section */}
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-black text-white">Statistics</h2>
              <div className="grid grid-cols-2 gap-4">
                {/* Day Streak */}
                <div className="bg-[#182830] border-2 border-[#2b3d47] rounded-3xl p-4 flex items-center gap-4">
                  <Flame className="h-8 w-8 text-[#ff9600] fill-[#ff9600]" />
                  <div className="flex flex-col">
                    <span className="text-xl font-black text-white">{profile.stats.streak}</span>
                    <span className="text-xs font-extrabold text-[#afafaf]">Day streak</span>
                  </div>
                </div>

                {/* Total XP */}
                <div className="bg-[#182830] border-2 border-[#2b3d47] rounded-3xl p-4 flex items-center gap-4">
                  <Hexagon className="h-8 w-8 text-[#1cb0f6] fill-[#1cb0f6]" />
                  <div className="flex flex-col">
                    <span className="text-xl font-black text-white">{profile.stats.xp}</span>
                    <span className="text-xs font-extrabold text-[#afafaf]">Total XP</span>
                  </div>
                </div>

                {/* Current League */}
                <div className="bg-[#182830] border-2 border-[#2b3d47] rounded-3xl p-4 flex items-center gap-4">
                  <Shield className="h-8 w-8 text-[#5f7582]" />
                  <div className="flex flex-col">
                    <span className="text-xl font-black text-white">Bronze</span>
                    <span className="text-xs font-extrabold text-[#afafaf]">Current league</span>
                  </div>
                </div>

                {/* Top 3 Finishes */}
                <div className="bg-[#182830] border-2 border-[#2b3d47] rounded-3xl p-4 flex items-center gap-4">
                  <Trophy className="h-8 w-8 text-[#ffc800]" />
                  <div className="flex flex-col">
                    <span className="text-xl font-black text-white">0</span>
                    <span className="text-xs font-extrabold text-[#afafaf]">Top 3 finishes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Dashboard Column */}
          <aside className="hidden lg:flex w-80 flex-col gap-6 shrink-0">
            {/* Following / Followers Tab Card */}
            <div className="bg-[#182830] border-2 border-[#2b3d47] rounded-3xl p-5 flex flex-col gap-4">
              <div className="flex border-b-2 border-[#2b3d47]">
                <button
                  onClick={() => setActiveTab("following")}
                  className={`flex-1 py-2 text-xs font-black uppercase tracking-wider transition-colors ${
                    activeTab === "following"
                      ? "text-[#1cb0f6] border-b-2 border-[#1cb0f6]"
                      : "text-[#afafaf] hover:text-white"
                  }`}
                >
                  FOLLOWING
                </button>
                <button
                  onClick={() => setActiveTab("followers")}
                  className={`flex-1 py-2 text-xs font-black uppercase tracking-wider transition-colors ${
                    activeTab === "followers"
                      ? "text-[#1cb0f6] border-b-2 border-[#1cb0f6]"
                      : "text-[#afafaf] hover:text-white"
                  }`}
                >
                  FOLLOWERS
                </button>
              </div>

              <div className="flex flex-col items-center justify-center text-center p-6 gap-3">
                <p className="text-xs font-bold text-[#afafaf] leading-relaxed">
                  Learning is more fun and effective when you connect with others.
                </p>
              </div>
            </div>

            {/* Add Friends Card */}
            <div className="bg-[#182830] border-2 border-[#2b3d47] rounded-3xl p-5 flex flex-col gap-4">
              <h3 className="font-extrabold text-white text-base">Add friends</h3>

              <div className="flex flex-col gap-2">
                <button className="flex items-center justify-between p-3 rounded-2xl bg-[#131f24] border border-[#2b3d47] hover:border-[#1cb0f6] transition-colors cursor-pointer text-left">
                  <div className="flex items-center gap-3">
                    <Search className="h-5 w-5 text-[#1cb0f6]" />
                    <span className="font-bold text-sm text-white">Find friends</span>
                  </div>
                  <span className="text-[#afafaf] font-bold">›</span>
                </button>

                <button className="flex items-center justify-between p-3 rounded-2xl bg-[#131f24] border border-[#2b3d47] hover:border-[#1cb0f6] transition-colors cursor-pointer text-left">
                  <div className="flex items-center gap-3">
                    <UserPlus className="h-5 w-5 text-[#58cc02]" />
                    <span className="font-bold text-sm text-white">Invite friends</span>
                  </div>
                  <span className="text-[#afafaf] font-bold">›</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </PageTransition>
    </ProtectedRoute>
  );
}
