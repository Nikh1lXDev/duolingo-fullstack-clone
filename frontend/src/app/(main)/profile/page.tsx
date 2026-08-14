"use client";

import { useEffect, useState, useCallback } from "react";
import { PageTransition } from "@/components/motion/PageTransition";
import { Flame, Zap, Shield, Trophy, Edit3, Search, UserPlus } from "lucide-react";
import { api } from "@/lib/api";
import type { ProfileResponse } from "@/types/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Link from "next/link";
import { AvatarPreview, AvatarConfig, DEFAULT_AVATAR_CONFIG } from "@/components/illustrations/AvatarPreview";

function formatJoinDate(isoDate?: string | null): string {
  if (!isoDate) return "Member";
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  } catch {
    return "Member";
  }
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"following" | "followers">("following");
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DEFAULT_AVATAR_CONFIG);

  const fetchProfile = useCallback(async () => {
    try {
      const [data, settings] = await Promise.all([
        api.getProfile(),
        api.getSettings(),
      ]);
      setProfile(data);
      if (settings.avatar_config) {
        try {
          const parsed = JSON.parse(settings.avatar_config);
          setAvatarConfig({ ...DEFAULT_AVATAR_CONFIG, ...parsed });
        } catch { /* corrupt, use default */ }
      }
    } catch {
      console.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
    const handleSync = () => { fetchProfile(); };
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

  // Null-safe stats with correct fallbacks
  const xp = profile.stats?.xp ?? 0;
  const streak = profile.stats?.streak ?? 0;
  const hearts = profile.stats?.hearts ?? 5;
  const gems = profile.stats?.gems ?? 0;

  const displayName = profile.user.display_name ?? profile.user.username;

  // League based on XP
  const getLeague = (xp: number) => {
    if (xp >= 2000) return { name: "Gold", color: "#ffc800" };
    if (xp >= 500) return { name: "Silver", color: "#c0c0c0" };
    return { name: "Bronze", color: "#cd7f32" };
  };
  const league = getLeague(xp);

  return (
    <ProtectedRoute>
      <PageTransition>
        <div className="flex flex-col lg:flex-row gap-8 w-full items-start py-4 md:py-6">
          {/* Main Column */}
          <div className="flex-1 w-full max-w-2xl flex flex-col gap-6">
            {/* Avatar + Profile Header Card */}
            <div className="bg-[#182830] border-2 border-[#2b3d47] rounded-3xl overflow-hidden shadow-xl">
              {/* Avatar banner */}
              <div className="relative h-36 bg-gradient-to-br from-[#1cb0f6]/20 to-[#58cc02]/10 flex items-end justify-center">
                {/* Edit button */}
                <Link
                  href="/settings/avatar"
                  className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-[#131f24]/80 border border-[#2b3d47] rounded-full text-xs font-bold text-white hover:border-[#1cb0f6] transition-colors backdrop-blur"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit Avatar
                </Link>
                {/* Avatar centered at bottom */}
                <div className="translate-y-1/2 rounded-full border-4 border-[#182830] shadow-xl bg-[#1a2e3a]">
                  <AvatarPreview config={avatarConfig} size={100} />
                </div>
              </div>

              {/* Name/stats area */}
              <div className="pt-16 pb-6 px-6 text-center">
                <h1 className="text-2xl font-black text-white">{displayName}</h1>
                <p className="text-sm font-bold text-[#afafaf] mt-0.5">@{profile.user.username}</p>
                <p className="text-xs font-bold text-[#5f7582] mt-1">
                  Joined {formatJoinDate((profile.user as {created_at?: string}).created_at)}
                </p>
                <div className="flex items-center justify-center gap-6 text-xs font-extrabold text-[#1cb0f6] mt-3">
                  <button className="hover:underline transition-colors">0 Following</button>
                  <button className="hover:underline transition-colors">0 Followers</button>
                </div>
              </div>
            </div>

            {/* Statistics Section */}
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-black text-white">Statistics</h2>
              <div className="grid grid-cols-2 gap-4">
                {/* Day Streak */}
                <div className="bg-[#182830] border-2 border-[#2b3d47] rounded-3xl p-4 flex items-center gap-4">
                  <Flame className="h-8 w-8 text-[#ff9600] fill-[#ff9600] shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xl font-black text-white">{streak}</span>
                    <span className="text-xs font-extrabold text-[#afafaf]">Day streak</span>
                  </div>
                </div>

                {/* Total XP — FIXED: was showing undefined */}
                <div className="bg-[#182830] border-2 border-[#2b3d47] rounded-3xl p-4 flex items-center gap-4">
                  <Zap className="h-8 w-8 text-[#ffc800] fill-[#ffc800] shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xl font-black text-white">{xp.toLocaleString()}</span>
                    <span className="text-xs font-extrabold text-[#afafaf]">Total XP</span>
                  </div>
                </div>

                {/* Current League */}
                <div className="bg-[#182830] border-2 border-[#2b3d47] rounded-3xl p-4 flex items-center gap-4">
                  <Shield className="h-8 w-8 shrink-0" style={{ color: league.color }} />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xl font-black text-white">{league.name}</span>
                    <span className="text-xs font-extrabold text-[#afafaf]">Current league</span>
                  </div>
                </div>

                {/* Gems */}
                <div className="bg-[#182830] border-2 border-[#2b3d47] rounded-3xl p-4 flex items-center gap-4">
                  <Trophy className="h-8 w-8 text-[#1cb0f6] shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xl font-black text-white">{gems.toLocaleString()}</span>
                    <span className="text-xs font-extrabold text-[#afafaf]">Total gems</span>
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
                <div className="text-4xl">👥</div>
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

            {/* Hearts / Gems display */}
            <div className="bg-[#182830] border-2 border-[#2b3d47] rounded-3xl p-5 flex gap-4">
              <div className="flex-1 flex flex-col items-center gap-1">
                <span className="text-2xl">❤️</span>
                <span className="text-xl font-black text-white">{hearts}</span>
                <span className="text-xs text-[#afafaf] font-bold">Hearts</span>
              </div>
              <div className="w-px bg-[#2b3d47]" />
              <div className="flex-1 flex flex-col items-center gap-1">
                <span className="text-2xl">💎</span>
                <span className="text-xl font-black text-white">{gems.toLocaleString()}</span>
                <span className="text-xs text-[#afafaf] font-bold">Gems</span>
              </div>
            </div>
          </aside>
        </div>
      </PageTransition>
    </ProtectedRoute>
  );
}
