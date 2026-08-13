"use client";

import * as React from "react";
import { api } from "@/lib/api";
import { LearningPath as LearningPathType } from "@/types/api";
import { LearningPath } from "./LearningPath";
import { RightDashboard } from "@/components/layout/RightDashboard";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";

export function LearningPathContainer() {
  const [data, setData] = React.useState<LearningPathType | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  const fetchLearningPath = async () => {
    try {
      setLoading(true);
      setError(false);
      const result = await api.getLearningPath();
      setData(result);
    } catch {
      console.error("Failed to fetch learning path");
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLearningPath();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row gap-8 w-full pb-12 animate-pulse">
        <div className="flex-1 space-y-6">
          <Skeleton className="h-64 w-full bg-[#182830] rounded-3xl" />
          <Skeleton className="h-48 w-full bg-[#182830] rounded-3xl" />
        </div>
        <div className="hidden lg:block w-80 space-y-6">
          <Skeleton className="h-56 w-full bg-[#182830] rounded-3xl" />
          <Skeleton className="h-48 w-full bg-[#182830] rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <ErrorState 
        title="Could not load learning path"
        message="There was a problem communicating with the server."
        onRetry={fetchLearningPath} 
      />
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full items-start">
      {/* Center Column: Section Cards & Skill Path */}
      <div className="flex-1 w-full max-w-2xl">
        <LearningPath data={data} />
      </div>

      {/* Right Column: Contextual Dashboard Cards */}
      <RightDashboard course={data.course} />
    </div>
  );
}
