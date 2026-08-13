"use client";

import * as React from "react";
import { LearningPathUnit, LearningPathSkill } from "@/types/api";
import { SkillNode } from "./SkillNode";
import { PathConnector } from "./PathConnector";
import { Mascot } from "@/components/illustrations/Mascot";
import { BookOpen } from "lucide-react";

export interface UnitSectionProps {
  unit: LearningPathUnit;
  onSkillClick: (skill: LearningPathSkill) => void;
  index: number;
}

export function UnitSection({ unit, onSkillClick, index }: UnitSectionProps) {
  const bgColors = ["bg-[#58cc02]", "bg-[#1cb0f6]", "bg-[#ce82ff]"];
  const bgColor = bgColors[index % bgColors.length];
  
  return (
    <section className="relative w-full mb-10">
      {/* Unit Header (Matching Attached Reference Screenshot 5) */}
      <div className={`w-full rounded-3xl p-6 text-white ${bgColor} shadow-xl mb-8 relative overflow-hidden`}>
        <div className="flex items-center justify-between gap-4 z-10 relative">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-black tracking-widest uppercase opacity-90">
              SECTION 1, UNIT {unit.order_index}
            </span>
            <h2 className="text-xl md:text-2xl font-black">{unit.title}</h2>
            {unit.description && <p className="text-sm mt-1 font-bold opacity-90">{unit.description}</p>}
          </div>

          <button className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl text-xs font-black tracking-wider uppercase border border-white/40 transition-all shrink-0 cursor-pointer">
            <BookOpen className="h-4 w-4" />
            <span>GUIDEBOOK</span>
          </button>
        </div>
      </div>
      
      {/* Skills Path */}
      <div className="relative flex flex-col items-center py-6 w-full max-w-sm mx-auto">
        {/* Mascot standing beside path */}
        <div className="absolute right-[-40px] top-12 hidden md:block">
          <Mascot variant="happy" className="h-32 w-32" />
        </div>

        {unit.skills.map((skill, i) => {
          const cycle = i % 8;
          const nextCycle = (i + 1) % 8;
          
          const offsets = [0, 1, 2, 1, 0, -1, -2, -1];
          const currPos = offsets[cycle];
          const nextPos = i < unit.skills.length - 1 ? offsets[nextCycle] : 0;
          
          let direction: "straight" | "left" | "right" = "straight";
          if (nextPos > currPos) direction = "right";
          if (nextPos < currPos) direction = "left";

          const isNextActive = i < unit.skills.length - 1 && 
            (unit.skills[i+1].progress > 0 || !unit.skills[i+1].locked);
            
          return (
            <React.Fragment key={skill.id}>
              <SkillNode skill={skill} index={i} onClick={onSkillClick} />
              {i < unit.skills.length - 1 && (
                <PathConnector 
                  direction={direction} 
                  isActive={isNextActive || (!skill.locked && skill.progress === 100)} 
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}
