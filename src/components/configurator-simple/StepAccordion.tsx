"use client";

import React from "react";
import { ChevronDown, Check } from "lucide-react";

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
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <div className="flex items-center gap-4">
          <div
            className={`
              flex items-center justify-center
              w-8 h-8 rounded-full
              transition-colors duration-200
              ${isValid 
                ? 'bg-green-600 text-white' 
                : isOpen 
                ? 'bg-red-600 text-white' 
                : 'bg-neutral-800 text-gray-400'
              }
            `}
          >
            {isValid ? (
              <Check className="w-5 h-5" />
            ) : (
              <span className="text-sm font-semibold">{step}</span>
            )}
          </div>
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>
        <ChevronDown
          className={`
            w-5 h-5 transition-transform duration-300
            ${isOpen ? 'rotate-180' : ''}
          `}
        />
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6 border-t border-neutral-800 pt-6">
          {children}
        </div>
      )}
    </div>
  );
}

