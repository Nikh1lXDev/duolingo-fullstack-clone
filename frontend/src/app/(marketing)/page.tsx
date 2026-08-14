"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/illustrations/Logo";
import { Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import { Course } from "@/types/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LandingAnimation } from "@/components/illustrations/LandingAnimation";

const LANG_FLAGS: Record<string, string> = {
  Spanish: "🇪🇸", French: "🇫🇷", German: "🇩🇪", English: "🇬🇧",
  Hindi: "🇮🇳", Japanese: "🇯🇵", Korean: "🇰🇷", Italian: "🇮🇹",
  Portuguese: "🇵🇹", Chinese: "🇨🇳", Arabic: "🇸🇦", Russian: "🇷🇺",
  Dutch: "🇳🇱", Turkish: "🇹🇷",
};

export default function LandingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const carouselRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (user?.settings?.onboarding_completed) {
        router.push("/learn");
      } else {
        router.push("/onboarding/course");
      }
    }
  }, [isAuthenticated, loading, user, router]);

  useEffect(() => {
    api.getCourses().then(setCourses).catch(console.error);
  }, []);

  // Get distinct target languages for the carousel
  const targetLanguages = Array.from(new Set(courses.map(c => c.target_language))).filter(Boolean) as string[];

  const scrollCarousel = (dir: "left" | "right") => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#131f24] text-white overflow-x-hidden">
      {/* Header */}
      <header className="flex h-16 sm:h-20 items-center justify-between px-4 sm:px-8 max-w-[1100px] w-full mx-auto">
        <Logo className="h-8 sm:h-10 w-auto text-[#58cc02]" />
        
        <button className="flex items-center gap-2 text-[#afafaf] font-bold text-sm sm:text-base hover:text-white transition-colors uppercase tracking-wider border border-[#2b3d47] rounded-lg px-3 py-1.5 hover:border-[#5f7582]">
          <Globe className="h-4 w-4" />
          <span>ENGLISH</span>
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 max-w-[1100px] w-full">
          
          {/* Animation — left on desktop, top on mobile */}
          <div className="w-full max-w-[380px] h-[340px] sm:h-[420px] md:w-[420px] md:h-[460px] relative shrink-0 order-1 md:order-1">
            <LandingAnimation />
          </div>

          {/* Content — right on desktop, bottom on mobile */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-6 md:gap-8 max-w-[480px] order-2 md:order-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              The most fun way to learn languages, chess, and more!
            </h1>
            
            <div className="flex flex-col gap-3 w-full max-w-[340px]">
              <Link href="/signup" className="w-full">
                <Button
                  size="lg"
                  className="w-full text-base sm:text-lg tracking-widest font-extrabold h-14 uppercase"
                >
                  GET STARTED
                </Button>
              </Link>
              <Link href="/login" className="w-full">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full text-base sm:text-lg tracking-widest font-extrabold h-14 bg-transparent border-2 border-[#2b3d47] text-[#1cb0f6] hover:bg-[#182830] hover:border-[#3a5568] uppercase"
                >
                  I ALREADY HAVE AN ACCOUNT
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* Course Carousel Footer */}
      <footer className="border-t-2 border-[#2b3d47] bg-[#182830] py-5 sm:py-6 mt-auto">
        <div className="max-w-[1100px] mx-auto px-4">
          <p className="text-xs font-bold uppercase text-[#5f7582] tracking-widest mb-4 text-center sm:text-left">
            Learn any language
          </p>
          <div className="relative flex items-center gap-2">
            {targetLanguages.length > 5 && (
              <button
                onClick={() => scrollCarousel("left")}
                className="shrink-0 p-1.5 rounded-full bg-[#2b3d47] hover:bg-[#3a5568] transition-colors text-white"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            <div
              ref={carouselRef}
              className="flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar flex-1"
            >
              {targetLanguages.length > 0 ? (
                targetLanguages.map(lang => (
                  <button
                    key={lang}
                    className="flex items-center gap-2 text-sm font-bold uppercase text-[#afafaf] whitespace-nowrap hover:text-white transition-colors cursor-pointer tracking-wider shrink-0 group"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">
                      {LANG_FLAGS[lang] ?? "🌐"}
                    </span>
                    {lang}
                  </button>
                ))
              ) : (
                // Skeleton placeholders while loading
                ["SPANISH", "FRENCH", "GERMAN", "ENGLISH", "HINDI", "JAPANESE"].map(lang => (
                  <div key={lang} className="text-sm font-bold uppercase text-[#2b3d47] whitespace-nowrap tracking-wider shrink-0">
                    {lang}
                  </div>
                ))
              )}
            </div>
            {targetLanguages.length > 5 && (
              <button
                onClick={() => scrollCarousel("right")}
                className="shrink-0 p-1.5 rounded-full bg-[#2b3d47] hover:bg-[#3a5568] transition-colors text-white"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
