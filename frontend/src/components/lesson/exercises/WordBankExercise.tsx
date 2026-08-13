"use client";

import * as React from "react";
import { Exercise } from "@/types/api";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

export interface ExerciseProps {
  exercise: Exercise;
  submitted: boolean;
  onAnswerSelected: (answer: string[]) => void;
  onSubmit: () => void;
}

export function WordBankExercise({ exercise, submitted, onAnswerSelected, onSubmit }: ExerciseProps) {
  const [selectedWords, setSelectedWords] = React.useState<string[]>([]);
  
  let options: string[] = [];
  try {
    options = exercise.options ? JSON.parse(exercise.options) : [];
  } catch {
    console.error("Failed to parse options for word_bank");
  }

  // Calculate available words by removing selected ones (handles duplicates nicely)
  const availableWords = [...options];
  selectedWords.forEach(word => {
    const idx = availableWords.indexOf(word);
    if (idx !== -1) availableWords.splice(idx, 1);
  });

  const handleSelectWord = (word: string) => {
    if (submitted) return;
    const newSelected = [...selectedWords, word];
    setSelectedWords(newSelected);
    onAnswerSelected(newSelected);
  };

  const handleDeselectWord = (index: number) => {
    if (submitted) return;
    const newSelected = [...selectedWords];
    newSelected.splice(index, 1);
    setSelectedWords(newSelected);
    onAnswerSelected(newSelected);
  };

  return (
    <div className="flex w-full flex-col gap-8 max-w-2xl mx-auto py-8">
      <h2 className="text-2xl font-bold text-[#3c3c3c]">{exercise.prompt}</h2>
      
      {/* Answer Area */}
      <div className="flex min-h-[60px] w-full flex-wrap content-start items-start gap-2 rounded-2xl border-b-2 border-t-2 border-[#e5e5e5] p-4 sm:min-h-[100px]">
        <AnimatePresence>
          {selectedWords.map((word, idx) => (
            <motion.button
              key={`${word}-${idx}-selected`}
              layout
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              onClick={() => handleDeselectWord(idx)}
              disabled={submitted}
              className="rounded-xl border-2 border-[#e5e5e5] bg-white px-4 py-2 text-lg font-bold text-[#3c3c3c] shadow-sm active:scale-95 disabled:opacity-80"
            >
              {word}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Available Words Area */}
      <div className="flex min-h-[120px] flex-wrap content-start items-center justify-center gap-3">
        {options.map((word, idx) => {
          // Find if this specific original word index is available
          const countInSelected = selectedWords.filter(w => w === word).length;
          const countInOptionsBeforeThis = options.slice(0, idx).filter(w => w === word).length;
          const isSelected = countInOptionsBeforeThis < countInSelected;

          return (
            <div key={`${word}-${idx}-option`} className="relative">
              {/* Placeholder for layout stability */}
              <div className="rounded-xl border-2 border-transparent px-4 py-2 text-lg font-bold text-transparent">
                {word}
              </div>
              
              {!isSelected && (
                <motion.button
                  layoutId={`${word}-${idx}`}
                  onClick={() => handleSelectWord(word)}
                  disabled={submitted}
                  className="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-[#e5e5e5] bg-white px-4 py-2 text-lg font-bold text-[#3c3c3c] shadow-[0_4px_0_0_#e5e5e5] active:translate-y-1 active:shadow-none disabled:opacity-80"
                >
                  {word}
                </motion.button>
              )}
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-transparent bg-[#e5e5e5] px-4 py-2 text-lg font-bold text-transparent">
                  {word}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex justify-center">
        <Button 
          size="lg" 
          onClick={onSubmit} 
          disabled={selectedWords.length === 0 || submitted}
          className="w-full sm:w-1/2"
        >
          CHECK
        </Button>
      </div>
    </div>
  );
}
