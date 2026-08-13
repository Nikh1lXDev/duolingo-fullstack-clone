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

export function MultipleChoiceExercise({ exercise, submitted, onAnswerSelected, onSubmit }: ExerciseProps) {
  const [selected, setSelected] = React.useState<string | null>(null);

  let options: string[] = [];
  try {
    options = exercise.options ? JSON.parse(exercise.options) : [];
  } catch {
    console.error("Failed to parse options for multiple_choice");
  }

  const handleSelect = (option: string) => {
    if (submitted) return;
    setSelected(option);
    onAnswerSelected(option);
  };

  return (
    <div className="flex w-full flex-col gap-8 max-w-2xl mx-auto py-8">
      <h2 className="text-2xl font-bold text-[#3c3c3c]">{exercise.prompt}</h2>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {options.map((option, idx) => (
          <button
            key={idx}
            type="button"
            disabled={submitted}
            onClick={() => handleSelect(option)}
            className={`flex min-h-[60px] w-full items-center justify-center rounded-2xl border-2 p-4 text-lg font-bold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1cb0f6]
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

      <div className="mt-8 flex justify-center">
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
