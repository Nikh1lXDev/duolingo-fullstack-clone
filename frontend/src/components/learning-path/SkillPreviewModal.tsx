import * as React from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { LearningPathSkill } from "@/types/api";
import { api } from "@/lib/api";

export interface SkillPreviewModalProps {
  skill: LearningPathSkill | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SkillPreviewModal({ skill, isOpen, onClose }: SkillPreviewModalProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!skill) return null;

  const handleStartLesson = async () => {
    try {
      setLoading(true);
      setError(null);
      const lesson = await api.getNextLesson(skill.id);
      router.push(`/lesson/${lesson.id}`);
    } catch {
      console.error("Failed to fetch next lesson data");
      setError("Unable to find the next lesson for this skill.");
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={skill.title}>
      <div className="flex flex-col gap-6">
        <p className="text-[#777777]">
          {skill.description || "Complete lessons to level up this skill."}
        </p>
        
        <div className="flex justify-between items-center bg-[#f7f7f7] rounded-xl p-4">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-[#afafaf] uppercase tracking-wide">Progress</span>
            <span className="text-xl font-bold text-[#3c3c3c]">{skill.progress}%</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-sm font-bold text-[#afafaf] uppercase tracking-wide">Crowns</span>
            <span className="text-xl font-bold text-[#ffc800]">{skill.crowns}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          {skill.locked ? (
            <div className="text-center text-[#ff4b4b] font-bold p-3 bg-[#ff4b4b]/10 rounded-xl">
              This skill is locked. Complete previous skills first!
            </div>
          ) : (
            <>
              {error && (
                <div className="text-center text-[#ff4b4b] font-bold p-3 bg-[#ff4b4b]/10 rounded-xl">
                  {error}
                </div>
              )}
            <Button 
              size="lg" 
              className="w-full" 
              onClick={handleStartLesson}
              disabled={loading}
            >
              {loading ? "LOADING..." : "START LESSON"}
            </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
