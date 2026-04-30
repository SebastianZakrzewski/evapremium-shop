"use client";

import React from 'react';
import Link from 'next/link';

interface PageHeroBannerProps {
  breadcrumb: string;
  title: string;
  highlight: string;
  description: string;
}

export default function PageHeroBanner({
  breadcrumb,
  title,
  highlight,
  description,
}: PageHeroBannerProps) {
  return (
    <div className="relative bg-black border-b border-white/5 py-16 md:py-24 overflow-hidden">
      {/* Gradient background – spójny z Galeria i O nas */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-neutral-950 to-red-900/5 opacity-50"></div>
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-red-600/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <span className="text-white">{breadcrumb}</span>
        </nav>
        
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-white">
            {title} <span className="text-red-600">{highlight}</span>
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
