/**
 * Brand API functions
 * 
 * Centralized API calls for brand-related endpoints
 */

import { apiGet } from './client';
import { Brand } from '@/entities/car';

/**
 * Fetch all car brands
 */
export async function fetchBrands(): Promise<Brand[]> {
  try {
    return await apiGet<Brand[]>('/api/car-brands');
  } catch (error) {
    console.error('Error fetching brands:', error);
    // Return fallback brands on error
    return getFallbackBrands();
  }
}

/**
 * Fallback brands used when API is unavailable
 */
export function getFallbackBrands(): Brand[] {
  return [
    {
      id: 1,
      name: "BMW",
      logo: "/images/products/bmw.png",
      description: "Niemiecka marka sportowa"
    },
    {
      id: 2,
      name: "Mercedes",
      logo: "/images/products/mercedes.jpg",
      description: "Niemiecka marka luksusowa"
    },
    {
      id: 3,
      name: "Audi",
      logo: "/images/products/audi.jpg",
      description: "Niemiecka marka premium"
    },
    {
      id: 4,
      name: "Tesla",
      logo: "/images/products/tesla.avif",
      description: "Amerykańska marka elektryczna"
    },
    {
      id: 5,
      name: "Porsche",
      logo: "/images/products/porsche.png",
      description: "Niemiecka marka sportowa"
    }
  ];
}




