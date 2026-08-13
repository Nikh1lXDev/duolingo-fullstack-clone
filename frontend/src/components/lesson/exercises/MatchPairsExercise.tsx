"use client";

import * as React from "react";
import { Exercise } from "@/types/api";
import { Button } from "@/components/ui/Button";

export interface ExerciseProps {
  exercise: Exercise;
  submitted: boolean;
  onAnswerSelected: (answer: Record<string, string>) => void;
  onSubmit: () => void;
}

export function MatchPairsExercise({ exercise, submitted, onAnswerSelected, onSubmit }: ExerciseProps) {
  const [selectedLeft, setSelectedLeft] = React.useState<string | null>(null);
  const [selectedRight, setSelectedRight] = React.useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = React.useState<Record<string, string>>({});
  const [errorPair, setErrorPair] = React.useState<{left: string, right: string} | null>(null);

  const { leftColumn, rightColumn } = React.useMemo(() => {
    try {
      const opts = JSON.parse(exercise.options || "[]") as string[];
      const correctMap = JSON.parse(exercise.correct_answer || "{}") as Record<string, string>;
      
      const left: string[] = [];
      const right: string[] = [];
      
      const correctKeys = new Set(Object.keys(correctMap));
      const correctValues = new Set(Object.values(correctMap));
      
      opts.forEach(opt => {
        if (correctKeys.has(opt)) {
          left.push(opt);
        } else if (correctValues.has(opt)) {
          right.push(opt);
        } else {
          // Distractor fallback
          if (left.length <= right.length) left.push(opt);
          else right.push(opt);
        }
      });
      
      return { 
        leftColumn: left.sort(), 
        rightColumn: right.reverse() 
      };
    } catch {
      return { leftColumn: [], rightColumn: [] };
    }
  }, [exercise.options, exercise.correct_answer]);

  const handleSelectLeft = (item: string) => {
    if (submitted) return;
    const isSelected = selectedLeft === item;
    const newSelectedLeft = isSelected ? null : item;
    setSelectedLeft(newSelectedLeft);
    
    if (newSelectedLeft && selectedRight) {
      checkMatch(newSelectedLeft, selectedRight);
    }
  };

  const handleSelectRight = (item: string) => {
    if (submitted) return;
    const isSelected = selectedRight === item;
    const newSelectedRight = isSelected ? null : item;
    setSelectedRight(newSelectedRight);
    
    if (selectedLeft && newSelectedRight) {
      checkMatch(selectedLeft, newSelectedRight);
    }
  };

  const checkMatch = (left: string, right: string) => {
    let isCorrectPair = false;
    try {
      const correctMap = JSON.parse(exercise.correct_answer || "{}");
      isCorrectPair = correctMap[left] === right;
    } catch {
      console.error("MatchPairs json parse error");
    }
    
    if (isCorrectPair) {
      const newMatched = { ...matchedPairs, [left]: right };
      setMatchedPairs(newMatched);
      onAnswerSelected(newMatched);
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      setErrorPair({ left, right });
      setTimeout(() => {
        setErrorPair(prev => (prev?.left === left && prev?.right === right) ? null : prev);
        setSelectedLeft(prev => prev === left ? null : prev);
        setSelectedRight(prev => prev === right ? null : prev);
      }, 500);
    }
  };

  return (
    <div className="flex w-full flex-col gap-8 max-w-2xl mx-auto py-8">
      <h2 className="text-2xl font-bold text-[#3c3c3c]">{exercise.prompt}</h2>
      
      <div className="flex w-full justify-between gap-4">
        {/* Left Column */}
        <div className="flex flex-1 flex-col gap-3">
          {leftColumn.map((item: string) => {
            const isMatched = Object.keys(matchedPairs).includes(item);
            const isSelected = selectedLeft === item;
            const isError = errorPair?.left === item;
            
            return (
              <button
                key={item}
                disabled={isMatched || submitted}
                onClick={() => handleSelectLeft(item)}
                className={`rounded-xl border-2 px-4 py-3 text-lg font-bold transition-all
                  ${isMatched ? "border-[#e5e5e5] bg-[#e5e5e5] text-transparent opacity-50 cursor-default shadow-none" : 
                    isError ? "border-[#ff4b4b] bg-[#ffdfe0] text-[#ff4b4b]" :
                    isSelected ? "border-[#1cb0f6] bg-[#ddf4c5] text-[#1cb0f6]" : 
                    "border-[#e5e5e5] bg-white text-[#3c3c3c] hover:bg-[#f7f7f7] shadow-[0_4px_0_0_#e5e5e5] active:translate-y-1 active:shadow-none"}
                `}
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="flex flex-1 flex-col gap-3">
          {rightColumn.map((item: string) => {
            const isMatched = Object.values(matchedPairs).includes(item);
            const isSelected = selectedRight === item;
            const isError = errorPair?.right === item;
            
            return (
              <button
                key={item}
                disabled={isMatched || submitted}
                onClick={() => handleSelectRight(item)}
                className={`rounded-xl border-2 px-4 py-3 text-lg font-bold transition-all
                  ${isMatched ? "border-[#e5e5e5] bg-[#e5e5e5] text-transparent opacity-50 cursor-default shadow-none" : 
                    isError ? "border-[#ff4b4b] bg-[#ffdfe0] text-[#ff4b4b]" :
                    isSelected ? "border-[#1cb0f6] bg-[#ddf4c5] text-[#1cb0f6]" : 
                    "border-[#e5e5e5] bg-white text-[#3c3c3c] hover:bg-[#f7f7f7] shadow-[0_4px_0_0_#e5e5e5] active:translate-y-1 active:shadow-none"}
                `}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Button 
          size="lg" 
          onClick={onSubmit} 
          disabled={Object.keys(matchedPairs).length !== leftColumn.length || submitted}
          className="w-full sm:w-1/2"
        >
          CHECK
        </Button>
      </div>
    </div>
  );
}
