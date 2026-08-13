"use client";

import * as React from "react";
import { Exercise } from "@/types/api";
import { Button } from "@/components/ui/Button";

export interface ExerciseProps {
  exercise: Exercise;
  submitted: boolean;
  onAnswerSelected: (answer: string) => void;
  onSubmit: () => void;
}

export function FillBlankExercise({ exercise, submitted, onAnswerSelected, onSubmit }: ExerciseProps) {
  const [selected, setSelected] = React.useState<string | null>(null);

  // Parse prompt to find the blank "___"
  const parts = exercise.prompt.split("___");
  
  let options: string[] = [];
  try {
    options = exercise.options ? JSON.parse(exercise.options) : [];
  } catch {
    console.error("Failed to parse options for fill_blank");
  }

  const handleSelect = (option: string) => {
    if (submitted) return;
    setSelected(option);
    onAnswerSelected(option);
  };

  return (
    <div className="flex w-full flex-col gap-12 max-w-2xl mx-auto py-8">
      <div className="flex flex-wrap items-center gap-4 text-2xl font-bold text-[#3c3c3c]">
        {parts[0]}
        <div className={`min-w-[100px] border-b-4 pb-1 text-center text-[#1cb0f6] ${selected ? "border-[#1cb0f6]" : "border-[#e5e5e5]"}`}>
          {selected || "\u00A0"}
        </div>
        {parts.slice(1).join("___")}
      </div>
      
      <div className="flex flex-wrap justify-center gap-4">
        {options.map((option, idx) => (
          <button
            key={idx}
            type="button"
            disabled={submitted}
            onClick={() => handleSelect(option)}
            className={`rounded-2xl border-2 px-6 py-3 text-lg font-bold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1cb0f6]
              ${
                selected === option
                  ? "border-[#1cb0f6] bg-[#ddf4c5] text-[#1cb0f6]"
                  : "border-[#e5e5e5] bg-white text-[#3c3c3c] hover:bg-[#f7f7f7]"
              }
              ${submitted ? "cursor-not-allowed opacity-80" : "cursor-pointer active:translate-y-1"}
            `}
            aria-pressed={selected === option}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="mt-4 flex justify-center">
        <Button 
          size="lg" 
          onClick={onSubmit} 
          disabled={!selected || submitted}
          className="w-full sm:w-1/2"
        >
          CHECK
        </Button>
      </div>
    </div>
  );
}
