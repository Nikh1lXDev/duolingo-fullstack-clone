"use client";

import * as React from "react";
import { Exercise } from "@/types/api";
import { Button } from "@/components/ui/Button";
import { QuestionOption } from "@/components/ui/QuestionOption";
import type { LessonTheme } from "@/lib/lessonThemes";

export interface ExerciseProps {
  exercise: Exercise;
  submitted: boolean;
  onAnswerSelected: (answer: string) => void;
  onSubmit: () => void;
  theme?: LessonTheme;
}

export function MultipleChoiceExercise({ exercise, submitted, onAnswerSelected, onSubmit, theme }: ExerciseProps) {
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
    <div className="flex w-full flex-col gap-8 max-w-2xl mx-auto py-4">
      <h2 className="text-2xl font-bold text-[#3c3c3c]">{exercise.prompt}</h2>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {options.map((option, idx) => {
          let state: "default" | "selected" | "correct" | "incorrect" | "disabled" = "default";
          
          if (submitted) {
            if (option === exercise.correct_answer) state = "correct";
            else if (option === selected) state = "incorrect";
            else state = "disabled";
          } else {
            if (option === selected) state = "selected";
          }

          return (
            <QuestionOption
              key={idx}
              index={idx + 1}
              state={state}
              variant="light"
              onClick={() => handleSelect(option)}
              disabled={submitted}
              className="min-h-[70px] justify-start"
            >
              {option}
            </QuestionOption>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <Button 
          size="lg" 
          onClick={onSubmit} 
          disabled={!selected || submitted}
          className="w-full sm:w-1/2"
          style={theme ? { backgroundColor: theme.accent, borderColor: theme.accentDark } : undefined}
        >
          CHECK
        </Button>
      </div>
    </div>
  );
}

