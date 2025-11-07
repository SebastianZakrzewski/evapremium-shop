/**
 * Hook usePageView - automatyczne śledzenie zmian route w Next.js App Router
 */

'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '../events';
import type { PageViewData } from '../types';

/**
 * Mapowanie pathname na nazwę strony
 */
function getPageName(pathname: string): string {
  const routeMap: Record<string, string> = {
    '/': 'Home',
    '/konfigurator': 'Configurator',
    '/checkout': 'Checkout',
    '/payment/success': 'Payment Success',
    '/akcesoria': 'Accessories',
    '/modele': 'Car Models',
    '/kontakt': 'Contact',
    '/o-nas': 'About',
    '/polityka-prywatnosci': 'Privacy Policy',
    '/regulamin': 'Terms',
    '/zasady-dostawy-platnosci': 'Shipping & Payment',
    '/zwroty-wymiany': 'Returns & Exchanges',
  };

  // Sprawdź dokładne dopasowanie
  if (routeMap[pathname]) {
    return routeMap[pathname];
  }

  // Sprawdź dynamiczne route
  if (pathname.startsWith('/akcesoria/')) {
    return 'Accessories Category';
  }
  if (pathname.startsWith('/modele/')) {
    return 'Car Models Brand';
  }

  // Domyślnie użyj pathname
  return pathname.split('/').pop() || 'Unknown';
}

/**
 * Mapowanie pathname na kategorię
 */
function getPageCategory(pathname: string): string {
  if (pathname === '/' || pathname.startsWith('/o-nas') || pathname.startsWith('/kontakt')) {
    return 'Landing';
  }
  if (pathname.startsWith('/konfigurator') || pathname.startsWith('/akcesoria') || pathname.startsWith('/modele')) {
    return 'Product';
  }
  if (pathname.startsWith('/checkout') || pathname.startsWith('/payment')) {
    return 'Checkout';
  }
  return 'Other';
}

/**
 * Hook do automatycznego śledzenia PageView przy zmianie route
 */
export function usePageView(): void {
  const pathname = usePathname();
  const previousPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    // Pomiń pierwszy render (już obsłużony przez layout)
    if (previousPathnameRef.current === null) {
      previousPathnameRef.current = pathname;
      return;
    }

    // Pomiń jeśli pathname się nie zmienił
    if (previousPathnameRef.current === pathname) {
      return;
    }

    // Sprawdź czy event nie został już wysłany dla tego route (deduplikacja)
    const cacheKey = `pageview_${pathname}`;
    const cached = sessionStorage.getItem(cacheKey);
    
    if (cached) {
      previousPathnameRef.current = pathname;
      return;
    }

    // Przygotuj dane PageView
    const pageViewData: PageViewData = {
      content_name: getPageName(pathname),
      content_category: getPageCategory(pathname),
      page_path: pathname,
      page_title: typeof document !== 'undefined' ? document.title : undefined,
    };

    // Wyślij event
    trackPageView(pageViewData);

    // Zapisz w cache (ważność: sesja)
    sessionStorage.setItem(cacheKey, Date.now().toString());
    previousPathnameRef.current = pathname;
  }, [pathname]);
}

