"use client";

import { cn } from "@/lib/utils";

export type ModelNavigationItem = {
  value: string;
  label: string;
};

interface ModelNavigationBarProps {
  models: ModelNavigationItem[];
  selectedModel: string | null;
  onModelSelect: (model: string | null) => void;
}

export default function ModelNavigationBar({
  models,
  selectedModel,
  onModelSelect,
}: ModelNavigationBarProps) {
  if (models.length === 0) {
    return null;
  }

  return (
    <div className="w-full border-b border-white/10 bg-black/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-2 overflow-x-auto scrollbar-hide pb-2">
          <button
            onClick={() => onModelSelect(null)}
            className={cn(
              "shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap",
              selectedModel === null
                ? "bg-red-600 text-white shadow-lg shadow-red-900/30 border border-red-700"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
            )}
          >
            Wszystkie
          </button>

          {models.map((model) => {
            const isSelected = selectedModel?.toLowerCase() === model.value.toLowerCase();
            return (
              <button
                key={model.value}
                onClick={() => onModelSelect(isSelected ? null : model.value)}
                className={cn(
                  "shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap relative",
                  isSelected
                    ? "bg-red-600 text-white shadow-lg shadow-red-900/30 border border-red-700"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
                )}
              >
                {model.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
