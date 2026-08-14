"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Course } from "@/types/api";
import { useAuth } from "@/context/AuthContext";
import { PageTransition } from "@/components/motion/PageTransition";
import { QuestionOption } from "@/components/ui/QuestionOption";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SourceLanguagePage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [targetLanguage, setTargetLanguage] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/signup");
      return;
    }

    if (isAuthenticated) {
      const savedTarget = sessionStorage.getItem("onboarding_target_language");
      if (!savedTarget) {
        router.replace("/onboarding/course");
        return;
      }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTargetLanguage(savedTarget);

      api.getCourses()
        .then(allCourses => {
          const availableCourses = allCourses.filter(c => c.target_language === savedTarget);
          setCourses(availableCourses);
        })
        .catch(() => setError("Failed to load courses."))
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated, authLoading, router]);

  const handleContinue = () => {
    if (selectedCourseId) {
      sessionStorage.setItem("onboarding_course_id", selectedCourseId.toString());
      router.push("/onboarding/proficiency");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#131f24]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2b3d47] border-t-[#1cb0f6]"></div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="flex min-h-screen flex-col bg-[#131f24] text-white">
        <header className="flex h-16 items-center px-4 max-w-2xl w-full mx-auto relative justify-center">
          <Link href="/onboarding/course" className="absolute left-4 text-[#afafaf] hover:text-white transition-colors">
            <ArrowLeft className="h-6 w-6" strokeWidth={2.5} />
          </Link>
          <div className="w-full bg-[#2b3d47] h-4 rounded-full overflow-hidden max-w-[200px]">
            <div className="bg-[#58cc02] h-full w-[40%] transition-all rounded-full" />
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center px-4 py-8 pb-32 max-w-2xl w-full mx-auto">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-8 text-center">
            What language do you speak?
          </h1>

          {error ? (
            <p className="text-[#ff4b4b] font-bold">{error}</p>
          ) : courses.length === 0 ? (
            <div className="text-center">
              <p className="text-[#afafaf] font-bold text-lg">
                Sorry, there are no courses teaching {targetLanguage} available right now.
              </p>
              <Link href="/onboarding/course">
                <Button className="mt-8">GO BACK</Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4 w-full">
              {courses.map(course => (
                <QuestionOption
                  key={course.id}
                  state={selectedCourseId === course.id ? "selected" : "default"}
                  variant="dark"
                  onClick={() => setSelectedCourseId(course.id)}
                  className="justify-start gap-4 h-[72px]"
                >
                  <div className="h-10 w-12 shrink-0 bg-[#2b3d47] rounded flex items-center justify-center font-bold text-xs uppercase text-[#afafaf]">
                    {course.source_language?.substring(0, 2)}
                  </div>
                  <span className="text-lg">{course.source_language || course.name}</span>
                </QuestionOption>
              ))}
            </div>
          )}
        </main>

        <div className="fixed bottom-0 left-0 right-0 border-t-2 border-[#2b3d47] bg-[#131f24] p-4 sm:p-6 z-50">
          <div className="max-w-2xl mx-auto flex justify-end">
            <Button 
              size="lg"
              disabled={!selectedCourseId}
              onClick={handleContinue}
              className="w-full sm:w-[150px] uppercase font-extrabold tracking-widest"
            >
              CONTINUE
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
