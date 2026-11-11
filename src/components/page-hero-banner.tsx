"use client";

import React from 'react';
import Link from 'next/link';

interface PageHeroBannerProps {
  breadcrumb: string;
  title: string;
  description: string;
  kicker?: string;
  meta?: string;
}

export default function PageHeroBanner({
  breadcrumb,
  title,
  description,
  kicker = "Kolekcja",
  meta,
}: PageHeroBannerProps) {
  return (
    <div className="bg-[#FDFDFD] text-neutral-950">
      <div className="mx-auto w-full max-w-6xl px-4 pt-8 md:px-6 md:pt-12">
        <nav className="flex items-center gap-2 text-xs tracking-wide text-neutral-500">
          <Link href="/" className="transition-colors hover:text-neutral-950">
            Home
          </Link>
          <span>/</span>
          <span className="text-neutral-700">{breadcrumb}</span>
        </nav>

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.28em] text-red-600">{kicker}</p>
            <h1 className="mt-3 text-3xl font-medium leading-tight tracking-tight text-neutral-950 md:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-xl text-sm font-normal leading-relaxed text-neutral-600 md:text-base">
              {description}
            </p>
          </div>
          {meta ? <p className="text-sm text-neutral-500">{meta}</p> : null}
        </div>
      </div>
    </div>
  );
}
