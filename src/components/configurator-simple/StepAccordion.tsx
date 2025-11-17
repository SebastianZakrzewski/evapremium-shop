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
              w-8 h-8 md:w-9 md:h-9 rounded-full
              transition-all duration-300
              ${isValid 
                ? 'bg-green-600 text-white shadow-md shadow-green-600/20' 
                : isOpen 
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20' 
                : 'bg-neutral-800 text-gray-400 border border-neutral-700'
              }
            `}
          >
            <span className="text-xs md:text-sm font-bold">{step}</span>
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

