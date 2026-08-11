import { MatRepository } from '../repositories/MatRepository';
import { PricingService } from './PricingService';
import { Mat, MatConfiguration, MatFilters, CreateMatDTO, UpdateMatDTO } from '@/entities/product';

export class MatService {
  private repository: MatRepository;
  private pricingService: PricingService;

  constructor() {
    this.repository = new MatRepository();
    this.pricingService = new PricingService();
  }

  /**
   * Znajdź dywaniki dla konkretnego auta
   */
  async findMatForCar(params: {
    brandSlug: string;
    modelSlug: string;
    generation?: string;
    bodyType?: string;
  }): Promise<Mat | null> {
    return await this.repository.findByCarDetails(params);
  }

  /**
   * Pobierz wszystkie dostępne dywaniki
   */
  async getAvailableMats(filters?: MatFilters): Promise<Mat[]> {
    return await this.repository.findMany({
      ...filters,
      isActive: true
    });
  }

  /**
   * Pobierz dywaniki według marki i modelu
   */
  async getMatsByBrandAndModel(brandSlug: string, modelSlug: string): Promise<Mat[]> {
    return await this.repository.findByBrandAndModel(brandSlug, modelSlug);
  }

  /**
   * Pobierz dostępne typy nadwozia dla marki i modelu
   */
  async getAvailableBodyTypes(brandSlug: string, modelSlug: string): Promise<string[]> {
    return await this.repository.findAvailableBodyTypes(brandSlug, modelSlug);
  }

  /**
   * Pobierz dostępne generacje dla marki i modelu
   */
  async getAvailableGenerations(brandSlug: string, modelSlug: string): Promise<string[]> {
    return await this.repository.findAvailableGenerations(brandSlug, modelSlug);
  }

  /**
   * Waliduj konfigurację dywaników
   */
  validateConfiguration(mat: Mat, configuration: MatConfiguration): boolean {
    // Sprawdź czy setType jest dostępny
    if (!mat.availableSetTypes.includes(configuration.setType)) {
      throw new Error(`Set type ${configuration.setType} not available for this car`);
    }
    
    // Sprawdź czy cellType jest dostępny
    if (!mat.availableCellTypes.includes(configuration.cellType)) {
      throw new Error(`Cell type ${configuration.cellType} not available`);
    }
    
    // Sprawdź czy kolor materiału jest dostępny
    if (!mat.availableColors.includes(configuration.materialColor)) {
      throw new Error(`Material color ${configuration.materialColor} not available`);
    }
    
    // Sprawdź czy kolor obszycia jest dostępny
    if (!mat.availableEdgeColors.includes(configuration.edgeColor)) {
      throw new Error(`Edge color ${configuration.edgeColor} not available`);
    }
    
    // Sprawdź heelPad
    if (configuration.heelPad === 'yes' && !mat.hasHeelPad) {
      throw new Error('Heel pad not available for this car');
    }
    
    return true;
  }

  /**
   * Oblicz cenę dywaników z konfiguracją
   */
  calculatePrice(mat: Mat, configuration: MatConfiguration): number {
    return PricingService.calculateMatPrice(mat.basePrice, configuration);
  }

  /**
   * Utwórz nowe dywaniki (ADMIN)
   */
  async createMat(data: CreateMatDTO): Promise<Mat> {
    this.validateMatData(data);
    
    return await this.repository.create(data);
  }

  /**
   * Zaktualizuj dywaniki (ADMIN)
   */
  async updateMat(id: string, data: Partial<UpdateMatDTO>): Promise<Mat> {
    this.validateMatData(data, true);
    
    return await this.repository.update(id, data);
  }

  /**
   * Usuń dywaniki (ADMIN)
   */
  async deleteMat(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  /**
   * Pobierz dywaniki według marki
   */
  async getMatsByBrand(brandSlug: string): Promise<Mat[]> {
    return await this.repository.findMany({
      carBrandSlug: brandSlug,
      isActive: true
    });
  }

  /**
   * Pobierz wszystkie dostępne marki
   */
  async getAvailableBrands(): Promise<string[]> {
    const mats = await this.repository.findMany({ isActive: true })
    const brands = mats.map(mat => mat.carBrandSlug)
    return [...new Set(brands)].sort()
  }

  /**
   * Pobierz modele dla danej marki
   */
  async getModelsForBrand(brandSlug: string): Promise<string[]> {
    const mats = await this.repository.findMany({
      carBrandSlug: brandSlug,
      isActive: true
    });
    const models = mats.map(mat => mat.carModelSlug);
    return [...new Set(models)].sort();
  }

  /**
   * Sprawdź czy dywaniki są dostępne dla danego auta
   */
  async isMatAvailable(params: {
    brandSlug: string;
    modelSlug: string;
    generation?: string;
    bodyType?: string;
  }): Promise<boolean> {
    const mat = await this.findMatForCar(params);
    return mat !== null && mat.isActive;
  }

  /**
   * Waliduj dane dywaników
   */
  private validateMatData(data: Partial<CreateMatDTO>, isUpdate: boolean = false): void {
    if (!isUpdate) {
      if (!data.carBrandSlug) {
        throw new Error('Marka samochodu jest wymagana');
      }
      if (!data.carModelSlug) {
        throw new Error('Model samochodu jest wymagany');
      }
      if (!data.basePrice || data.basePrice <= 0) {
        throw new Error('Cena bazowa musi być większa od 0');
      }
      if (!data.availableSetTypes || data.availableSetTypes.length === 0) {
        throw new Error('Dostępne typy zestawów są wymagane');
      }
      if (!data.availableCellTypes || data.availableCellTypes.length === 0) {
        throw new Error('Dostępne typy komórek są wymagane');
      }
      if (!data.availableColors || data.availableColors.length === 0) {
        throw new Error('Dostępne kolory są wymagane');
      }
      if (!data.availableEdgeColors || data.availableEdgeColors.length === 0) {
        throw new Error('Dostępne kolory obszycia są wymagane');
      }
    }

    if (data.basePrice !== undefined && data.basePrice <= 0) {
      throw new Error('Cena bazowa musi być większa od 0');
    }

    if (data.yearFrom !== undefined && data.yearTo !== undefined && data.yearFrom > data.yearTo) {
      throw new Error('Rok początkowy nie może być większy od końcowego');
    }
  }
}
