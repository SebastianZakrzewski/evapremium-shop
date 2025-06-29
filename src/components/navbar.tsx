"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/90 backdrop-blur border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg">
          EvaPremium
        </Link>
        {/* Desktop Links - Centered */}
        <div className="hidden md:flex gap-6 items-center absolute left-1/2 transform -translate-x-1/2">
          <Link href="#dywaniki" className="text-white/90 hover:text-white transition font-medium">Dywaniki Samochodowe</Link>
          <Link href="/modele" className="text-white/90 hover:text-white transition font-medium">Modele Aut</Link>
          <Link href="#o-nas" className="text-white/90 hover:text-white transition font-medium">O Nas</Link>
          <Link href="#kontakt" className="text-white/90 hover:text-white transition font-medium">Kontakt</Link>
        </div>
        {/* Hamburger */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 text-white"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span className={`block h-0.5 w-6 bg-white transition-all ${open ? "rotate-45 translate-y-1.5" : ""}`}></span>
          <span className={`block h-0.5 w-6 bg-white my-1 transition-all ${open ? "opacity-0" : ""}`}></span>
          <span className={`block h-0.5 w-6 bg-white transition-all ${open ? "-rotate-45 -translate-y-1.5" : ""}`}></span>
        </button>
      </div>
      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed top-16 left-0 w-full bg-black/95 backdrop-blur border-b border-neutral-800 z-40 transition-all duration-300 ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}
      >
        <div className="flex flex-col gap-4 py-6 px-8">
          <Link href="#dywaniki" className="text-white/90 hover:text-white text-lg font-medium" onClick={() => setOpen(false)}>Dywaniki Samochodowe</Link>
          <Link href="/modele" className="text-white/90 hover:text-white text-lg font-medium" onClick={() => setOpen(false)}>Modele Aut</Link>
          <Link href="#o-nas" className="text-white/90 hover:text-white text-lg font-medium" onClick={() => setOpen(false)}>O Nas</Link>
          <Link href="#kontakt" className="text-white/90 hover:text-white text-lg font-medium" onClick={() => setOpen(false)}>Kontakt</Link>
        </div>
      </div>
    </nav>
  );
} 