import * as React from "react";
import { Exercise } from "@/types/api";
import { MultipleChoiceExercise } from "./exercises/MultipleChoiceExercise";
import { TypeAnswerExercise } from "./exercises/TypeAnswerExercise";
import { FillBlankExercise } from "./exercises/FillBlankExercise";
import { TranslateExercise } from "./exercises/TranslateExercise";
import { WordBankExercise } from "./exercises/WordBankExercise";
import { MatchPairsExercise } from "./exercises/MatchPairsExercise";
import type { LessonTheme } from "@/lib/lessonThemes";

export interface ExerciseRendererProps {
  exercise: Exercise;
  submitted: boolean;
  onAnswerSelected: (answer: unknown) => void;
  onSubmit: () => void;
  theme?: LessonTheme;
}

export function ExerciseRenderer({ exercise, submitted, onAnswerSelected, onSubmit, theme }: ExerciseRendererProps) {
  const props = { exercise, submitted, onAnswerSelected, onSubmit, theme };
  switch (exercise.type) {
    case "multiple_choice":
      return <MultipleChoiceExercise {...props} />;
    case "type_answer":
      return <TypeAnswerExercise {...props} />;
    case "fill_blank":
      return <FillBlankExercise {...props} />;
    case "translate":
      return <TranslateExercise {...props} />;
    case "word_bank":
      return <WordBankExercise {...props} />;
    case "match_pairs":
      return <MatchPairsExercise {...props} />;
    default:
      return <div className="p-8 text-center text-[#ff4b4b]">Unknown exercise type: {exercise.type}</div>;
  }
}
