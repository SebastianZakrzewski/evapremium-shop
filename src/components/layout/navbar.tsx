"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { CartModalWrapper } from "@/features/shopping-cart/components";
import { useCart } from "@/features/shopping-cart/hooks/useCart";
import SearchDropdown from "../search-dropdown";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { itemCount } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const handleGalleryClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push("/galeria");
    setOpen(false); // Zamknij menu mobilne jeśli otwarte
  };

  // Nasłuchuj na scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Nasłuchuj na event otwierania modala koszyka
  useEffect(() => {
    const handleOpenCartModal = () => {
      setIsCartOpen(true);
    };

    window.addEventListener('openCartModal', handleOpenCartModal);
    return () => window.removeEventListener('openCartModal', handleOpenCartModal);
  }, []);

  // Wysyłaj eventy o zmianie stanu koszyka
  useEffect(() => {
    const event = new CustomEvent('cartModalStateChange', {
      detail: { isOpen: isCartOpen }
    });
    window.dispatchEvent(event);
  }, [isCartOpen]);


  return (
    <>
      <nav 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-black/80 backdrop-blur-md border-b border-white/10 shadow-lg" 
            : "bg-black/60 backdrop-blur-sm border-b border-transparent"
        }`}
      >
        {/* Gradient bottom border line */}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 md:h-20 lg:h-24 flex items-center justify-between overflow-x-hidden">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-2 text-white font-bold text-lg hover:opacity-80 transition-opacity z-10">
            <Image
              src="/Logo svg .svg"
              alt="EvaPremium Logo"
              width={450}
              height={180}
              className="object-contain h-14 md:h-16 lg:h-20"
              priority
            />
          </Link>
          
          {/* Desktop Links - Centered */}
          <div className="hidden md:flex gap-8 items-center absolute left-1/2 transform -translate-x-1/2">
            <Link href="/dywaniki" className="text-white/90 hover:text-red-500 transition-colors font-medium py-1" title="Dywaniki Samochodowe EVA Premium">Dywaniki Samochodowe</Link>
            <Link href="/akcesoria" className="text-white/90 hover:text-red-500 transition-colors font-medium py-1" title="Akcesoria Samochodowe - Kompletna Oferta">Akcesoria</Link>
            <Link href="/galeria" onClick={handleGalleryClick} className="text-white/90 hover:text-red-500 transition-colors font-medium py-1" title="Galeria Produktów EVA Premium">Galeria</Link>
            <Link href="/o-nas" className="text-white/90 hover:text-red-500 transition-colors font-medium py-1" title="O Firmie EvaPremium">O Nas</Link>
            <Link href="/kontakt" className="text-white/90 hover:text-red-500 transition-colors font-medium py-1" title="Kontakt - EvaPremium">Kontakt</Link>
          </div>
          
          {/* Desktop Cart Icon and Contact */}
          <div className="hidden md:flex items-center gap-5 z-10">
            <a href="tel:+48570123635" className="text-white/80 hover:text-white transition-colors font-medium text-sm tracking-wide hover:scale-105 transform duration-200">
              +48 570 123 635
            </a>
            <div className="flex items-center gap-3">
              <SearchDropdown />
              <button 
                onClick={() => setIsCartOpen(true)}
                className="text-white/90 hover:text-white transition-colors p-2 relative group glass-button rounded-full !border-white/10 hover:!bg-white/20"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {/* Cart Badge */}
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg group-hover:bg-red-500 transition-colors ring-2 ring-black">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile Cart Icon and Hamburger */}
          <div className="md:hidden flex items-center gap-3 z-10">
            <SearchDropdown />
            <button 
              onClick={() => setIsCartOpen(true)}
              className="text-white/90 hover:text-white transition-colors p-2 relative group"
            >
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {/* Cart Badge */}
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-lg ring-1 ring-black">
                  {itemCount}
                </span>
              )}
            </button>
            <button
              className="flex flex-col justify-center items-center w-10 h-10 text-white glass-button rounded-lg !border-white/10"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <span className={`block h-0.5 w-5 bg-white transition-all duration-300 ${open ? "rotate-45 translate-y-1.5" : ""}`}></span>
              <span className={`block h-0.5 w-5 bg-white my-1 transition-all duration-300 ${open ? "opacity-0 translate-x-2" : ""}`}></span>
              <span className={`block h-0.5 w-5 bg-white transition-all duration-300 ${open ? "-rotate-45 -translate-y-1.5" : ""}`}></span>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <div className={`md:hidden fixed top-[64px] left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/10 z-[40] shadow-2xl pb-safe transition-all duration-300 ease-in-out overflow-hidden ${open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="flex flex-col gap-4 py-8 px-6">
            <Link href="/dywaniki" className="text-white/90 hover:text-red-500 text-lg font-medium transition-colors" onClick={() => setOpen(false)}>
              Dywaniki Samochodowe
            </Link>
            <div className="h-[1px] bg-white/5 w-full"></div>
            <Link href="/akcesoria" className="text-white/90 hover:text-red-500 text-lg font-medium transition-colors" onClick={() => setOpen(false)}>
              Akcesoria
            </Link>
            <div className="h-[1px] bg-white/5 w-full"></div>
            <Link href="/galeria" onClick={handleGalleryClick} className="text-white/90 hover:text-red-500 text-lg font-medium transition-colors">
              Galeria
            </Link>
            <div className="h-[1px] bg-white/5 w-full"></div>
            <Link href="/o-nas" className="text-white/90 hover:text-red-500 text-lg font-medium transition-colors" onClick={() => setOpen(false)}>
              O Nas
            </Link>
            <div className="h-[1px] bg-white/5 w-full"></div>
            <Link href="/kontakt" className="text-white/90 hover:text-red-500 text-lg font-medium transition-colors" onClick={() => setOpen(false)}>
              Kontakt
            </Link>
            
            <div className="mt-6 pt-6 border-t border-white/10">
              <a href="tel:+48570123635" className="flex items-center justify-center gap-3 text-white font-bold text-lg bg-white/5 p-4 rounded-xl border border-white/10" onClick={() => setOpen(false)}>
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                +48 570 123 635
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Cart Modal */}
      <CartModalWrapper 
        isOpen={isCartOpen} 
        onClose={() => {
          setIsCartOpen(false);
          // Wysyłaj event o zamknięciu koszyka
          window.dispatchEvent(new CustomEvent('closeCartModal'));
        }} 
      />
    </>
  );
}
