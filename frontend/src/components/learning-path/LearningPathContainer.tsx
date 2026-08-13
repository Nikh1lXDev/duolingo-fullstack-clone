"use client";

import * as React from "react";
import { api } from "@/lib/api";
import { LearningPath as LearningPathType } from "@/types/api";
import { LearningPath } from "./LearningPath";
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
      <div className="flex flex-col w-full gap-8 pb-12 animate-pulse">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-24 w-full" />
        <div className="flex flex-col items-center gap-8 py-8">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-20 w-20 rounded-full" />
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

  return <LearningPath data={data} />;
}
