"use client";

import { useEffect, useState, useCallback } from "react";
import { PageTransition } from "@/components/motion/PageTransition";
import { Card } from "@/components/ui/Card";
import { User, Flame, Hexagon, Target, BookOpen, Crown } from "lucide-react";
import { api } from "@/lib/api";
import type { ProfileResponse } from "@/types/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e5e5e5] border-t-[#1cb0f6]"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <ProtectedRoute>
      <PageTransition>
      <div className="flex flex-col gap-6 py-8 pb-32">
        <h1 className="text-2xl font-bold uppercase tracking-wide border-b-2 border-[#e5e5e5] pb-4">
          Profile
        </h1>
        
        <Card className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[#1cb0f6] text-white">
            <User className="h-16 w-16" />
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h2 className="text-2xl font-bold">{profile.user.display_name}</h2>
            <p className="text-[#777777]">{profile.user.username}</p>
          </div>
        </Card>

        <h2 className="text-xl font-bold mt-4">Statistics</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card padding="sm" className="flex flex-col items-center gap-2 text-center">
            <Flame className="h-8 w-8 text-[#ff9600]" />
            <div className="flex flex-col">
              <span className="text-xl font-bold">{profile.stats.streak}</span>
              <span className="text-xs font-bold text-[#afafaf] uppercase tracking-wide">Day Streak</span>
            </div>
          </Card>
          <Card padding="sm" className="flex flex-col items-center gap-2 text-center">
            <Hexagon className="h-8 w-8 text-[#1cb0f6]" />
            <div className="flex flex-col">
              <span className="text-xl font-bold">{profile.stats.xp}</span>
              <span className="text-xs font-bold text-[#afafaf] uppercase tracking-wide">Total XP</span>
            </div>
          </Card>
          <Card padding="sm" className="flex flex-col items-center gap-2 text-center">
            <Crown className="h-8 w-8 text-[#ffc800]" />
            <div className="flex flex-col">
              <span className="text-xl font-bold">{profile.progress.skills_completed}</span>
              <span className="text-xs font-bold text-[#afafaf] uppercase tracking-wide">Skills Completed</span>
            </div>
          </Card>
          <Card padding="sm" className="flex flex-col items-center gap-2 text-center">
            <BookOpen className="h-8 w-8 text-[#58cc02]" />
            <div className="flex flex-col">
              <span className="text-xl font-bold">{profile.progress.lessons_completed}</span>
              <span className="text-xs font-bold text-[#afafaf] uppercase tracking-wide">Lessons Completed</span>
            </div>
          </Card>
        </div>

        <h2 className="text-xl font-bold mt-4">Achievements</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AchievementCard 
            title="First Lesson"
            description="Complete 1 lesson"
            completed={profile.progress.lessons_completed >= 1}
            icon={<Target className="h-6 w-6 text-white" />}
            color="bg-[#1cb0f6]"
          />
          <AchievementCard 
            title="Learning Habit"
            description="Complete 3 lessons"
            completed={profile.progress.lessons_completed >= 3}
            icon={<BookOpen className="h-6 w-6 text-white" />}
            color="bg-[#58cc02]"
          />
          <AchievementCard 
            title="Overachiever"
            description="Earn 100 XP"
            completed={profile.stats.xp >= 100}
            icon={<Hexagon className="h-6 w-6 text-white" />}
            color="bg-[#ce82ff]"
          />
          <AchievementCard 
            title="Week Long Streak"
            description="Reach a 7 day streak"
            completed={profile.stats.longest_streak >= 7}
            icon={<Flame className="h-6 w-6 text-white" />}
            color="bg-[#ff9600]"
          />
          <AchievementCard 
            title="Skill Master"
            description="Complete 1 skill"
            completed={profile.progress.skills_completed >= 1}
            icon={<Crown className="h-6 w-6 text-white" />}
            color="bg-[#ffc800]"
          />
        </div>
      </div>
    </PageTransition>
    </ProtectedRoute>
  );
}

function AchievementCard({ title, description, completed, icon, color }: { title: string, description: string, completed: boolean, icon: React.ReactNode, color: string }) {
  return (
    <Card className="flex items-center gap-4 opacity-100" padding="md">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${completed ? color : "bg-[#e5e5e5]"}`}>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="font-bold">{title}</span>
        <span className="text-sm text-[#777777]">{description}</span>
        {!completed && <span className="text-xs font-bold text-[#afafaf] uppercase tracking-wide mt-1">Locked</span>}
      </div>
    </Card>
  );
}
