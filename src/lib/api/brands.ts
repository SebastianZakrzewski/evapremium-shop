/**
 * Brand API functions
 * 
 * Centralized API calls for brand-related endpoints
 */

import { apiGet } from './client';
import { Brand } from '@/entities/car';
import { normalizeBrandForClient } from '@/shared/brands';

/**
 * Fetch all car brands
 */
export async function fetchBrands(): Promise<Brand[]> {
  try {
    const brands = await apiGet<Brand[]>('/api/car-brands');
    return brands.map(normalizeBrandForClient);
  } catch (error) {
    console.error('Error fetching brands:', error);
    // Return fallback brands on error
    return getFallbackBrands();
  }
}

/**
 * Fallback brands used when API is unavailable.
 * Zdjęcia marek znajdują się w katalogu public/modele/
 */
export function getFallbackBrands(): Brand[] {
  return [
    { id: 1, name: "BMW", logo: "/modele/bmw.png", description: "Niemiecka marka sportowa" },
    { id: 2, name: "Mercedes", logo: "/modele/mercedes_benz.jpg", description: "Niemiecka marka luksusowa" },
    { id: 3, name: "Audi", logo: "/modele/audi.avif", description: "Niemiecka marka premium" },
    { id: 4, name: "Tesla", logo: "/modele/tesla.avif", description: "Amerykańska marka elektryczna" },
    { id: 5, name: "Porsche", logo: "/modele/porsche.jpg", description: "Niemiecka marka sportowa" }
  ];
}




