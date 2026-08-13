import * as React from "react";
import { LearningPathUnit, LearningPathSkill } from "@/types/api";
import { SkillNode } from "./SkillNode";
import { PathConnector } from "./PathConnector";

export interface UnitSectionProps {
  unit: LearningPathUnit;
  onSkillClick: (skill: LearningPathSkill) => void;
  index: number;
}

export function UnitSection({ unit, onSkillClick, index }: UnitSectionProps) {
  const bgColors = ["bg-[#58cc02]", "bg-[#1cb0f6]", "bg-[#ce82ff]"];
  const bgColor = bgColors[index % bgColors.length];
  
  return (
    <section className="relative w-full mb-8">
      {/* Unit Header Header */}
      <div className={`w-full rounded-3xl p-5 md:p-6 text-white ${bgColor} shadow-lg mb-6`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-black">Unit {unit.order_index}</h2>
            <p className="text-sm md:text-base font-extrabold opacity-95">{unit.title}</p>
            {unit.description && <p className="text-sm mt-1 opacity-85 font-bold">{unit.description}</p>}
          </div>
        </div>
      </div>
      
      {/* Skills Path */}
      <div className="flex flex-col items-center py-6 w-full max-w-sm mx-auto">
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
