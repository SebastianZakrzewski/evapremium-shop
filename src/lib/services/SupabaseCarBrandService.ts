import { supabaseAdmin, TABLES } from '../database/supabase';
import { CarBrand, CreateCarBrandRequest, UpdateCarBrandRequest } from '../types/car-brand';

export class SupabaseCarBrandService {
  /**
   * Get all car brands
   */
  static async getAllCarBrands(): Promise<CarBrand[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from(TABLES.CAR_BRANDS)
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(brand => ({
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
      const { data, error } = await supabaseAdmin
        .from(TABLES.CAR_BRANDS)
        .select('*')
        .eq('isActive', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
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
      const { data, error } = await supabaseAdmin
        .from(TABLES.CAR_BRANDS)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
      }
      return data;
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
      const { data, error } = await supabaseAdmin
        .from(TABLES.CAR_BRANDS)
        .select('*')
        .eq('name', name)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
      }
      return data;
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
      const { data: result, error } = await supabaseAdmin
        .from(TABLES.CAR_BRANDS)
        .insert([{
          name: data.name,
          displayName: data.displayName,
          logo: data.logo,
          description: data.description,
          website: data.website,
          isActive: data.isActive ?? true
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
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
      const { data: result, error } = await supabaseAdmin
        .from(TABLES.CAR_BRANDS)
        .update({
          name: data.name,
          displayName: data.displayName,
          logo: data.logo,
          description: data.description,
          website: data.website,
          isActive: data.isActive
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
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
      const { error } = await supabaseAdmin
        .from(TABLES.CAR_BRANDS)
        .delete()
        .eq('id', id);

      if (error) throw error;
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
      const { data, error } = await supabaseAdmin
        .from(TABLES.CAR_BRANDS)
        .update({ isActive: false })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { data, error } = await supabaseAdmin
        .from(TABLES.CAR_BRANDS)
        .update({ isActive: true })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error activating car brand:', error);
      throw new Error('Failed to activate car brand');
    }
  }
}
