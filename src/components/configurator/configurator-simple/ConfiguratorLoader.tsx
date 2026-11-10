"use client";

import React from "react";

type ConfiguratorLoaderProps = {
  entryImageSrc?: string | null
}

export function ConfiguratorLoader({ entryImageSrc = null }: ConfiguratorLoaderProps) {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      {entryImageSrc ? (
        // Lokalny plik marki, bez optymalizatora, żeby pierwsza odpowiedź HTML miała gotowy adres.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={entryImageSrc}
          alt="Podgląd dywaników EVA Premium"
          width={960}
          height={640}
          fetchPriority="high"
          decoding="async"
          className="mb-8 h-auto w-full max-w-3xl object-contain"
        />
      ) : null}
      <div className="text-center space-y-6">
        {/* Spinner */}
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
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




