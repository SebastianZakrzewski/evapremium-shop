"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import CartModalWrapper from "./cart-modal-wrapper";
import { useCart } from "@/hooks/useCart.new";
import SearchDropdown from "./search-dropdown";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { itemCount } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const handleGalleryClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push("/galeria");
    setOpen(false); // Zamknij menu mobilne jeśli otwarte
  };

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
      <nav className="fixed top-0 left-0 w-full z-50 bg-black/90 backdrop-blur border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 md:h-20 lg:h-24 flex items-center justify-between overflow-x-hidden">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-2 text-white font-bold text-lg hover:opacity-80 transition-opacity">
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
          <div className="hidden md:flex gap-6 items-center absolute left-1/2 transform -translate-x-1/2">
            <Link href="/dywaniki" className="text-white/90 hover:text-white transition font-medium" title="Dywaniki Samochodowe EVA Premium">Dywaniki Samochodowe</Link>
            <Link href="/akcesoria" className="text-white/90 hover:text-white transition font-medium" title="Akcesoria Samochodowe - Kompletna Oferta">Akcesoria</Link>
            <Link href="/galeria" onClick={handleGalleryClick} className="text-white/90 hover:text-white transition font-medium" title="Galeria Produktów EVA Premium">Galeria</Link>
            <Link href="/konfigurator" className="text-red-400 hover:text-red-300 transition font-medium" title="Konfigurator Dywaników">Konfigurator</Link>
            <Link href="/o-nas" className="text-white/90 hover:text-white transition font-medium" title="O Firmie EvaPremium">O Nas</Link>
            <Link href="/kontakt" className="text-white/90 hover:text-white transition font-medium" title="Kontakt - EvaPremium">Kontakt</Link>
          </div>
          {/* Desktop Cart Icon and Contact */}
          <div className="hidden md:flex items-center gap-3">
            <a href="tel:+48570123635" className="text-white/90 hover:text-white transition-colors font-medium text-sm">
              +48 570 123 635
            </a>
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
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center shadow-lg group-hover:bg-red-400 transition-colors">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
          {/* Mobile Cart Icon and Hamburger */}
          <div className="md:hidden flex items-center gap-2">
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
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center shadow-lg group-hover:bg-red-400 transition-colors">
                  {itemCount}
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
        {open && (
          <div className="md:hidden fixed top-16 left-0 w-full bg-black/95 backdrop-blur border-b border-neutral-800 z-[60] shadow-lg pb-safe transition-all duration-300 ease-in-out animate-in slide-in-from-top-2">
            <div className="flex flex-col gap-4 py-8 px-6">
              <Link href="/dywaniki" className="text-white/90 hover:text-white text-lg font-medium" onClick={() => setOpen(false)}>Dywaniki Samochodowe</Link>
              <Link href="/akcesoria" className="text-white/90 hover:text-white text-lg font-medium" onClick={() => setOpen(false)}>Akcesoria</Link>
              <Link href="/galeria" onClick={handleGalleryClick} className="text-white/90 hover:text-white text-lg font-medium">Galeria</Link>
              <Link href="/konfigurator" className="text-red-400 hover:text-red-300 text-lg font-medium" onClick={() => setOpen(false)}>Konfigurator</Link>
              <Link href="/o-nas" className="text-white/90 hover:text-white text-lg font-medium" onClick={() => setOpen(false)}>O Nas</Link>
              <Link href="/kontakt" className="text-white/90 hover:text-white text-lg font-medium" onClick={() => setOpen(false)}>Kontakt</Link>
              <a href="tel:+48570123635" className="text-white/90 hover:text-white text-lg font-medium" onClick={() => setOpen(false)}>
                +48 570 123 635
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Cart Modal */}
      <CartModalWrapper isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
} 