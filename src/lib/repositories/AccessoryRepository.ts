import { BaseRepository } from './BaseRepository';
import { Accessory, AccessoryFilters } from '../types/accessory';

export class AccessoryRepository extends BaseRepository<Accessory> {
  protected tableName = 'accessories';

  async findByCategory(categorySlug: string): Promise<Accessory[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        accessory_categories(*)
      `)
      .eq('accessory_categories.slug', categorySlug)
      .eq('is_active', true);

    if (error) {
      throw new Error(`Error finding accessories by category: ${error.message}`);
    }

    return data || [];
  }

  async findBySlug(slug: string): Promise<Accessory | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        accessory_categories(*)
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Error finding accessory by slug: ${error.message}`);
    }

    return data;
  }

  async findMany(filters?: AccessoryFilters): Promise<Accessory[]> {
    let query = this.supabase
      .from(this.tableName)
      .select(`
        *,
        accessory_categories(*)
      `);

    if (filters?.categories && filters.categories.length > 0) {
      query = query.in('accessory_categories.slug', filters.categories);
    }

    if (filters?.inStock !== undefined) {
      query = query.eq('in_stock', filters.inStock);
    }

    if (filters?.priceRange) {
      query = query
        .gte('price', filters.priceRange[0])
        .lte('price', filters.priceRange[1]);
    }

    if (filters?.orderBy) {
      const orderDirection = filters.orderDirection || 'desc';
      query = query.order(filters.orderBy, { ascending: orderDirection !== 'desc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error finding accessories: ${error.message}`);
    }

    return data || [];
  }

  async findBySku(sku: string): Promise<Accessory | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('sku', sku)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Error finding accessory by SKU: ${error.message}`);
    }

    return data;
  }

  async decrementStock(id: string, quantity: number): Promise<void> {
    // First get current stock
    const accessory = await this.findById(id);
    if (!accessory) {
      throw new Error('Accessory not found');
    }

    if (accessory.stockQuantity === null) {
      throw new Error('Stock quantity is unlimited');
    }

    if (accessory.stockQuantity! < quantity) {
      throw new Error('Insufficient stock');
    }

    // Update stock
    const { error } = await this.supabase
      .from(this.tableName)
      .update({
        stock_quantity: accessory.stockQuantity! - quantity
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Error decrementing stock: ${error.message}`);
    }
  }
}
