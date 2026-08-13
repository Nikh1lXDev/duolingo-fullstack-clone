"use client";

import { useEffect, useState, useCallback } from "react";
import { PageTransition } from "@/components/motion/PageTransition";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Heart, Diamond } from "lucide-react";
import { api } from "@/lib/api";
import type { ProfileResponse } from "@/types/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function ShopPage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: "success" | "error" } | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.getProfile();
      setProfile(res);
    } catch {
      console.error("Failed to load profile for shop");
    } finally {
      setLoading(false);
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
    
    // Frontend-side check for UX, but backend is authoritative
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

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e5e5e5] border-t-[#1cb0f6]"></div>
      </div>
    );
  }

  if (!profile) return null;

  const isFull = profile.stats.hearts >= 5;
  const isAffordable = profile.stats.gems >= 500;

  return (
    <ProtectedRoute>
      <PageTransition>
      <div className="flex flex-col gap-6 py-8 pb-32">
        <h1 className="text-2xl font-bold uppercase tracking-wide border-b-2 border-[#e5e5e5] pb-4">
          Shop
        </h1>
        
        <div className="flex items-center gap-2 mb-2 font-bold text-[#1cb0f6] text-xl">
          <Diamond className="h-6 w-6 fill-current" />
          {profile.stats.gems} Gems
        </div>

        {message && (
          <div className={`p-4 rounded-xl font-bold ${message.type === "success" ? "bg-[#58cc02]/20 text-[#58cc02]" : "bg-[#ff4b4b]/20 text-[#ff4b4b]"}`}>
            {message.text}
          </div>
        )}

        <Card padding="md" className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#ff4b4b]/20 text-[#ff4b4b]">
                <Heart className="h-8 w-8 fill-current" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Heart Refill</h3>
                <p className="text-sm font-bold text-[#afafaf]">
                  Get full hearts to keep learning
                </p>
              </div>
            </div>
          </div>
          
          <Button
            variant={isFull ? "secondary" : (isAffordable ? "primary" : "secondary")}
            size="lg"
            className="w-full flex items-center justify-center gap-2"
            disabled={purchasing || isFull}
            onClick={handleRefillHearts}
          >
            {isFull ? (
              "FULL"
            ) : (
              <>
                <Diamond className="h-5 w-5 fill-current" />
                500
              </>
            )}
          </Button>
        </Card>
      </div>
    </PageTransition>
    </ProtectedRoute>
  );
}
