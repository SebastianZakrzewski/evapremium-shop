import { supabaseAdmin, TABLES } from '../database/supabase';

export interface CreateCarModelData {
  name: string;
  displayName?: string;
  yearFrom?: number;
  yearTo?: number;
  generation?: string;
  bodyType?: string;
  engineType?: string;
  carBrandId: number;
}

export interface UpdateCarModelData extends Partial<CreateCarModelData> {
  id: number;
}

export interface CarModel {
  id: number;
  name: string;
  displayName?: string;
  yearFrom?: number;
  yearTo?: number;
  generation?: string;
  bodyType?: string;
  engineType?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  carBrandId: number;
  carBrand?: {
    id: number;
    name: string;
    displayName?: string;
    logo?: string;
    description?: string;
    website?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export class SupabaseCarModelService {
  /**
   * Pobiera wszystkie modele aut z informacjami o marce
   */
  static async getAllCarModels(): Promise<CarModel[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from(TABLES.CAR_MODELS)
        .select(`
          *,
          carBrand:car_brands(*)
        `)
        .eq('isActive', true)
        .order('carBrand.name', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching car models:', error);
      throw new Error('Failed to fetch car models');
    }
  }

  /**
   * Pobiera modele aut dla konkretnej marki
   */
  static async getCarModelsByBrand(brandId: number): Promise<CarModel[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from(TABLES.CAR_MODELS)
        .select('*')
        .eq('carBrandId', brandId)
        .eq('isActive', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching car models by brand:', error);
      throw new Error('Failed to fetch car models by brand');
    }
  }

  /**
   * Pobiera model auta po ID
   */
  static async getCarModelById(id: number): Promise<CarModel | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(TABLES.CAR_MODELS)
        .select(`
          *,
          carBrand:car_brands(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching car model by ID:', error);
      throw new Error('Failed to fetch car model by ID');
    }
  }

  /**
   * Tworzy nowy model auta
   */
  static async createCarModel(data: CreateCarModelData): Promise<CarModel> {
    try {
      const { data: result, error } = await supabaseAdmin
        .from(TABLES.CAR_MODELS)
        .insert([data])
        .select(`
          *,
          carBrand:car_brands(*)
        `)
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error creating car model:', error);
      throw new Error('Failed to create car model');
    }
  }

  /**
   * Aktualizuje model auta
   */
  static async updateCarModel(data: UpdateCarModelData): Promise<CarModel> {
    try {
      const { id, ...updateData } = data;
      const { data: result, error } = await supabaseAdmin
        .from(TABLES.CAR_MODELS)
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          carBrand:car_brands(*)
        `)
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error updating car model:', error);
      throw new Error('Failed to update car model');
    }
  }

  /**
   * Usuwa model auta (soft delete)
   */
  static async deleteCarModel(id: number): Promise<CarModel> {
    try {
      const { data, error } = await supabaseAdmin
        .from(TABLES.CAR_MODELS)
        .update({ isActive: false })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error deleting car model:', error);
      throw new Error('Failed to delete car model');
    }
  }

  /**
   * Pobiera modele aut z filtrowaniem
   */
  static async getCarModelsWithFilters(filters: {
    brandId?: number;
    bodyType?: string;
    engineType?: string;
    yearFrom?: number;
    yearTo?: number;
  }): Promise<CarModel[]> {
    try {
      let query = supabaseAdmin
        .from(TABLES.CAR_MODELS)
        .select(`
          *,
          carBrand:car_brands(*)
        `)
        .eq('isActive', true);

      if (filters.brandId) {
        query = query.eq('carBrandId', filters.brandId);
      }

      if (filters.bodyType) {
        query = query.eq('bodyType', filters.bodyType);
      }

      if (filters.engineType) {
        query = query.eq('engineType', filters.engineType);
      }

      if (filters.yearFrom) {
        query = query.gte('yearFrom', filters.yearFrom);
      }

      if (filters.yearTo) {
        query = query.lte('yearTo', filters.yearTo);
      }

      const { data, error } = await query
        .order('carBrand.name', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching car models with filters:', error);
      throw new Error('Failed to fetch car models with filters');
    }
  }

  /**
   * Pobiera unikalne typy nadwozi
   */
  static async getBodyTypes(): Promise<string[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from(TABLES.CAR_MODELS)
        .select('bodyType')
        .eq('isActive', true)
        .not('bodyType', 'is', null)
        .order('bodyType', { ascending: true });

      if (error) throw error;
      
      const uniqueBodyTypes = [...new Set(data?.map(item => item.bodyType).filter(Boolean) || [])];
      return uniqueBodyTypes;
    } catch (error) {
      console.error('Error fetching body types:', error);
      throw new Error('Failed to fetch body types');
    }
  }

  /**
   * Pobiera unikalne typy silników
   */
  static async getEngineTypes(): Promise<string[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from(TABLES.CAR_MODELS)
        .select('engineType')
        .eq('isActive', true)
        .not('engineType', 'is', null)
        .order('engineType', { ascending: true });

      if (error) throw error;
      
      const uniqueEngineTypes = [...new Set(data?.map(item => item.engineType).filter(Boolean) || [])];
      return uniqueEngineTypes;
    } catch (error) {
      console.error('Error fetching engine types:', error);
      throw new Error('Failed to fetch engine types');
    }
  }
}
