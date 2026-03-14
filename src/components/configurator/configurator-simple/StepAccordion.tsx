"use client";

import React from "react";

interface StepAccordionProps {
  step: number;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  isValid: boolean;
  disabled?: boolean;
  benefitDescription?: string;
  children: React.ReactNode;
}

export const StepAccordion = React.forwardRef<HTMLDivElement, StepAccordionProps>(({
  step,
  title,
  isOpen,
  onToggle,
  isValid,
  disabled = false,
  benefitDescription,
  children,
}, ref) => {
  return (
    <div
      ref={ref}
      className={`
        bg-neutral-900 rounded-lg border transition-all duration-200 will-change-transform
        ${isOpen ? 'border-red-500/50 shadow-lg shadow-red-500/10' : 'border-neutral-800'}
      `}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-2.5 md:p-3 text-left hover:bg-neutral-800/50 transition-colors duration-200 min-h-[40px] md:min-h-[44px] active:bg-neutral-800/70"
      >
        <div className="flex items-center gap-2 md:gap-3">
          <div
            className={`
              flex items-center justify-center
              w-5 h-5 md:w-6 md:h-6
              transition-all duration-300
              ${isValid 
                ? 'text-red-400 opacity-100' 
                : isOpen 
                ? 'text-red-400 opacity-100' 
                : 'text-gray-500 opacity-50'
              }
            `}
          >
            {step === 7 ? (
              // Ikona flagi mety dla ostatniego kroku
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                className="w-full h-full"
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
              <span className="text-xs font-medium">{step}</span>
            )}
          </div>
          <div className="flex flex-col">
            <h3 className="text-base md:text-lg font-semibold leading-tight">{title}</h3>
            {benefitDescription && (
              <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 leading-relaxed">{benefitDescription}</p>
            )}
          </div>
        </div>
        <span className={`text-gray-400 text-sm md:text-base transition-transform duration-200 will-change-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      
      {isOpen && (
        <div className="px-2.5 md:px-3 pb-2.5 md:pb-3 border-t border-neutral-800 pt-2.5 md:pt-3 animate-in fade-in slide-in-from-top-2 duration-200 will-change-transform">
          {children}
        </div>
      )}
    </div>
  );
});

StepAccordion.displayName = "StepAccordion";

