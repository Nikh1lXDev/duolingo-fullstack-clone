"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { AvatarPreview, AvatarConfig, DEFAULT_AVATAR_CONFIG, SKIN_TONES, HAIR_OPTIONS, HAIR_COLORS, EYE_OPTIONS, MOUTH_OPTIONS, ACCESSORY_OPTIONS, CLOTHING_OPTIONS, CLOTHING_COLORS } from "@/components/illustrations/AvatarPreview";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Link from "next/link";
import { motion } from "framer-motion";

type TabKey = "skin" | "hair" | "hairColor" | "eyes" | "mouth" | "accessory" | "clothing" | "clothingColor";

const TABS: { key: TabKey; label: string; emoji: string }[] = [
  { key: "skin",         label: "Skin",     emoji: "🎨" },
  { key: "hair",         label: "Hair",     emoji: "💇" },
  { key: "hairColor",    label: "Hair Color", emoji: "🌈" },
  { key: "eyes",         label: "Eyes",     emoji: "👁️" },
  { key: "mouth",        label: "Mouth",    emoji: "😊" },
  { key: "accessory",    label: "Accessory",emoji: "🕶️" },
  { key: "clothing",     label: "Clothing", emoji: "👕" },
  { key: "clothingColor",label: "Color",    emoji: "🎭" },
];

export default function AvatarPage() {
  const router = useRouter();
  const [config, setConfig] = useState<AvatarConfig>(DEFAULT_AVATAR_CONFIG);
  const [activeTab, setActiveTab] = useState<TabKey>("skin");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Load existing avatar on mount
  useEffect(() => {
    api.getSettings()
      .then(settings => {
        if (settings.avatar_config) {
          try {
            const parsed = JSON.parse(settings.avatar_config);
            setConfig({ ...DEFAULT_AVATAR_CONFIG, ...parsed });
          } catch {
            // corrupt, use default
          }
        }
      })
      .catch(() => setLoadError(true));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await api.updateSettings({ avatar_config: JSON.stringify(config) });
      setSaved(true);
      window.dispatchEvent(new Event("sync-user-stats"));
      setTimeout(() => {
        router.push("/profile");
      }, 800);
    } catch {
      // still navigate
      router.push("/profile");
    } finally {
      setSaving(false);
    }
  }, [config, router]);

  const update = (key: keyof AvatarConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-[#131f24] text-white">
        {/* Header */}
        <header className="flex items-center px-4 h-16 border-b border-[#2b3d47] gap-4">
          <Link href="/profile" className="text-[#afafaf] hover:text-white transition-colors flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-extrabold text-white tracking-wide">Create Avatar</h1>
        </header>

        {loadError && (
          <div className="mx-4 mt-4 p-3 rounded-xl bg-[#ff4b4b]/20 text-[#ff8080] text-sm font-bold">
            Could not load saved avatar. Using defaults.
          </div>
        )}

        <div className="flex flex-col lg:flex-row flex-1 gap-0">
          {/* Avatar Preview (Left) */}
          <div className="lg:w-[380px] flex flex-col items-center justify-center bg-[#182830] border-b lg:border-b-0 lg:border-r border-[#2b3d47] p-8">
            <motion.div
              key={JSON.stringify(config)}
              initial={{ scale: 0.97 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.15 }}
            >
              <AvatarPreview config={config} size={220} />
            </motion.div>
            <p className="mt-4 text-sm font-bold text-[#5f7582] text-center">
              Preview updates instantly
            </p>
          </div>

          {/* Customization Panel (Right) */}
          <div className="flex-1 flex flex-col">
            {/* Tab Bar */}
            <div className="flex overflow-x-auto border-b border-[#2b3d47] bg-[#182830] no-scrollbar">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex flex-col items-center px-4 py-3 gap-1 text-xs font-bold whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab.key
                      ? "border-[#1cb0f6] text-[#1cb0f6]"
                      : "border-transparent text-[#5f7582] hover:text-white"
                  }`}
                >
                  <span className="text-lg">{tab.emoji}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === "skin" && (
                <ColorGrid
                  title="Skin tone"
                  colors={SKIN_TONES}
                  selected={config.skinTone ?? DEFAULT_AVATAR_CONFIG.skinTone!}
                  onSelect={v => update("skinTone", v)}
                />
              )}
              {activeTab === "hair" && (
                <OptionGrid
                  title="Hair style"
                  options={HAIR_OPTIONS}
                  selected={config.hair ?? "none"}
                  onSelect={v => update("hair", v)}
                />
              )}
              {activeTab === "hairColor" && (
                <ColorGrid
                  title="Hair color"
                  colors={HAIR_COLORS}
                  selected={config.hairColor ?? DEFAULT_AVATAR_CONFIG.hairColor!}
                  onSelect={v => update("hairColor", v)}
                />
              )}
              {activeTab === "eyes" && (
                <OptionGrid
                  title="Eyes"
                  options={EYE_OPTIONS}
                  selected={config.eyes ?? "normal"}
                  onSelect={v => update("eyes", v)}
                />
              )}
              {activeTab === "mouth" && (
                <OptionGrid
                  title="Mouth"
                  options={MOUTH_OPTIONS}
                  selected={config.mouth ?? "smile"}
                  onSelect={v => update("mouth", v)}
                />
              )}
              {activeTab === "accessory" && (
                <OptionGrid
                  title="Accessory"
                  options={ACCESSORY_OPTIONS}
                  selected={config.accessory ?? "none"}
                  onSelect={v => update("accessory", v)}
                />
              )}
              {activeTab === "clothing" && (
                <OptionGrid
                  title="Clothing"
                  options={CLOTHING_OPTIONS}
                  selected={config.clothing ?? "shirt"}
                  onSelect={v => update("clothing", v)}
                />
              )}
              {activeTab === "clothingColor" && (
                <ColorGrid
                  title="Clothing color"
                  colors={CLOTHING_COLORS}
                  selected={config.clothingColor ?? DEFAULT_AVATAR_CONFIG.clothingColor!}
                  onSelect={v => update("clothingColor", v)}
                />
              )}
            </div>

            {/* Save Button */}
            <div className="border-t border-[#2b3d47] bg-[#182830] p-4 flex gap-3">
              <Button
                size="lg"
                className="flex-1 uppercase font-extrabold tracking-widest"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "SAVING..." : saved ? "✓ SAVED!" : "DONE"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function ColorGrid({ title, colors, selected, onSelect }: {
  title: string;
  colors: string[];
  selected: string;
  onSelect: (color: string) => void;
}) {
  return (
    <div>
      <h2 className="text-base font-extrabold text-white mb-4">{title}</h2>
      <div className="grid grid-cols-6 sm:grid-cols-8 gap-3">
        {colors.map(color => (
          <button
            key={color}
            onClick={() => onSelect(color)}
            className={`relative w-11 h-11 rounded-xl border-2 transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1cb0f6] ${
              selected === color
                ? "border-[#1cb0f6] scale-110 shadow-[0_0_8px_rgba(28,176,246,0.5)]"
                : "border-[#2b3d47] hover:border-[#5f7582]"
            }`}
            style={{ backgroundColor: color }}
            aria-pressed={selected === color}
            aria-label={color}
          >
            {selected === color && (
              <span className="absolute inset-0 flex items-center justify-center text-white font-black text-sm drop-shadow">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function OptionGrid({ title, options, selected, onSelect }: {
  title: string;
  options: { key: string; label: string }[];
  selected: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div>
      <h2 className="text-base font-extrabold text-white mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {options.map(opt => (
          <button
            key={opt.key}
            onClick={() => onSelect(opt.key)}
            className={`rounded-2xl border-2 border-b-4 px-4 py-4 text-sm font-bold text-center transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1cb0f6] ${
              selected === opt.key
                ? "border-[#1cb0f6] bg-[#1cb0f6]/15 text-white"
                : "border-[#2b3d47] bg-[#182830] text-[#afafaf] hover:bg-[#1e3340] hover:text-white"
            }`}
            aria-pressed={selected === opt.key}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
