/**
 * Mats API Service
 * 
 * Centralized API calls for mat-related endpoints
 */

import { apiGet, apiPost, ApiError } from './client';
import { Mat, MatFilters } from '@/entities/product';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface FindMatParams {
  brandSlug: string;
  modelSlug: string;
  generation?: string;
  bodyType?: string;
}

/**
 * Find mat for specific car
 */
export async function findMat(params: FindMatParams): Promise<Mat | null> {
  try {
    const response = await apiPost<ApiResponse<Mat>>('/api/mats/find', params);
    
    if (!response.success) {
      if (response.error?.includes('not found') || response.error?.includes('404')) {
        return null;
      }
      throw new ApiError(
        response.error || 'Nie udało się znaleźć dywaników',
        404,
        response
      );
    }
    
    return response.data || null;
  } catch (error) {
    if (error instanceof ApiError) {
      // Handle 404 as null, not an error
      if (error.status === 404) {
        return null;
      }
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
 * Get mats with filters
 */
export async function getMats(filters?: MatFilters): Promise<Mat[]> {
  try {
    const params = new URLSearchParams();
    
    if (filters?.carBrandSlug) {
      params.append('brandSlug', filters.carBrandSlug);
    }
    if (filters?.carModelSlug) {
      params.append('modelSlug', filters.carModelSlug);
    }
    if (filters?.generation) {
      params.append('generation', filters.generation);
    }
    if (filters?.bodyType) {
      params.append('bodyType', filters.bodyType);
    }
    if (filters?.isActive !== undefined) {
      params.append('isActive', String(filters.isActive));
    }
    
    const queryString = params.toString();
    const url = `/api/mats${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiGet<ApiResponse<Mat[]>>(url);
    
    if (!response.success) {
      // Return empty array on error instead of throwing
      console.warn('getMats: API returned error, using empty array as fallback', response.error);
      return [];
    }
    
    return response.data || [];
  } catch (error) {
    // Return empty array on error instead of throwing
    console.warn('getMats: Error fetching mats, using empty array as fallback', error);
    return [];
  }
}

/**
 * Get available body types for brand and model
 */
export async function getBodyTypes(
  brandSlug: string,
  modelSlug: string
): Promise<string[]> {
  try {
    const response = await apiGet<ApiResponse<string[]>>(
      `/api/mats/body-types?brandSlug=${encodeURIComponent(brandSlug)}&modelSlug=${encodeURIComponent(modelSlug)}`
    );
    
    if (!response.success) {
      throw new ApiError(
        response.error || 'Nie udało się pobrać typów nadwozia',
        400,
        response
      );
    }
    
    return response.data || [];
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
 * Mats API object with all methods
 */
export const matsApi = {
  findMat,
  getMats,
  getBodyTypes,
};

