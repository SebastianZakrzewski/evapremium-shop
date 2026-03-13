/**
 * Car Models API functions
 *
 * Centralized API calls for car model-related endpoints
 */

import { apiGet } from './client';
import type { CarModelApiResponse } from '@/lib/types/api';

/**
 * Fetch car models by brand API name
 *
 * @param brandName - Brand API name (e.g., "Bmw", "Mercedes-Benz")
 * @returns Array of car models with generations
 */
export async function fetchCarModels(brandName: string): Promise<CarModelApiResponse[]> {
  if (!brandName) {
    console.warn('fetchCarModels: brandName is required');
    return [];
  }

  try {
    // API endpoint /api/models oczekuje parametru 'brand', nie 'brandName'
    const models = await apiGet<CarModelApiResponse[]>(`/api/models?brand=${encodeURIComponent(brandName)}`);
    return Array.isArray(models) ? models : [];
  } catch (error) {
    console.error('Error fetching car models:', error);
    return [];
  }
}

/**
 * Fetch car models by brand slug
 * 
 * @param brandSlug - Brand slug from URL (e.g., "bmw", "mercedes-benz")
 * @returns Array of car models
 */
export async function fetchCarModelsBySlug(brandSlug: string): Promise<CarModelApiResponse[]> {
  if (!brandSlug) {
    console.warn('fetchCarModelsBySlug: brandSlug is required');
    return [];
  }

  // Import here to avoid circular dependency
  const { normalizeBrandName } = await import('@/shared/brands');
  const brandApiName = normalizeBrandName(brandSlug);
  
  if (!brandApiName) {
    console.warn(`fetchCarModelsBySlug: Could not resolve brand API name for slug "${brandSlug}"`);
    return [];
  }

  return fetchCarModels(brandApiName);
}

