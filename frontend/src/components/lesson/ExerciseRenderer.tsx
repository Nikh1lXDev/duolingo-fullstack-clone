import * as React from "react";
import { Exercise } from "@/types/api";
import { MultipleChoiceExercise } from "./exercises/MultipleChoiceExercise";
import { TypeAnswerExercise } from "./exercises/TypeAnswerExercise";
import { FillBlankExercise } from "./exercises/FillBlankExercise";
import { TranslateExercise } from "./exercises/TranslateExercise";
import { WordBankExercise } from "./exercises/WordBankExercise";
import { MatchPairsExercise } from "./exercises/MatchPairsExercise";

export interface ExerciseRendererProps {
  exercise: Exercise;
  submitted: boolean;
  onAnswerSelected: (answer: unknown) => void;
  onSubmit: () => void;
}

export function ExerciseRenderer({ exercise, submitted, onAnswerSelected, onSubmit }: ExerciseRendererProps) {
  switch (exercise.type) {
    case "multiple_choice":
      return <MultipleChoiceExercise exercise={exercise} submitted={submitted} onAnswerSelected={onAnswerSelected} onSubmit={onSubmit} />;
    case "type_answer":
      return <TypeAnswerExercise exercise={exercise} submitted={submitted} onAnswerSelected={onAnswerSelected} onSubmit={onSubmit} />;
    case "fill_blank":
      return <FillBlankExercise exercise={exercise} submitted={submitted} onAnswerSelected={onAnswerSelected} onSubmit={onSubmit} />;
    case "translate":
      return <TranslateExercise exercise={exercise} submitted={submitted} onAnswerSelected={onAnswerSelected} onSubmit={onSubmit} />;
    case "word_bank":
      return <WordBankExercise exercise={exercise} submitted={submitted} onAnswerSelected={onAnswerSelected} onSubmit={onSubmit} />;
    case "match_pairs":
      return <MatchPairsExercise exercise={exercise} submitted={submitted} onAnswerSelected={onAnswerSelected} onSubmit={onSubmit} />;
    default:
      return <div className="p-8 text-center text-[#ff4b4b]">Unknown exercise type: {exercise.type}</div>;
  }
}
