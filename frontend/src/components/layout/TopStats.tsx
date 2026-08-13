import * as React from "react";
import { StatPill } from "@/components/ui/StatPill";
import { Flame, Hexagon, Heart, Gem } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TopStatsProps {
  streak: number;
  xp: number;
  hearts: number;
  gems: number;
  className?: string;
}

export function TopStats({ streak, xp, hearts, gems, className }: TopStatsProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-16 w-full items-center justify-between bg-[#131f24] border-b border-[#2b3d47] px-4 lg:px-8",
        className
      )}
    >
      <div className="flex w-full max-w-4xl mx-auto items-center justify-between lg:justify-end gap-2 sm:gap-4">
        {/* We use specific fill colors and strokes to match Duolingo's vibrant style */}
        <StatPill
          icon={<Flame className="h-6 w-6 text-[#ff9600] fill-[#ff9600]" strokeWidth={2} />}
          value={streak}
          color="yellow"
          label="Streak"
        />
        <StatPill
          icon={<Hexagon className="h-6 w-6 text-[#1cb0f6] fill-[#1cb0f6]" strokeWidth={2} />}
          value={xp}
          color="blue"
          label="XP"
        />
        <StatPill
          icon={<Heart className="h-6 w-6 text-[#ff4b4b] fill-[#ff4b4b]" strokeWidth={2} />}
          value={hearts}
          color="red"
          label="Hearts"
        />
        <StatPill
          icon={<Gem className="h-6 w-6 text-[#1cb0f6] fill-[#1cb0f6]" strokeWidth={2} />}
          value={gems}
          color="blue"
          label="Gems"
        />
      </div>
    </header>
  );
}
