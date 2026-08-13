import * as React from "react";
import { Course } from "@/types/api";
import { MascotPlaceholder } from "@/components/illustrations/MascotPlaceholder";

export interface CourseHeaderProps {
  course: Course;
}

export function CourseHeader({ course }: CourseHeaderProps) {
  return (
    <section className="flex flex-col md:flex-row items-center gap-8 rounded-2xl bg-[#ddf4c5] p-8 border-2 border-[#58cc02]/20 mb-8">
      <MascotPlaceholder className="h-32 w-32 shrink-0 md:h-40 md:w-40" />
      <div className="flex flex-col items-center text-center md:items-start md:text-left">
        <h1 className="text-3xl font-bold text-[#3c3c3c]">
          {course.name} Course
        </h1>
        <p className="mt-2 text-lg text-[#777777]">
          {course.description || `Continue your journey in ${course.language}.`}
        </p>
      </div>
    </section>
  );
}
