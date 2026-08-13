"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Crown, Lock, Star } from "lucide-react";
import { LearningPathSkill } from "@/types/api";
import { motion, Variants } from "framer-motion";

export interface SkillNodeProps {
  skill: LearningPathSkill;
  onClick: (skill: LearningPathSkill) => void;
  index: number;
}

export function SkillNode({ skill, onClick, index }: SkillNodeProps) {
  // Determine meandering offset: 0, 1, 2, 1, 0, -1, -2, -1, etc.
  const cycle = index % 8;
  const offsets = [0, 1, 2, 1, 0, -1, -2, -1];
  const offsetMultiplier = offsets[cycle];
  const translateX = `${offsetMultiplier * 20}px`;

  const isCompleted = skill.progress >= 100 && !skill.locked;
  const isInProgress = skill.progress > 0 && skill.progress < 100 && !skill.locked;
  const isAvailable = skill.progress === 0 && !skill.locked;

  // Visual variants based on state
  let bgColor = "bg-[#e5e5e5]";
  let iconColor = "text-[#afafaf]";
  let ringColor: "brand" | "blue" | "yellow" = "brand";
  
  if (isCompleted) {
    bgColor = "bg-[#ffc800]";
    iconColor = "text-white";
    ringColor = "yellow";
  } else if (isInProgress) {
    bgColor = "bg-[#58cc02]";
    iconColor = "text-white";
    ringColor = "brand";
  } else if (isAvailable) {
    bgColor = "bg-[#58cc02]";
    iconColor = "text-white";
    ringColor = "brand";
  }

  // Animation variants
  const nodeVariants: Variants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  const availablePulse: Variants = {
    initial: { scale: 1 },
    animate: { 
      scale: [1, 1.05, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    }
  };

  return (
    <div 
      className="relative flex w-full justify-center py-4"
      style={{ transform: `translateX(${translateX})` }}
    >
      {/* Crown indicator for completed or in-progress */}
      {(isCompleted || isInProgress || skill.crowns > 0) && (
        <div className="absolute -top-1 right-[calc(50%-45px)] z-10 flex items-center justify-center rounded-full bg-white px-2 py-1 shadow-sm border-2 border-[#e5e5e5]">
          <Crown className="mr-1 h-3 w-3 text-[#ffc800] fill-[#ffc800]" />
          <span className="text-xs font-bold text-[#ffc800]">{skill.crowns}</span>
        </div>
      )}

      <motion.button
        onClick={() => onClick(skill)}
        variants={nodeVariants}
        whileHover={!skill.locked ? "hover" : ""}
        whileTap={!skill.locked ? "tap" : ""}
        className={cn(
          "relative flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1cb0f6]",
          skill.locked ? "cursor-not-allowed opacity-80" : "cursor-pointer"
        )}
        aria-label={`${skill.title} - ${skill.locked ? "Locked" : `${skill.progress}% completed`}`}
      >
        <ProgressRing 
          value={skill.locked ? 0 : skill.progress} 
          size={90} 
          strokeWidth={8} 
          color={ringColor}
        >
          <motion.div 
            variants={isAvailable ? availablePulse : undefined}
            initial="initial"
            animate={isAvailable ? "animate" : undefined}
            className={cn(
              "flex h-[74px] w-[74px] items-center justify-center rounded-full border-b-4 border-black/20",
              bgColor
            )}
          >
            {skill.locked ? (
              <Lock className={cn("h-8 w-8", iconColor, "fill-current")} />
            ) : isCompleted ? (
              <Crown className={cn("h-10 w-10", iconColor, "fill-current")} />
            ) : (
              <Star className={cn("h-8 w-8", iconColor, "fill-current")} />
            )}
          </motion.div>
        </ProgressRing>
      </motion.button>
    </div>
  );
}
