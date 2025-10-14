import { AccessoryRepository } from '../repositories/AccessoryRepository';
import { AccessoryCategoryRepository } from '../repositories/AccessoryCategoryRepository';
import { Accessory, AccessoryCategory, AccessoryFilters, CreateAccessoryDTO, UpdateAccessoryDTO } from '../types/accessory';

export class AccessoryService {
  private repository: AccessoryRepository;
  private categoryRepository: AccessoryCategoryRepository;

  constructor() {
    this.repository = new AccessoryRepository();
    this.categoryRepository = new AccessoryCategoryRepository();
  }

  /**
   * Pobierz wszystkie akcesoria z filtrami
   */
  async getAccessories(filters?: AccessoryFilters): Promise<Accessory[]> {
    return await this.repository.findMany(filters);
  }

  /**
   * Pobierz akcesoria według kategorii
   */
  async getAccessoriesByCategory(categorySlug: string): Promise<Accessory[]> {
    return await this.repository.findByCategory(categorySlug);
  }

  /**
   * Pobierz pojedyncze akcesorium
   */
  async getAccessoryById(id: string): Promise<Accessory | null> {
    return await this.repository.findById(id);
  }

  /**
   * Pobierz akcesorium po slug (SEO URL)
   */
  async getAccessoryBySlug(slug: string): Promise<Accessory | null> {
    return await this.repository.findBySlug(slug);
  }

  /**
   * Pobierz akcesorium po SKU
   */
  async getAccessoryBySku(sku: string): Promise<Accessory | null> {
    return await this.repository.findBySku(sku);
  }

  /**
   * Utwórz nowe akcesorium (ADMIN)
   */
  async createAccessory(data: CreateAccessoryDTO): Promise<Accessory> {
    // Walidacja danych
    this.validateAccessoryData(data);
    
    // Generuj SKU jeśli nie podano
    const sku = data.sku || this.generateSKU(data);
    
    // Generuj slug jeśli nie podano
    const slug = data.slug || this.generateSlug(data.name);
    
    // Zapisz w bazie
    return await this.repository.create({
      ...data,
      sku,
      slug,
      reviewCount: 0
    });
  }

  /**
   * Zaktualizuj akcesorium (ADMIN)
   */
  async updateAccessory(id: string, data: Partial<UpdateAccessoryDTO>): Promise<Accessory> {
    this.validateAccessoryData(data, true);
    
    // Generuj slug jeśli zmieniono nazwę
    if (data.name && !data.slug) {
      data.slug = this.generateSlug(data.name);
    }
    
    return await this.repository.update(id, data);
  }

  /**
   * Usuń akcesorium (ADMIN)
   */
  async deleteAccessory(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  /**
   * Sprawdź dostępność
   */
  async checkAvailability(id: string, quantity: number): Promise<boolean> {
    const accessory = await this.repository.findById(id);
    
    console.log('🔍 checkAvailability:', { id, quantity, accessory: accessory ? {
      name: accessory.name,
      isActive: accessory.isActive,
      inStock: accessory.inStock,
      stockQuantity: accessory.stockQuantity
    } : null });
    
    if (!accessory) {
      console.log('❌ Accessory not found');
      return false;
    }
    
    if (!accessory.isActive) {
      console.log('❌ Accessory not active');
      return false;
    }
    
    // Dla akcesoriów, jeśli inStock nie jest ustawione, domyślnie zwracaj true
    if (accessory.inStock === false) {
      console.log('❌ Accessory not in stock');
      return false;
    }
    
    // Sprawdź stockQuantity tylko jeśli jest ustawione
    if (accessory.stockQuantity !== null && accessory.stockQuantity! < quantity) {
      console.log('❌ Insufficient stock quantity');
      return false;
    }
    
    console.log('✅ Accessory available');
    return true;
  }

  /**
   * Zmniejsz stan magazynowy
   */
  async decrementStock(id: string, quantity: number): Promise<void> {
    await this.repository.decrementStock(id, quantity);
  }

  /**
   * Pobierz akcesoria z niskim stanem magazynowym
   */
  async getLowStockAccessories(threshold: number = 10): Promise<Accessory[]> {
    const accessories = await this.repository.findMany({
      inStock: true
    });

    return accessories.filter(accessory => 
      accessory.stockQuantity !== null && 
      accessory.stockQuantity! <= threshold
    );
  }

  /**
   * Pobierz najpopularniejsze akcesoria
   */
  async getPopularAccessories(limit: number = 10): Promise<Accessory[]> {
    return await this.repository.findMany({
      orderBy: 'rating',
      orderDirection: 'desc'
    });
  }

  /**
   * Pobierz najnowsze akcesoria
   */
  async getNewestAccessories(limit: number = 10): Promise<Accessory[]> {
    return await this.repository.findMany({
      orderBy: 'createdAt',
      orderDirection: 'desc'
    });
  }

  /**
   * Pobierz wszystkie kategorie akcesoriów
   */
  async getAllCategories(): Promise<AccessoryCategory[]> {
    return await this.categoryRepository.findActive();
  }

  /**
   * Generuj SKU
   */
  private generateSKU(data: CreateAccessoryDTO): string {
    const categoryPrefix = data.categoryId === 1 ? 'ORG' : 'POD';
    const timestamp = Date.now().toString().slice(-6);
    return `${categoryPrefix}-${timestamp}`;
  }

  /**
   * Generuj slug
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Waliduj dane akcesorium
   */
  private validateAccessoryData(data: Partial<CreateAccessoryDTO>, isUpdate: boolean = false): void {
    if (!isUpdate) {
      if (!data.name) {
        throw new Error('Nazwa akcesorium jest wymagana');
      }
      if (!data.price || data.price <= 0) {
        throw new Error('Cena musi być większa od 0');
      }
      if (!data.categoryId) {
        throw new Error('Kategoria jest wymagana');
      }
    }

    if (data.price !== undefined && data.price <= 0) {
      throw new Error('Cena musi być większa od 0');
    }

    if (data.stockQuantity !== undefined && data.stockQuantity < 0) {
      throw new Error('Stan magazynowy nie może być ujemny');
    }

    if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
      throw new Error('Ocena musi być między 1 a 5');
    }
  }
}
