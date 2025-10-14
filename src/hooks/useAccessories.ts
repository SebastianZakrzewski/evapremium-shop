import { useState, useEffect, useCallback } from 'react';
import { Accessory, AccessoryFilters } from '@/lib/types/accessory';
import { debugLog } from '@/lib/config/features';

export interface UseAccessoriesReturn {
  accessories: Accessory[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook do pobierania listy akcesoriów
 * 
 * @example
 * ```tsx
 * const { accessories, loading, error } = useAccessories({
 *   category: 'organizery',
 *   inStock: true
 * });
 * 
 * if (loading) return <Spinner />;
 * if (error) return <Error message={error} />;
 * 
 * return accessories.map(acc => <AccessoryCard key={acc.id} accessory={acc} />);
 * ```
 */
export function useAccessories(filters?: AccessoryFilters): UseAccessoriesReturn {
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccessories = useCallback(async () => {
    setLoading(true);
    setError(null);
    debugLog('useAccessories: Fetching accessories', filters);

    try {
      // Build query string
      const queryParams = new URLSearchParams();
      
      if (filters?.categories && filters.categories.length > 0) {
        queryParams.set('category', filters.categories[0]); // API supports single category
      }
      
      if (filters?.inStock !== undefined) {
        queryParams.set('inStock', String(filters.inStock));
      }
      
      if (filters?.priceRange) {
        queryParams.set('priceMin', String(filters.priceRange[0]));
        queryParams.set('priceMax', String(filters.priceRange[1]));
      }
      
      if (filters?.orderBy) {
        queryParams.set('orderBy', filters.orderBy);
      }
      
      if (filters?.orderDirection) {
        queryParams.set('orderDirection', filters.orderDirection);
      }

      const queryString = queryParams.toString();
      const url = `/api/accessories${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch accessories');
      }

      if (result.success) {
        debugLog('useAccessories: Accessories fetched', result.data);
        setAccessories(result.data || []);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd';
      console.error('useAccessories: Error fetching accessories:', err);
      setError(errorMessage);
      setAccessories([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAccessories();
  }, [fetchAccessories]);

  return {
    accessories,
    loading,
    error,
    refetch: fetchAccessories,
  };
}

/**
 * Hook do pobierania pojedynczego akcesorium po ID
 */
export function useAccessory(id?: string) {
  const [accessory, setAccessory] = useState<Accessory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setAccessory(null);
      return;
    }

    const fetchAccessory = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/accessories/${id}`);
        const result = await response.json();

        if (!response.ok) {
          if (response.status === 404) {
            setAccessory(null);
            return;
          }
          throw new Error(result.error || 'Failed to fetch accessory');
        }

        if (result.success && result.data) {
          debugLog('useAccessory: Accessory fetched', result.data);
          setAccessory(result.data);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd';
        console.error('useAccessory: Error fetching accessory:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAccessory();
  }, [id]);

  return { accessory, loading, error };
}

/**
 * Hook do pobierania akcesorium po slug (SEO URL)
 */
export function useAccessoryBySlug(slug?: string) {
  const [accessory, setAccessory] = useState<Accessory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setAccessory(null);
      return;
    }

    const fetchAccessory = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/accessories/slug/${slug}`);
        const result = await response.json();

        if (!response.ok) {
          if (response.status === 404) {
            setAccessory(null);
            return;
          }
          throw new Error(result.error || 'Failed to fetch accessory');
        }

        if (result.success && result.data) {
          debugLog('useAccessoryBySlug: Accessory fetched', result.data);
          setAccessory(result.data);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd';
        console.error('useAccessoryBySlug: Error fetching accessory:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAccessory();
  }, [slug]);

  return { accessory, loading, error };
}

