"use client";

import React from "react";

export function ConfiguratorLoader() {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center">
      <div className="text-center space-y-6">
        {/* Spinner */}
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 border-4 border-neutral-800 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        {/* Text with fade animation */}
        <div className="space-y-2 animate-in fade-in duration-500">
          <p className="text-white text-xl md:text-2xl font-semibold">
            Ładuję Twój model…
          </p>
          <p className="text-gray-400 text-sm md:text-base">
            Przygotowujemy konfigurator dla Ciebie
          </p>
        </div>
      </div>
    </div>
  );
}




