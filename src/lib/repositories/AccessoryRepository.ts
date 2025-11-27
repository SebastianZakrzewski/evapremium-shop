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

    // Mapuj dane z Supabase na typ Accessory
    const mappedData = (data || []).map(item => ({
      ...item,
      imageSrc: item.image_src, // Mapuj image_src na imageSrc
      images: item.images || [], // Tablica obrazów
      availableColors: item.available_colors || [], // Dostępne kolory
      colorImages: item.color_images || {}, // Mapowanie kolor -> obraz
      category: item.accessory_categories ? {
        id: item.accessory_categories.id,
        name: item.accessory_categories.name,
        slug: item.accessory_categories.slug,
        description: item.accessory_categories.description,
        icon: item.accessory_categories.icon,
        isActive: item.accessory_categories.is_active,
        sortOrder: item.accessory_categories.sort_order,
        parentId: item.accessory_categories.parent_id,
        createdAt: new Date(item.accessory_categories.created_at),
        updatedAt: new Date(item.accessory_categories.updated_at)
      } : null,
      // Usuń accessory_categories z obiektu
      accessory_categories: undefined
    }));

    return mappedData;
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

    // Mapuj dane z Supabase na typ Accessory
    const mappedData = {
      ...data,
      imageSrc: data.image_src, // Mapuj image_src na imageSrc
      images: data.images || [], // Tablica obrazów
      availableColors: data.available_colors || [], // Dostępne kolory
      colorImages: data.color_images || {}, // Mapowanie kolor -> obraz
      category: data.accessory_categories ? {
        id: data.accessory_categories.id,
        name: data.accessory_categories.name,
        slug: data.accessory_categories.slug,
        description: data.accessory_categories.description,
        icon: data.accessory_categories.icon,
        isActive: data.accessory_categories.is_active,
        sortOrder: data.accessory_categories.sort_order,
        parentId: data.accessory_categories.parent_id,
        createdAt: new Date(data.accessory_categories.created_at),
        updatedAt: new Date(data.accessory_categories.updated_at)
      } : null,
      // Usuń accessory_categories z obiektu
      accessory_categories: undefined
    };

    return mappedData;
  }

  async findMany(filters?: AccessoryFilters): Promise<Accessory[]> {
    let query = this.supabase
      .from(this.tableName)
      .select(`
        *,
        accessory_categories(*)
      `);

    if (filters?.categories && filters.categories.length > 0) {
      query = query.in('accessory_categories.name', filters.categories);
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

    // Mapuj dane z Supabase na typ Accessory
    const mappedData = (data || []).map(item => ({
      ...item,
      imageSrc: item.image_src, // Mapuj image_src na imageSrc
      images: item.images || [], // Tablica obrazów
      availableColors: item.available_colors || [], // Dostępne kolory
      colorImages: item.color_images || {}, // Mapowanie kolor -> obraz
      category: item.accessory_categories ? {
        id: item.accessory_categories.id,
        name: item.accessory_categories.name,
        slug: item.accessory_categories.slug,
        description: item.accessory_categories.description,
        icon: item.accessory_categories.icon,
        isActive: item.accessory_categories.is_active,
        sortOrder: item.accessory_categories.sort_order,
        parentId: item.accessory_categories.parent_id,
        createdAt: new Date(item.accessory_categories.created_at),
        updatedAt: new Date(item.accessory_categories.updated_at)
      } : null,
      // Usuń accessory_categories z obiektu
      accessory_categories: undefined
    }));

    return mappedData;
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
