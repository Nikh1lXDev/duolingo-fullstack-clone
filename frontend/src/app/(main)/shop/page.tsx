"use client";

import { useEffect, useState, useCallback } from "react";
import { PageTransition } from "@/components/motion/PageTransition";
import { Mascot } from "@/components/illustrations/Mascot";
import { RightDashboard } from "@/components/layout/RightDashboard";
import { Heart, Gem, ShieldAlert, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import type { ProfileResponse } from "@/types/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function ShopPage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: "success" | "error" } | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.getProfile();
      setProfile(res);
    } catch {
      console.error("Failed to load profile for shop");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
    const handleSync = () => fetchProfile();
    window.addEventListener("sync-user-stats", handleSync);
    return () => window.removeEventListener("sync-user-stats", handleSync);
  }, [fetchProfile]);

  const handleRefillHearts = async () => {
    if (!profile) return;
    
    if (profile.stats.hearts >= 5) {
      setMessage({ text: "Hearts are already full!", type: "error" });
      return;
    }
    if (profile.stats.gems < 500) {
      setMessage({ text: "Not enough gems!", type: "error" });
      return;
    }

    setPurchasing(true);
    setMessage(null);
    try {
      await api.refillHearts();
      setMessage({ text: "Hearts refilled successfully!", type: "success" });
      window.dispatchEvent(new Event("sync-user-stats"));
    } catch (err) {
      setMessage({ text: (err as Error).message || "Failed to refill hearts.", type: "error" });
    } finally {
      setPurchasing(false);
    }
  };

  const isFull = profile ? profile.stats.hearts >= 5 : false;

  return (
    <ProtectedRoute>
      <PageTransition>
        <div className="flex flex-col lg:flex-row gap-8 w-full items-start py-4 md:py-6">
          {/* Main Column */}
          <div className="flex-1 w-full max-w-2xl flex flex-col gap-6">
            {/* 1. Super Free Trial Hero Card */}
            <div className="w-full bg-gradient-to-r from-[#182830] via-[#201c38] to-[#ce82ff]/30 border-2 border-[#2b3d47] rounded-3xl p-6 relative overflow-hidden flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between">
                <Mascot variant="super" className="h-24 w-24" />
                <span className="px-3 py-1 bg-[#ce82ff] text-white text-xs font-black tracking-widest uppercase rounded-lg">
                  SUPER
                </span>
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white">
                  Start a 1 week free trial to enjoy exclusive Super benefits
                </h1>
              </div>

              <button className="w-full py-3.5 bg-white text-[#201c38] font-black text-sm tracking-wider uppercase rounded-2xl border-b-4 border-[#e5e5e5] hover:bg-[#f7f7f7] active:border-b-0 transition-all cursor-pointer shadow-lg mt-2">
                START MY FREE 7 DAYS
              </button>
            </div>

            {message && (
              <div className={`p-4 rounded-2xl font-extrabold text-sm ${message.type === "success" ? "bg-[#58cc02]/20 text-[#58cc02] border border-[#58cc02]/40" : "bg-[#ff4b4b]/20 text-[#ff4b4b] border border-[#ff4b4b]/40"}`}>
                {message.text}
              </div>
            )}

            {/* 2. Hearts Section */}
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-black text-white border-b-2 border-[#2b3d47] pb-3">Hearts</h2>

              {/* Card 1: Refill Hearts */}
              <div className="bg-[#182830] border-2 border-[#2b3d47] rounded-3xl p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#ff4b4b]/20 text-[#ff4b4b]">
                    <Heart className="h-8 w-8 fill-current" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-lg">Refill Hearts</h3>
                    <p className="text-xs font-bold text-[#afafaf] max-w-sm mt-0.5">
                      Get full hearts so you can worry less about making mistakes in a lesson
                    </p>
                  </div>
                </div>

                <button
                  disabled={purchasing || isFull}
                  onClick={handleRefillHearts}
                  className={`px-6 py-3 font-black text-xs tracking-wider uppercase rounded-2xl transition-all cursor-pointer ${
                    isFull
                      ? "bg-[#2b3d47] text-[#afafaf] cursor-not-allowed"
                      : "bg-[#1cb0f6] hover:bg-[#1899d6] text-white border-b-4 border-[#0081c9] active:border-b-0"
                  }`}
                >
                  {isFull ? (
                    "FULL"
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Gem className="h-4 w-4 fill-current text-[#1cb0f6]" />
                      500
                    </span>
                  )}
                </button>
              </div>

              {/* Card 2: Unlimited Hearts */}
              <div className="bg-[#182830] border-2 border-[#2b3d47] rounded-3xl p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#58cc02]/20 text-[#58cc02]">
                    <Sparkles className="h-8 w-8 text-[#58cc02]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-lg">Unlimited Hearts</h3>
                    <p className="text-xs font-bold text-[#afafaf] max-w-sm mt-0.5">
                      Never run out of hearts with Super!
                    </p>
                  </div>
                </div>

                <button className="px-6 py-3 bg-[#ce82ff] hover:bg-[#b852f2] text-white font-black text-xs tracking-wider uppercase rounded-2xl border-b-4 border-[#9d3ddb] active:border-b-0 transition-all cursor-pointer">
                  FREE TRIAL
                </button>
              </div>
            </div>

            {/* 3. Power-Ups Section */}
            <div className="flex flex-col gap-4 mt-2">
              <h2 className="text-2xl font-black text-white border-b-2 border-[#2b3d47] pb-3">Power-Ups</h2>

              <div className="bg-[#182830] border-2 border-[#2b3d47] rounded-3xl p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#ff9600]/20 text-[#ff9600]">
                    <ShieldAlert className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-lg">Streak Freeze</h3>
                    <p className="text-xs font-bold text-[#afafaf] max-w-sm mt-0.5">
                      Streak Freeze allows your streak to remain intact if you miss a day of practice.
                    </p>
                  </div>
                </div>

                <span className="px-4 py-2.5 bg-[#2b3d47] text-[#afafaf] font-black text-xs tracking-wider uppercase rounded-2xl">
                  EQUIPPED
                </span>
              </div>
            </div>
          </div>

          {/* Right Dashboard Column */}
          <RightDashboard />
        </div>
      </PageTransition>
    </ProtectedRoute>
  );
}
