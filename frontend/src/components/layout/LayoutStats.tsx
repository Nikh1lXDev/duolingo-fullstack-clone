"use client";

import * as React from "react";
import { TopStats } from "./TopStats";
import { api } from "@/lib/api";
import { ProfileResponse } from "@/types/api";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function LayoutStats() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = React.useState<ProfileResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    
    if (!isAuthenticated) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(false);
        const data = await api.getProfile();
        if (isMounted) setProfile(data);
      } catch {
        console.error("Failed to fetch user stats");
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchUser();
    
    // Listen for out-of-band gamification updates (e.g. from LessonPlayer)
    const handleSync = () => {
      api.getProfile().then(data => {
        if (isMounted) setProfile(data);
      }).catch(() => console.error("Failed to fetch user stats"));
    };
    
    window.addEventListener("sync-user-stats", handleSync);
    
    return () => {
      isMounted = false;
      window.removeEventListener("sync-user-stats", handleSync);
    };
  }, [pathname, isAuthenticated]);

  if (!isAuthenticated) return null;

  // If loading or error, we show default 0s or empty skeleton-like stats to maintain layout
  if (loading || error || !profile || !profile.stats) {
    return <TopStats streak={0} xp={0} hearts={0} gems={0} className="animate-pulse opacity-50" />;
  }

  return (
    <TopStats
      streak={profile.stats.streak}
      xp={profile.stats.xp}
      hearts={profile.stats.hearts}
      gems={profile.stats.gems}
    />
  );
}
