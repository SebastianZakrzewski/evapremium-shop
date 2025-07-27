"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import CartModal from "./cart-modal";
import { useSession } from "@/lib/contexts/session-context";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cartCount } = useSession();

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-black/90 backdrop-blur border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 md:h-20 lg:h-24 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-end justify-center gap-2 text-white font-bold text-lg hover:opacity-80 transition-opacity -mb-2">
            <Image
              src="/Logo svg .svg"
              alt="EvaPremium Logo"
              width={450}
              height={180}
              className="object-contain h-22 md:h-26 lg:h-30"
              priority
            />
          </Link>
          {/* Desktop Links - Centered */}
          <div className="hidden md:flex gap-6 items-center absolute left-1/2 transform -translate-x-1/2">
            <Link href="#dywaniki" className="text-white/90 hover:text-white transition font-medium" title="Dywaniki Samochodowe EVA Premium">Dywaniki Samochodowe</Link>
            <Link href="/modele" className="text-white/90 hover:text-white transition font-medium" title="Modele Samochodów - Wybierz Swój">Modele Aut</Link>
            <Link href="/konfigurator" className="text-white/90 hover:text-white transition font-medium" title="Konfigurator Dywaników">Konfigurator</Link>
            <Link href="#o-nas" className="text-white/90 hover:text-white transition font-medium" title="O Firmie EvaPremium">O Nas</Link>
            <Link href="#kontakt" className="text-white/90 hover:text-white transition font-medium" title="Kontakt - EvaPremium">Kontakt</Link>
          </div>
          {/* Desktop Cart Icon and Contact */}
          <div className="hidden md:flex items-center gap-3">
            <a href="tel:+48505401233" className="text-white/90 hover:text-white transition-colors font-medium text-sm">
              +48 505 401 233
            </a>
            <Link href="/wyszukaj" className="text-white/90 hover:text-white transition-colors p-2 group">
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="text-white/90 hover:text-white transition-colors p-2 relative group"
            >
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {/* Cart Badge */}
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center shadow-lg group-hover:bg-red-400 transition-colors">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
          {/* Mobile Cart Icon and Hamburger */}
          <div className="md:hidden flex items-center gap-4">
            <Link href="/wyszukaj" className="text-white/90 hover:text-white transition-colors p-2 group">
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="text-white/90 hover:text-white transition-colors p-2 relative group"
            >
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {/* Cart Badge */}
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center shadow-lg group-hover:bg-red-400 transition-colors">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              className="flex flex-col justify-center items-center w-10 h-10 text-white"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <span className={`block h-0.5 w-6 bg-white transition-all ${open ? "rotate-45 translate-y-1.5" : ""}`}></span>
              <span className={`block h-0.5 w-6 bg-white my-1 transition-all ${open ? "opacity-0" : ""}`}></span>
              <span className={`block h-0.5 w-6 bg-white transition-all ${open ? "-rotate-45 -translate-y-1.5" : ""}`}></span>
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        <div
          className={`md:hidden fixed top-16 left-0 w-full bg-black/95 backdrop-blur border-b border-neutral-800 z-40 transition-all duration-300 ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}
        >
          <div className="flex flex-col gap-4 py-6 px-8">
            <Link href="#dywaniki" className="text-white/90 hover:text-white text-lg font-medium" onClick={() => setOpen(false)}>Dywaniki Samochodowe</Link>
            <Link href="/modele" className="text-white/90 hover:text-white text-lg font-medium" onClick={() => setOpen(false)}>Modele Aut</Link>
            <Link href="/konfigurator" className="text-white/90 hover:text-white text-lg font-medium" onClick={() => setOpen(false)}>Konfigurator</Link>
            <Link href="#o-nas" className="text-white/90 hover:text-white text-lg font-medium" onClick={() => setOpen(false)}>O Nas</Link>
            <Link href="#kontakt" className="text-white/90 hover:text-white text-lg font-medium" onClick={() => setOpen(false)}>Kontakt</Link>
            <a href="tel:+48505401233" className="text-white/90 hover:text-white text-lg font-medium" onClick={() => setOpen(false)}>
              +48 505 401 233
            </a>
          </div>
        </div>
      </nav>

      {/* Cart Modal */}
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
} 