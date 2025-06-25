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
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="28" height="28" rx="6" fill="#fff"/>
            <path d="M7 21V7h7.5a4.5 4.5 0 1 1 0 9H9.5V21H7Zm2.5-6.5h5a2.5 2.5 0 1 0 0-5h-5v5Z" fill="#000"/>
          </svg>
          EvaPremium
        </Link>
        {/* Desktop Links */}
        <div className="hidden md:flex gap-6 items-center">
          <Link href="#features" className="text-white/90 hover:text-white transition font-medium">Features</Link>
          <Link href="#pricing" className="text-white/90 hover:text-white transition font-medium">Pricing</Link>
          <Link href="#resources" className="text-white/90 hover:text-white transition font-medium">Resources</Link>
          <Link href="#blog" className="text-white/90 hover:text-white transition font-medium">Blog</Link>
        </div>
        {/* Desktop Button */}
        <div className="hidden md:flex">
          <Link href="#" className="bg-white text-black font-semibold px-5 py-2 rounded-full hover:bg-neutral-200 transition">Get Started</Link>
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
          <Link href="#features" className="text-white/90 hover:text-white text-lg font-medium" onClick={() => setOpen(false)}>Features</Link>
          <Link href="#pricing" className="text-white/90 hover:text-white text-lg font-medium" onClick={() => setOpen(false)}>Pricing</Link>
          <Link href="#resources" className="text-white/90 hover:text-white text-lg font-medium" onClick={() => setOpen(false)}>Resources</Link>
          <Link href="#blog" className="text-white/90 hover:text-white text-lg font-medium" onClick={() => setOpen(false)}>Blog</Link>
          <Link href="#" className="bg-white text-black font-semibold px-5 py-2 rounded-full text-center mt-2" onClick={() => setOpen(false)}>Get Started</Link>
        </div>
      </div>
    </nav>
  );
} 