"use client";

import React from "react";
import { Check } from "lucide-react";

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
  isValid?: (step: number) => boolean;
}

export function StepProgress({ currentStep, totalSteps, onStepClick, isValid }: StepProgressProps) {
  return (
    <div className="flex items-center justify-between">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;
        const isStepValid = isValid ? isValid(step) : false;
        const isClickable = onStepClick && (isCompleted || isCurrent);

        return (
          <React.Fragment key={step}>
            <button
              onClick={() => isClickable && onStepClick(step)}
              disabled={!isClickable}
              className={`
                flex items-center justify-center
                w-10 h-10 rounded-full
                transition-all duration-200
                ${isCurrent 
                  ? 'bg-red-600 text-white scale-110' 
                  : isCompleted 
                  ? 'bg-green-600 text-white' 
                  : 'bg-neutral-800 text-gray-400 border border-neutral-700'
                }
                ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}
              `}
            >
              {isCompleted ? (
                <Check className="w-5 h-5" />
              ) : (
                <span className="text-sm font-semibold">{step}</span>
              )}
            </button>
            {step < totalSteps && (
              <div
                className={`
                  flex-1 h-0.5 mx-2
                  transition-colors duration-200
                  ${isCompleted ? 'bg-green-600' : 'bg-neutral-700'}
                `}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

