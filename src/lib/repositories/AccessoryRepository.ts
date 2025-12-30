import { BaseRepository } from './BaseRepository';
import { Accessory, AccessoryFilters } from '@/entities/product';

export class AccessoryRepository extends BaseRepository<Accessory> {
  protected tableName = 'accessories';

  /**
   * Mapuj dane z Supabase (snake_case) na typ Accessory (camelCase)
   */
  private mapAccessoryFromDb(item: any): Accessory {
    // Usuń pola snake_case z obiektu, żeby nie było duplikatów
    const {
      image_src,
      available_colors,
      color_images,
      in_stock,
      stock_quantity,
      is_active,
      category_id,
      created_at,
      updated_at,
      product_type,
      accessory_categories,
      ...rest
    } = item;

    return {
      ...rest,
      // Mapuj pola snake_case na camelCase
      imageSrc: image_src,
      images: item.images || [],
      availableColors: available_colors || [],
      colorImages: color_images || {},
      inStock: in_stock !== null && in_stock !== undefined ? in_stock : true, // Domyślnie true jeśli null/undefined
      stockQuantity: stock_quantity !== null && stock_quantity !== undefined ? stock_quantity : null,
      isActive: is_active !== null && is_active !== undefined ? is_active : true,
      categoryId: category_id,
      productType: product_type 
        ? (product_type.toString().toLowerCase().trim() === 'organizer' || product_type.toString().toLowerCase().trim() === 'podpietka')
          ? product_type.toString().toLowerCase().trim()
          : undefined
        : undefined,
      // Usuń product_type z rest jeśli istnieje, żeby nie było duplikatu
      product_type: undefined,
      createdAt: created_at ? new Date(created_at) : new Date(),
      updatedAt: updated_at ? new Date(updated_at) : new Date(),
      // Mapuj kategorię jeśli istnieje
      category: accessory_categories ? {
        id: accessory_categories.id,
        name: accessory_categories.name,
        slug: accessory_categories.slug,
        description: accessory_categories.description,
        icon: accessory_categories.icon,
        isActive: accessory_categories.is_active,
        sortOrder: accessory_categories.sort_order,
        parentId: accessory_categories.parent_id,
        createdAt: new Date(accessory_categories.created_at),
        updatedAt: new Date(accessory_categories.updated_at)
      } : undefined,
    } as Accessory;
  }

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

    return (data || []).map(item => this.mapAccessoryFromDb(item));
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

    return this.mapAccessoryFromDb(data);
  }

  async findMany(filters?: AccessoryFilters): Promise<Accessory[]> {
    let query = this.supabase
      .from(this.tableName)
      .select(`
        *,
        accessory_categories(*)
      `)
      .eq('is_active', true); // Tylko aktywne produkty

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

    return (data || []).map(item => this.mapAccessoryFromDb(item));
  }

  async findBySku(sku: string): Promise<Accessory | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        accessory_categories(*)
      `)
      .eq('sku', sku)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Error finding accessory by SKU: ${error.message}`);
    }

    return this.mapAccessoryFromDb(data);
  }

  /**
   * Nadpisz findById aby używał mapowania
   */
  async findById(id: string): Promise<Accessory | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        accessory_categories(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Error finding accessory by id: ${error.message}`);
    }

    return this.mapAccessoryFromDb(data);
  }

  async decrementStock(id: string, quantity: number): Promise<void> {
    // First get current stock
    const accessory = await this.findById(id);
    if (!accessory) {
      throw new Error('Accessory not found');
    }

    // Jeśli produkt ma nieograniczoną ilość (null), nie zmniejszamy stanu magazynowego
    if (accessory.stockQuantity === null) {
      console.log(`ℹ️ Skipping stock decrement for accessory ${id} - stock quantity is unlimited`);
      return;
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
