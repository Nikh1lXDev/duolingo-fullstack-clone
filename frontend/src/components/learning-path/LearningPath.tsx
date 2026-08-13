import * as React from "react";
import { LearningPath as LearningPathType, LearningPathSkill } from "@/types/api";
import { CourseHeader } from "./CourseHeader";
import { UnitSection } from "./UnitSection";
import { SkillPreviewModal } from "./SkillPreviewModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { BookOpen } from "lucide-react";

export interface LearningPathProps {
  data: LearningPathType;
}

export function LearningPath({ data }: LearningPathProps) {
  const [selectedSkill, setSelectedSkill] = React.useState<LearningPathSkill | null>(null);

  if (!data.units || data.units.length === 0) {
    return (
      <EmptyState
        title="No Units Found"
        description="This course doesn't have any units yet."
        icon={<BookOpen className="h-12 w-12 text-[#afafaf]" />}
      />
    );
  }

  return (
    <div className="flex flex-col w-full pb-12">
      <CourseHeader course={data.course} />
      
      <div className="flex flex-col">
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
