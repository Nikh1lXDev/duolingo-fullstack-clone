"use client";

import { useEffect, useState, useCallback } from "react";
import { PageTransition } from "@/components/motion/PageTransition";
import { Card } from "@/components/ui/Card";
import { Volume2, Bell, Globe } from "lucide-react";
import { api } from "@/lib/api";
import type { UserSettings } from "@/types/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: "success" | "error" } | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.getSettings();
      setSettings(res);
    } catch {
      console.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = async (key: keyof UserSettings, value: boolean | string) => {
    if (!settings) return;
    
    const newSettings = { ...settings, [key]: value };
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.updateSettings(newSettings);
      setSettings(res);
      setMessage({ text: "Settings saved!", type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ text: (err as Error).message || "Failed to save settings.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e5e5e5] border-t-[#1cb0f6]"></div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <ProtectedRoute>
      <PageTransition>
      <div className="flex flex-col gap-6 py-8 pb-32">
        <h1 className="text-2xl font-bold uppercase tracking-wide border-b-2 border-[#e5e5e5] pb-4">
          Settings
        </h1>

        {message && (
          <div className={`p-4 rounded-xl font-bold ${message.type === "success" ? "bg-[#58cc02]/20 text-[#58cc02]" : "bg-[#ff4b4b]/20 text-[#ff4b4b]"}`}>
            {message.text}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <Card padding="md" className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1cb0f6]/20 text-[#1cb0f6]">
                <Volume2 className="h-6 w-6 fill-current" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Sound Effects</h3>
                <p className="text-sm font-bold text-[#afafaf]">Play sounds during lessons</p>
              </div>
            </div>
            <button 
              disabled={saving}
              onClick={() => updateSetting("sound_enabled", !settings.sound_enabled)}
              className={`w-14 h-8 rounded-full transition-colors relative ${settings.sound_enabled ? "bg-[#1cb0f6]" : "bg-[#e5e5e5]"}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${settings.sound_enabled ? "translate-x-7" : "translate-x-1"}`} />
            </button>
          </Card>

          <Card padding="md" className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#ce82ff]/20 text-[#ce82ff]">
                <Bell className="h-6 w-6 fill-current" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Notifications</h3>
                <p className="text-sm font-bold text-[#afafaf]">Daily reminders and streak savers</p>
              </div>
            </div>
            <button 
              disabled={saving}
              onClick={() => updateSetting("notifications_enabled", !settings.notifications_enabled)}
              className={`w-14 h-8 rounded-full transition-colors relative ${settings.notifications_enabled ? "bg-[#1cb0f6]" : "bg-[#e5e5e5]"}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${settings.notifications_enabled ? "translate-x-7" : "translate-x-1"}`} />
            </button>
          </Card>

          <Card padding="md" className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#58cc02]/20 text-[#58cc02]">
                <Globe className="h-6 w-6 fill-current" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Course Language</h3>
                <p className="text-sm font-bold text-[#afafaf]">Your target language</p>
              </div>
            </div>
            <select 
              disabled={saving}
              value={settings.course_language}
              onChange={(e) => updateSetting("course_language", e.target.value)}
              className="border-2 border-[#e5e5e5] rounded-xl font-bold px-4 py-2 text-[#777777] bg-white"
            >
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </Card>
        </div>
      </div>
    </PageTransition>
    </ProtectedRoute>
  );
}
