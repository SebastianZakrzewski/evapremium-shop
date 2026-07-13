/**
 * Search API Service
 * 
 * Centralized API calls for search endpoints
 */

import { apiGet, ApiError } from './client';
import { toComparableSearchQuery } from '@/shared/vehicle/searchQuery';

export interface SearchBrand {
  id: number;
  name: string;
  logo: string;
  description: string;
}

export interface SearchModel {
  brand: string;
  model: string;
  modelFamilyKey?: string;
  displayLabel?: string;
  generation?: string;
  bodyType?: string;
  bodyTypeDisplay?: string;
  bodyTypes: string[];
  isCurrentlyProduced: boolean;
}

export interface SearchProduct {
  id: string;
  carBrandSlug: string;
  carModelSlug: string;
  generation?: string;
  bodyType?: string;
  basePrice: number;
}

export interface SearchResults {
  brands: SearchBrand[];
  models: SearchModel[];
  products: SearchProduct[];
}

interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
}

/**
 * Search for brands, models, and products
 */
export async function search(query: string): Promise<SearchResults> {
  const normalizedQuery = toComparableSearchQuery(query)
  if (!normalizedQuery) {
    return { brands: [], models: [], products: [] };
  }

  try {
    const response = await apiGet<SearchResults | ApiResponse<SearchResults>>(
      `/api/search?q=${encodeURIComponent(normalizedQuery)}`
    );
    
    // API może zwracać bezpośrednio SearchResults lub opakowane w ApiResponse
    if ('brands' in response && 'models' in response && 'products' in response) {
      return response as SearchResults;
    }
    
    // Jeśli jest opakowane w ApiResponse
    const apiResponse = response as ApiResponse<SearchResults>;
    if (apiResponse.success && apiResponse.data) {
      return apiResponse.data;
    }
    
    if (apiResponse.error) {
      throw new ApiError(apiResponse.error, 400, apiResponse);
    }
    
    return { brands: [], models: [], products: [] };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Nieznany błąd',
      500,
      error
    );
  }
}

/**
 * Search API object with all methods
 */
export const searchApi = {
  search,
};

