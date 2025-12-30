import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api/client';

export interface MatProductImage {
  id: number;
  car_brand_slug: string;
  car_model_slug: string;
  generation: string | null;
  year: number | null;
  body_type: string | null;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UseMatProductImagesParams {
  brand?: string;
  model?: string;
  year?: number;
  generation?: string;
  bodyType?: string;
  enabled?: boolean;
}

export interface UseMatProductImagesReturn {
  images: MatProductImage[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook do pobierania zdjęć produktów mat z tabeli mat_product_images
 * 
 * @param params - Parametry zapytania (marka, model, rok, generacja, typ nadwozia)
 * @returns Obiekt z listą zdjęć, stanem ładowania i błędem
 * 
 * @example
 * ```ts
 * const { images, isLoading } = useMatProductImages({
 *   brand: 'Dacia',
 *   model: 'Spring',
 *   year: 2021,
 *   bodyType: 'suv'
 * });
 * ```
 */
export function useMatProductImages(
  params: UseMatProductImagesParams = {}
): UseMatProductImagesReturn {
  const { brand, model, year, generation, bodyType, enabled = true } = params;

  // Buduj URL z parametrami
  const buildQueryUrl = () => {
    const searchParams = new URLSearchParams();
    
    if (brand) searchParams.set('brand', brand);
    if (model) searchParams.set('model', model);
    if (year) searchParams.set('year', year.toString());
    if (generation) searchParams.set('generation', generation);
    if (bodyType) searchParams.set('bodyType', bodyType);

    return `/api/mat-product-images?${searchParams.toString()}`;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['mat-product-images', brand, model, year, generation, bodyType],
    queryFn: async () => {
      const url = buildQueryUrl();
      const response = await apiGet<{ images: MatProductImage[]; count: number }>(url);
      return response;
    },
    enabled: enabled && !!(brand && model), // Włącz tylko gdy mamy markę i model
    staleTime: 10 * 60 * 1000, // 10 minut cache
    gcTime: 30 * 60 * 1000, // 30 minut cache
    retry: 2,
    retryDelay: 1000,
  });

  return {
    images: data?.images || [],
    isLoading,
    error: error as Error | null,
  };
}






