"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LearningPath as LearningPathType, LearningPathSkill } from "@/types/api";
import { SectionCard } from "./SectionCard";
import { UnitSection } from "./UnitSection";
import { SkillPreviewModal } from "./SkillPreviewModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { BookOpen, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";

export interface LearningPathProps {
  data: LearningPathType;
  onStartLesson?: () => void;
}

export function LearningPath({ data, onStartLesson }: LearningPathProps) {
  const router = useRouter();
  const [selectedSkill, setSelectedSkill] = React.useState<LearningPathSkill | null>(null);

  if (!data.units || data.units.length === 0) {
    return (
      <EmptyState
        title="No Units Found"
        description="This course doesn't have any units yet."
        icon={<BookOpen className="h-12 w-12 text-[#5f7582]" />}
      />
    );
  }

  // Calculate overall course/section progress
  let totalSkills = 0;
  let completedSkills = 0;
  let activeSkillId = data.units[0]?.skills[0]?.id || 1;

  data.units.forEach((unit) => {
    unit.skills.forEach((skill) => {
      totalSkills++;
      if (skill.progress === 100) {
        completedSkills++;
      } else if (!skill.locked && activeSkillId === 1) {
        activeSkillId = skill.id;
      }
    });
  });

  const progressPercent = totalSkills > 0 ? (completedSkills / totalSkills) * 100 : 0;
  const targetLanguage = data.course?.target_language || "English";

  const handleContinueLesson = async () => {
    if (onStartLesson) {
      onStartLesson();
      return;
    }

    try {
      const lesson = await api.getNextLesson(activeSkillId);
      if (lesson && lesson.id) {
        router.push(`/lesson/${lesson.id}`);
      } else {
        router.push("/lesson/1");
      }
    } catch {
      router.push("/lesson/1");
    }
  };

  return (
    <div className="flex flex-col w-full pb-12 gap-8">
      {/* Top Header Back Bar */}
      <div className="flex items-center gap-3 text-[#5f7582] hover:text-white transition-colors cursor-pointer w-fit" onClick={() => router.back()}>
        <ArrowLeft className="h-5 w-5 stroke-[3]" />
        <span className="font-extrabold text-base tracking-wide">Back</span>
      </div>

      {/* Main Section Cards (Matching Attached Reference Screenshot) */}
      <div className="flex flex-col gap-6">
        {/* Section 1 (Active) */}
        <SectionCard
          sectionNumber={1}
          progressPercent={progressPercent}
          isLocked={false}
          targetLanguage={targetLanguage}
          onContinue={handleContinueLesson}
        />

        {/* Section 2 (Locked Preview) */}
        <SectionCard
          sectionNumber={2}
          isLocked={true}
          unitCount={3}
          targetLanguage={targetLanguage}
        />

        {/* Section 3 (Locked Preview) */}
        <SectionCard
          sectionNumber={3}
          isLocked={true}
          unitCount={4}
          targetLanguage={targetLanguage}
        />
      </div>

      {/* Unit Skill Paths */}
      <div className="flex flex-col gap-6 mt-4">
        {data.units.map((unit, index) => (
          <UnitSection 
            key={unit.id} 
            unit={unit} 
            index={index} 
            onSkillClick={(skill) => setSelectedSkill(skill)}
          />
        ))}
      </div>

      <SkillPreviewModal 
        skill={selectedSkill}
        isOpen={!!selectedSkill}
        onClose={() => setSelectedSkill(null)}
      />
    </div>
  );
}
