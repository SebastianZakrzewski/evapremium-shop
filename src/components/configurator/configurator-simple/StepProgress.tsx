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
    <div className="flex items-center justify-between w-full">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;
        const isClickable = onStepClick && (isCompleted || isCurrent);

        return (
          <React.Fragment key={step}>
            <div className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => isClickable && onStepClick(step)}
                disabled={!isClickable}
                className={`
                  relative flex items-center justify-center
                  w-6 h-6 md:w-8 md:h-8 rounded-full
                  transition-all duration-300 ease-out will-change-transform
                  ${isCurrent 
                    ? 'bg-gradient-to-br from-red-600 to-red-700 text-white scale-110 shadow-[0_0_15px_rgba(220,38,38,0.4)] ring-1 ring-red-500/50 z-10' 
                    : isCompleted 
                    ? 'bg-white/5 text-red-500 border border-red-500/50 hover:bg-white/10 hover:scale-105' 
                    : 'bg-[#111] text-gray-400 border border-white/5'
                  }
                  ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'}
                `}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 md:w-4 md:h-4 animate-in zoom-in duration-300" />
                ) : step === totalSteps ? (
                  <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 md:w-4 md:h-4">
                    <path d="M4 4h16v16H4V4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 4" />
                    <path d="M4 4h4v4H4V4zm8 0h4v4h-4V4zm-8 8h4v4H4v-4zm8 0h4v4h-4v-4zm-4-4h4v4H8V8zm8 0h4v4h-4V8z" fill="currentColor" className="opacity-50" />
                  </svg>
                ) : (
                  <span className={`text-xs md:text-sm font-bold ${isCurrent ? 'animate-pulse' : ''}`}>
                    {step}
                  </span>
                )}
                
                {/* Glow effect for current step */}
                {isCurrent && (
                  <div className="absolute inset-0 rounded-full bg-red-500/30 blur-md -z-10 animate-pulse-glow" />
                )}
              </button>
              
              {/* Progress Line */}
              {step < totalSteps && (
                <div className="flex-1 h-[1.5px] mx-1.5 md:mx-2 bg-white/5 rounded-full overflow-hidden relative">
                  <div 
                    className={`
                      absolute inset-0 h-full bg-gradient-to-r from-red-600 to-red-500
                      transition-all duration-500 ease-out origin-left will-change-transform
                      ${isCompleted ? 'scale-x-100' : 'scale-x-0'}
                    `}
                  />
                </div>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
