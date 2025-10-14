import { BaseRepository } from './BaseRepository';
import { AccessoryCategory } from '../types/accessory';

export class AccessoryCategoryRepository extends BaseRepository<AccessoryCategory> {
  protected tableName = 'accessory_categories';

  async findActive(): Promise<AccessoryCategory[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      throw new Error(`Error finding active categories: ${error.message}`);
    }

    return data || [];
  }

  async findBySlug(slug: string): Promise<AccessoryCategory | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Error finding category by slug: ${error.message}`);
    }

    return data;
  }
}
