import { useState, useEffect } from 'react';
import { Mat } from '@/lib/types';
import { debugLog } from '@/lib/config/features';

interface UseMatParams {
  brandSlug?: string;
  modelSlug?: string;
  generation?: string;
  bodyType?: string;
}

interface UseMatReturn {
  mat: Mat | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook do pobierania informacji o dywanikach dla konkretnego samochodu
 * 
 * @example
 * ```tsx
 * const { mat, loading, error } = useMat({
 *   brandSlug: 'bmw',
 *   modelSlug: '3-series',
 *   generation: 'F30',
 *   bodyType: 'sedan'
 * });
 * 
 * if (loading) return <Spinner />;
 * if (error) return <Error message={error} />;
 * if (!mat) return <NotFound />;
 * 
 * return <MatConfigurator mat={mat} />;
 * ```
 */
export function useMat(params: UseMatParams): UseMatReturn {
  const [mat, setMat] = useState<Mat | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMat = async () => {
    // Reset state
    setMat(null);
    setError(null);

    // Walidacja - wymagane minimum brand i model
    if (!params.brandSlug || !params.modelSlug) {
      debugLog('useMat: Missing required params', params);
      return;
    }

    setLoading(true);
    debugLog('useMat: Fetching mat for', params);

    try {
      const response = await fetch('/api/mats/find', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brandSlug: params.brandSlug,
          modelSlug: params.modelSlug,
          generation: params.generation,
          bodyType: params.bodyType,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch mat');
      }

      if (result.success && result.data) {
        debugLog('useMat: Mat found', result.data);
        setMat(result.data);
      } else {
        debugLog('useMat: No mat found for params', params);
        setError('Nie znaleziono dywaników dla tego samochodu');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd';
      console.error('useMat: Error fetching mat:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch mat when params change
  useEffect(() => {
    fetchMat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.brandSlug, params.modelSlug, params.generation, params.bodyType]);

  return {
    mat,
    loading,
    error,
    refetch: fetchMat,
  };
}

/**
 * Hook do pobierania dostępnych typów nadwozia dla marki i modelu
 */
export function useAvailableBodyTypes(brandSlug?: string, modelSlug?: string) {
  const [bodyTypes, setBodyTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!brandSlug || !modelSlug) {
      setBodyTypes([]);
      return;
    }

    const fetchBodyTypes = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/mats/body-types?brandSlug=${brandSlug}&modelSlug=${modelSlug}`
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch body types');
        }

        if (result.success) {
          debugLog('useAvailableBodyTypes: Found body types', result.data);
          setBodyTypes(result.data);
        }
      } catch (err) {
        console.error('useAvailableBodyTypes: Error:', err);
        setError(err instanceof Error ? err.message : 'Nieznany błąd');
      } finally {
        setLoading(false);
      }
    };

    fetchBodyTypes();
  }, [brandSlug, modelSlug]);

  return { bodyTypes, loading, error };
}

