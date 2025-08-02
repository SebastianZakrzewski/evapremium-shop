import { prisma } from '../database/prisma';
import { CarBrand, CreateCarBrandRequest, UpdateCarBrandRequest } from '../types/car-brand';

export class CarBrandService {
  /**
   * Get all car brands
   */
  static async getAllCarBrands(): Promise<CarBrand[]> {
    try {
      const carBrands = await prisma.carBrand.findMany(
        {orderBy: { name: 'asc' }});
      return carBrands.map(brand => ({
        ...brand,
        displayName: brand.displayName || undefined,
        logo: brand.logo || undefined,
        description: brand.description || undefined,
        website: brand.website || undefined,
      }));
    } catch (error) {
      console.error('Error fetching car brands:', error);
      throw new Error('Failed to fetch car brands');
    }
  }

  /**
   * Get active car brands only
   */
  static async getActiveCarBrands(): Promise<CarBrand[]> {
    try {
      const carBrands = await prisma.carBrand.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      });
      return carBrands;
    } catch (error) {
      console.error('Error fetching active car brands:', error);
      throw new Error('Failed to fetch active car brands');
    }
  }

  /**
   * Get car brand by ID
   */
  static async getCarBrandById(id: number): Promise<CarBrand | null> {
    try {
      const carBrand = await prisma.carBrand.findUnique({
        where: { id }
      });
      return carBrand;
    } catch (error) {
      console.error('Error fetching car brand by ID:', error);
      throw new Error('Failed to fetch car brand');
    }
  }

  /**
   * Get car brand by name
   */
  static async getCarBrandByName(name: string): Promise<CarBrand | null> {
    try {
      const carBrand = await prisma.carBrand.findUnique({
        where: { name }
      });
      return carBrand;
    } catch (error) {
      console.error('Error fetching car brand by name:', error);
      throw new Error('Failed to fetch car brand');
    }
  }

  /**
   * Create a new car brand
   */
  static async createCarBrand(data: CreateCarBrandRequest): Promise<CarBrand> {
    try {
      const carBrand = await prisma.carBrand.create({
        data: {
          name: data.name,
          displayName: data.displayName,
          logo: data.logo,
          description: data.description,
          website: data.website,
          isActive: data.isActive ?? true
        }
      });
      return carBrand;
    } catch (error) {
      console.error('Error creating car brand:', error);
      throw new Error('Failed to create car brand');
    }
  }

  /**
   * Update an existing car brand
   */
  static async updateCarBrand(id: number, data: UpdateCarBrandRequest): Promise<CarBrand> {
    try {
      const carBrand = await prisma.carBrand.update({
        where: { id },
        data: {
          name: data.name,
          displayName: data.displayName,
          logo: data.logo,
          description: data.description,
          website: data.website,
          isActive: data.isActive
        }
      });
      return carBrand;
    } catch (error) {
      console.error('Error updating car brand:', error);
      throw new Error('Failed to update car brand');
    }
  }

  /**
   * Delete a car brand
   */
  static async deleteCarBrand(id: number): Promise<void> {
    try {
      await prisma.carBrand.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error deleting car brand:', error);
      throw new Error('Failed to delete car brand');
    }
  }

  /**
   * Soft delete a car brand (set isActive to false)
   */
  static async deactivateCarBrand(id: number): Promise<CarBrand> {
    try {
      const carBrand = await prisma.carBrand.update({
        where: { id },
        data: { isActive: false }
      });
      return carBrand;
    } catch (error) {
      console.error('Error deactivating car brand:', error);
      throw new Error('Failed to deactivate car brand');
    }
  }

  /**
   * Reactivate a car brand (set isActive to true)
   */
  static async activateCarBrand(id: number): Promise<CarBrand> {
    try {
      const carBrand = await prisma.carBrand.update({
        where: { id },
        data: { isActive: true }
      });
      return carBrand;
    } catch (error) {
      console.error('Error activating car brand:', error);
      throw new Error('Failed to activate car brand');
    }
  }
} 