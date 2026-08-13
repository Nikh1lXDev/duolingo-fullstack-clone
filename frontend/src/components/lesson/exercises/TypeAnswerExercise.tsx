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

export function TypeAnswerExercise({ exercise, submitted, onAnswerSelected, onSubmit }: ExerciseProps) {
  const [value, setValue] = React.useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (submitted) return;
    setValue(e.target.value);
    onAnswerSelected(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim() && !submitted) {
      onSubmit();
    }
  };

  return (
    <div className="flex w-full flex-col gap-8 max-w-2xl mx-auto py-8">
      <h2 className="text-2xl font-bold text-[#3c3c3c]">{exercise.prompt}</h2>
      
      <div className="flex flex-col gap-4">
        <label htmlFor="type-answer-input" className="sr-only">Type your answer</label>
        <input
          id="type-answer-input"
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={submitted}
          autoFocus
          className="w-full rounded-2xl border-2 border-[#e5e5e5] bg-[#f7f7f7] p-4 text-xl text-[#3c3c3c] outline-none focus:border-[#1cb0f6] focus:bg-white disabled:opacity-80"
          placeholder="Type here..."
          autoComplete="off"
          spellCheck="false"
        />
      </div>

      <div className="mt-8 flex justify-center">
        <Button 
          size="lg" 
          onClick={onSubmit} 
          disabled={!value.trim() || submitted}
          className="w-full sm:w-1/2"
        >
          CHECK
        </Button>
      </div>
    </div>
  );
}
