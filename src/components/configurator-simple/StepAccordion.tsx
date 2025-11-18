"use client";

import React from "react";

interface StepAccordionProps {
  step: number;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  isValid: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

export function StepAccordion({
  step,
  title,
  isOpen,
  onToggle,
  isValid,
  disabled = false,
  children,
}: StepAccordionProps) {
  return (
    <div
      className={`
        bg-neutral-900 rounded-lg border transition-all duration-300
        ${isOpen ? 'border-red-500/50 shadow-lg shadow-red-500/10' : 'border-neutral-800'}
        ${disabled ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      <button
        onClick={onToggle}
        disabled={disabled}
        className="w-full flex items-center justify-between p-4 md:p-5 text-left hover:bg-neutral-800/50 transition-colors duration-200"
      >
        <div className="flex items-center gap-3 md:gap-4">
          <div
            className={`
              flex items-center justify-center
              w-6 h-6 md:w-7 md:h-7
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
          <h3 className="text-lg md:text-xl font-semibold leading-tight">{title}</h3>
        </div>
        <span className={`text-gray-400 text-base md:text-lg transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      
      {isOpen && (
        <div className="px-4 md:px-5 pb-4 md:pb-5 border-t border-neutral-800 pt-4 md:pt-5 animate-in fade-in slide-in-from-top-2 duration-300">
          {children}
        </div>
      )}
    </div>
  );
}

