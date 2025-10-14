import { BaseRepository } from './BaseRepository';
import { Mat, MatFilters } from '../types/mat';

export class MatRepository extends BaseRepository<Mat> {
  protected tableName = 'mats';

  async findByCarDetails(params: {
    brandSlug: string;
    modelSlug: string;
    generation?: string;
    bodyType?: string;
  }): Promise<Mat | null> {
    let query = this.supabase
      .from(this.tableName)
      .select('*')
      .eq('car_brand_slug', params.brandSlug)
      .eq('car_model_slug', params.modelSlug)
      .eq('is_active', true);

    if (params.generation) {
      query = query.eq('generation', params.generation);
    }

    if (params.bodyType) {
      query = query.eq('body_type', params.bodyType);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Error finding mat by car details: ${error.message}`);
    }

    return data;
  }

  async findMany(filters?: MatFilters): Promise<Mat[]> {
    let query = this.supabase.from(this.tableName).select('*');

    if (filters?.carBrandSlug) {
      query = query.eq('car_brand_slug', filters.carBrandSlug);
    }

    if (filters?.carModelSlug) {
      query = query.eq('car_model_slug', filters.carModelSlug);
    }

    if (filters?.generation) {
      query = query.eq('generation', filters.generation);
    }

    if (filters?.bodyType) {
      query = query.eq('body_type', filters.bodyType);
    }

    if (filters?.yearFrom) {
      query = query.gte('year_from', filters.yearFrom);
    }

    if (filters?.yearTo) {
      query = query.lte('year_to', filters.yearTo);
    }

    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    if (filters?.orderBy) {
      const orderDirection = filters.orderDirection || 'asc';
      query = query.order(filters.orderBy, { ascending: orderDirection !== 'desc' });
    } else {
      query = query.order('car_brand_slug', { ascending: true })
        .order('car_model_slug', { ascending: true });
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error finding mats: ${error.message}`);
    }

    return data || [];
  }

  async findByBrandAndModel(brandSlug: string, modelSlug: string): Promise<Mat[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('car_brand_slug', brandSlug)
      .eq('car_model_slug', modelSlug)
      .eq('is_active', true)
      .order('generation', { ascending: true });

    if (error) {
      throw new Error(`Error finding mats by brand and model: ${error.message}`);
    }

    return data || [];
  }

  async findAvailableBodyTypes(brandSlug: string, modelSlug: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('body_type')
      .eq('car_brand_slug', brandSlug)
      .eq('car_model_slug', modelSlug)
      .eq('is_active', true)
      .not('body_type', 'is', null);

    if (error) {
      throw new Error(`Error finding available body types: ${error.message}`);
    }

    const bodyTypes = data?.map(item => item.body_type).filter(Boolean) || [];
    return [...new Set(bodyTypes)]; // Remove duplicates
  }

  async findAvailableGenerations(brandSlug: string, modelSlug: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('generation')
      .eq('car_brand_slug', brandSlug)
      .eq('car_model_slug', modelSlug)
      .eq('is_active', true)
      .not('generation', 'is', null);

    if (error) {
      throw new Error(`Error finding available generations: ${error.message}`);
    }

    const generations = data?.map(item => item.generation).filter(Boolean) || [];
    return [...new Set(generations)]; // Remove duplicates
  }
}
