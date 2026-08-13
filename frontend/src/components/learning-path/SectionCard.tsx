"use client";

import { Mascot } from "@/components/illustrations/Mascot";
import { Lock, Trophy } from "lucide-react";

export interface SectionCardProps {
  sectionNumber: number;
  title?: string;
  description?: string;
  progressPercent?: number;
  isLocked?: boolean;
  unitCount?: number;
  targetLanguage?: string;
  onContinue?: () => void;
}

export function SectionCard({
  sectionNumber,
  description,
  progressPercent = 0,
  isLocked = false,
  unitCount = 3,
  targetLanguage = "English",
  onContinue
}: SectionCardProps) {
  // Dynamic objective descriptions based on section number if not explicitly passed
  const defaultDescriptions = [
    `I can participate in daily life in ${targetLanguage}.`,
    `I can express myself appropriately depending on the context in ${targetLanguage}.`,
    `I am able to discuss abstract topics, such as hopes, goals, and projects in ${targetLanguage}.`,
    `I feel comfortable in ${targetLanguage}, and I can express myself spontaneously on a variety of topics.`
  ];

  const objText = description || defaultDescriptions[(sectionNumber - 1) % defaultDescriptions.length];

  if (isLocked) {
    return (
      <div className="w-full bg-[#131f24] border-2 border-[#2b3d47] rounded-3xl p-6 relative flex flex-col md:flex-row items-center justify-between gap-6 opacity-85 hover:opacity-100 transition-opacity">
        <div className="flex flex-col gap-4 flex-1 w-full">
          <div>
            <h2 className="text-2xl font-black text-[#5f7582]">Section {sectionNumber}</h2>
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#5f7582] mt-1">
              <Lock className="h-4 w-4" />
              <span>{unitCount} UNITS</span>
            </div>
          </div>

          <button
            disabled
            className="w-full md:w-auto px-8 py-3 bg-[#182830] text-[#5f7582] border-2 border-[#2b3d47] font-extrabold text-sm tracking-wider uppercase rounded-2xl cursor-not-allowed"
          >
            JUMP TO SECTION {sectionNumber}
          </button>
        </div>

        {/* Speech Bubble & Mascot */}
        <div className="flex items-center gap-4">
          <div className="relative bg-[#182830] border-2 border-[#2b3d47] rounded-2xl p-4 max-w-xs text-sm font-bold text-[#afafaf] shadow-md">
            <p>{objText}</p>
            {/* Bubble Tail */}
            <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-[#182830]" />
          </div>

          <Mascot variant="waving" className="h-28 w-28 shrink-0 opacity-60 filter grayscale" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#182830] border-2 border-[#2b3d47] rounded-3xl p-6 relative flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
      <div className="flex flex-col gap-6 flex-1 w-full">
        <div>
          <h2 className="text-2xl font-black text-white">Section {sectionNumber}</h2>
          
          {/* Progress Bar with Percentage */}
          <div className="flex items-center gap-3 mt-3 max-w-xs">
            <div className="flex-1 h-3 bg-[#2b3d47] rounded-full overflow-hidden relative">
              <div
                className="h-full bg-[#58cc02] rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, progressPercent)}%` }}
              />
            </div>
            <span className="text-xs font-black text-[#58cc02]">{Math.round(progressPercent)}%</span>
            <Trophy className="h-5 w-5 text-[#ffc800]" />
          </div>
        </div>

        <button
          onClick={onContinue}
          className="w-full md:w-auto px-10 py-3.5 bg-[#1cb0f6] hover:bg-[#1899d6] text-white font-black text-sm tracking-widest uppercase rounded-2xl border-b-4 border-[#0081c9] active:border-b-0 transition-all cursor-pointer shadow-lg"
        >
          CONTINUE
        </button>
      </div>

      {/* Speech Bubble & Mascot */}
      <div className="flex items-center gap-4">
        <div className="relative bg-[#131f24] border-2 border-[#2b3d47] rounded-2xl p-4 max-w-xs text-sm font-extrabold text-white shadow-md">
          <p>{objText}</p>
          {/* Bubble Tail pointing to mascot */}
          <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-[#131f24]" />
        </div>

        <Mascot variant="happy" className="h-32 w-32 shrink-0 transform hover:scale-105 transition-transform" />
      </div>
    </div>
  );
}
