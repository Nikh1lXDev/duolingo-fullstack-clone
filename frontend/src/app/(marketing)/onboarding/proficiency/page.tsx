"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageTransition } from "@/components/motion/PageTransition";
import { QuestionOption } from "@/components/ui/QuestionOption";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

const PROFICIENCY_LEVELS = [
  { id: "new", title: "I'm new to ", icon: "🌱", suffix: true },
  { id: "few_words", title: "I know a few words", icon: "📖" },
  { id: "simple", title: "I can understand simple sentences", icon: "💬" },
  { id: "conversations", title: "I can have basic conversations", icon: "🗣️" },
  { id: "comfortable", title: "I can discuss most topics", icon: "⭐" },
];

export default function ProficiencyPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, refreshUser } = useAuth();
  
  const [targetLanguage, setTargetLanguage] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [showStartChoice, setShowStartChoice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/signup");
      return;
    }

    if (isAuthenticated) {
      const savedTarget = sessionStorage.getItem("onboarding_target_language");
      const savedCourseId = sessionStorage.getItem("onboarding_course_id");
      
      if (!savedTarget || !savedCourseId) {
        router.replace("/onboarding/course");
        return;
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTargetLanguage(savedTarget);
    }
  }, [isAuthenticated, authLoading, router]);

  const handleContinue = () => {
    if (selectedLevel) {
      setShowStartChoice(true);
    }
  };

  const handleStartFromScratch = async () => {
    setIsSubmitting(true);
    try {
      const courseId = sessionStorage.getItem("onboarding_course_id");
      if (courseId) {
        await api.updateSettings({
          course_id: parseInt(courseId, 10),
          proficiency_level: selectedLevel || "new",
          starting_level: "beginner",
          placement_completed: false,
          onboarding_completed: true,
        });
        await refreshUser();
        router.push("/learn");
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const handleFindMyLevel = () => {
    sessionStorage.setItem("onboarding_proficiency", selectedLevel || "new");
    router.push("/onboarding/placement");
  };

  if (!targetLanguage) return null; // loading state essentially

  return (
    <PageTransition>
      <div className="flex min-h-screen flex-col bg-[#131f24] text-white">
        <header className="flex h-16 items-center px-4 max-w-2xl w-full mx-auto relative justify-center">
          {!showStartChoice ? (
            <Link href="/onboarding/source-language" className="absolute left-4 text-[#afafaf] hover:text-white transition-colors">
              <ArrowLeft className="h-6 w-6" strokeWidth={2.5} />
            </Link>
          ) : (
            <button onClick={() => setShowStartChoice(false)} className="absolute left-4 text-[#afafaf] hover:text-white transition-colors">
              <ArrowLeft className="h-6 w-6" strokeWidth={2.5} />
            </button>
          )}
          <div className="w-full bg-[#2b3d47] h-4 rounded-full overflow-hidden max-w-[200px]">
            <div className="bg-[#58cc02] h-full transition-all rounded-full" style={{ width: showStartChoice ? '80%' : '60%' }} />
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center px-4 py-8 pb-32 max-w-2xl w-full mx-auto">
          {!showStartChoice ? (
            <>
              <div className="flex items-center gap-4 mb-8 self-start">
                <div className="h-20 w-20 relative">
                  <div className="absolute inset-0 bg-[url('/illustrations/mascot.svg')] bg-contain bg-center bg-no-repeat drop-shadow-lg" />
                </div>
                <div className="bg-white text-[#4b4b4b] rounded-2xl rounded-tl-none p-4 font-bold text-lg shadow-sm border-2 border-[#e5e5e5]">
                  How much {targetLanguage} do you know?
                </div>
              </div>

              <div className="flex flex-col gap-4 w-full">
                {PROFICIENCY_LEVELS.map(level => (
                  <QuestionOption
                    key={level.id}
                    state={selectedLevel === level.id ? "selected" : "default"}
                    variant="dark"
                    onClick={() => setSelectedLevel(level.id)}
                    className="justify-start gap-4 h-[72px]"
                  >
                    <div className="text-2xl w-8 text-center">{level.icon}</div>
                    <span className="text-lg">
                      {level.title}{level.suffix ? targetLanguage : ""}
                    </span>
                  </QuestionOption>
                ))}
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-8 text-center">
                Where would you like to start?
              </h1>
              
              <div className="flex flex-col gap-4 w-full">
                <QuestionOption
                  state="default"
                  variant="dark"
                  onClick={handleStartFromScratch}
                  disabled={isSubmitting}
                  className="flex-col items-center justify-center gap-2 h-auto py-6"
                >
                  <span className="font-bold tracking-wider text-xl uppercase">Start from scratch</span>
                  <span className="text-[#afafaf] font-bold text-center text-sm">Learn the basics of {targetLanguage}</span>
                </QuestionOption>

                <QuestionOption
                  state="default"
                  variant="dark"
                  onClick={handleFindMyLevel}
                  disabled={isSubmitting}
                  className="flex-col items-center justify-center gap-2 h-auto py-6"
                >
                  <span className="font-bold tracking-wider text-xl uppercase text-[#1cb0f6]">Find my level</span>
                  <span className="text-[#afafaf] font-bold text-center text-sm">Take a short test to jump ahead</span>
                </QuestionOption>
              </div>
            </>
          )}
        </main>

        {!showStartChoice && (
          <div className="fixed bottom-0 left-0 right-0 border-t-2 border-[#2b3d47] bg-[#131f24] p-4 sm:p-6 z-50">
            <div className="max-w-2xl mx-auto flex justify-end">
              <Button 
                size="lg"
                disabled={!selectedLevel}
                onClick={handleContinue}
                className="w-full sm:w-[150px] uppercase font-extrabold tracking-widest"
              >
                CONTINUE
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
