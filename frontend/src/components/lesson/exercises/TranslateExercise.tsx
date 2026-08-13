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

export function TranslateExercise({ exercise, submitted, onAnswerSelected, onSubmit }: ExerciseProps) {
  const [value, setValue] = React.useState("");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (submitted) return;
    setValue(e.target.value);
    onAnswerSelected(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && value.trim() && !submitted) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="flex w-full flex-col gap-8 max-w-2xl mx-auto py-8">
      <h2 className="text-2xl font-bold text-[#3c3c3c]">Translate this sentence</h2>
      
      <div className="flex w-full items-center">
        <div className="w-full rounded-2xl border-2 border-b-4 border-[#e5e5e5] p-4 text-xl font-medium text-[#3c3c3c]">
          {exercise.prompt}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <label htmlFor="translate-input" className="sr-only">Type translation in English</label>
        <textarea
          id="translate-input"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={submitted}
          autoFocus
          className="min-h-[120px] w-full resize-none rounded-2xl border-2 border-[#e5e5e5] bg-[#f7f7f7] p-4 text-xl text-[#3c3c3c] outline-none focus:border-[#1cb0f6] focus:bg-white disabled:opacity-80"
          placeholder="Type in English"
          spellCheck="false"
        />
      </div>

      <div className="mt-4 flex justify-center">
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
