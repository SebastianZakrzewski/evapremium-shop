/**
 * Hook do pobierania marek samochodów
 * 
 * Używa React Query do cache'owania i zarządzania stanem
 * Automatycznie używa fallback brands w przypadku błędu
 */

import { useQuery } from '@tanstack/react-query';
import { fetchBrands, getFallbackBrands } from '@/lib/api/brands';
import { Brand } from '@/entities/car';

export interface UseBrandsReturn {
  brands: Brand[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook do pobierania wszystkich marek samochodów
 * 
 * @param options - Opcjonalne opcje konfiguracji
 * @returns Obiekt z markami, stanem ładowania i błędem
 */
export function useBrands(options?: {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}): UseBrandsReturn {
  const { data, isLoading, error } = useQuery({
    queryKey: ['car-brands'],
    queryFn: fetchBrands,
    staleTime: options?.staleTime ?? 10 * 60 * 1000, // 10 minut
    gcTime: options?.gcTime ?? 30 * 60 * 1000, // 30 minut cache
    retry: 2,
    retryDelay: 1000,
    enabled: options?.enabled ?? true,
  });

  return {
    brands: data ?? getFallbackBrands(),
    isLoading,
    error: error as Error | null,
  };
}





