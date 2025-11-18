"use client";

import React from "react";

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
  isValid?: (step: number) => boolean;
}

export function StepProgress({ currentStep, totalSteps, onStepClick, isValid }: StepProgressProps) {
  return (
    <div className="flex items-center justify-between gap-2">
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
                w-10 h-10 md:w-11 md:h-11 rounded-full
                transition-all duration-300
                min-w-[40px] min-h-[40px]
                ${isCurrent 
                  ? 'bg-red-600 text-white scale-105 shadow-md shadow-red-600/30 ring-2 ring-red-500/50' 
                  : isCompleted 
                  ? 'bg-red-600 text-white shadow-sm shadow-red-600/20 hover:scale-105' 
                  : 'bg-neutral-800 text-gray-400 border border-neutral-700'
                }
                ${isClickable ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-not-allowed'}
              `}
            >
              {step === totalSteps ? (
                // Ikona flagi mety dla ostatniego kroku
                <svg 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  className="w-5 h-5 md:w-6 md:h-6"
                >
                  {/* Flaga mety - wzór szachownicy */}
                  <rect x="4" y="4" width="16" height="16" fill="currentColor" opacity="0.15"/>
                  {/* Czarne pola szachownicy */}
                  <rect x="4" y="4" width="4" height="4" fill="currentColor"/>
                  <rect x="12" y="4" width="4" height="4" fill="currentColor"/>
                  <rect x="8" y="8" width="4" height="4" fill="currentColor"/>
                  <rect x="16" y="8" width="4" height="4" fill="currentColor"/>
                  <rect x="4" y="12" width="4" height="4" fill="currentColor"/>
                  <rect x="12" y="12" width="4" height="4" fill="currentColor"/>
                  <rect x="8" y="16" width="4" height="4" fill="currentColor"/>
                  <rect x="16" y="16" width="4" height="4" fill="currentColor"/>
                  {/* Ramka */}
                  <rect x="4" y="4" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              ) : (
                <span className="text-sm md:text-base font-bold">{step}</span>
              )}
            </button>
            {step < totalSteps && (
              <div
                className={`
                  flex-1 h-1 mx-2 md:mx-3 rounded-full
                  transition-all duration-300
                  ${isCompleted ? 'bg-red-600 shadow-sm shadow-red-600/20' : 'bg-neutral-700'}
                `}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

