import { supabaseAdmin, TABLES } from '../database/supabase';

export interface AvailableColors {
  materialColors: string[];
  borderColors: string[];
}

export class ColorFilterService {
  // Cache dla dostępnych kolorów
  private static colorCache: { [key: string]: AvailableColors } = {};
  private static cacheExpiry: { [key: string]: number } = {};
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minut

  // Pobierz dostępne kolory dla danej struktury komórek
  static async getAvailableColors(cellStructure: string): Promise<AvailableColors> {
    const cacheKey = cellStructure;
    const now = Date.now();

    // Sprawdź cache
    if (
      this.colorCache[cacheKey] && 
      this.cacheExpiry[cacheKey] && 
      now < this.cacheExpiry[cacheKey]
    ) {
      return this.colorCache[cacheKey];
    }

    try {
      const { data, error } = await supabaseAdmin
        .from(TABLES.MATS)
        .select('materialColor, borderColor')
        .eq('cellStructure', cellStructure);

      if (error) throw error;

      // Wyciągnij unikalne kolory
      const materialColors = [...new Set(data.map(item => item.materialColor))].sort();
      const borderColors = [...new Set(data.map(item => item.borderColor))].sort();

      const result: AvailableColors = {
        materialColors,
        borderColors
      };

      // Zapisz w cache
      this.colorCache[cacheKey] = result;
      this.cacheExpiry[cacheKey] = now + this.CACHE_DURATION;

      return result;
    } catch (error) {
      console.error('Error fetching available colors:', error);
      throw new Error('Failed to fetch available colors');
    }
  }

  // Pobierz wszystkie dostępne kolory dla wszystkich struktur
  static async getAllAvailableColors(): Promise<{ [key: string]: AvailableColors }> {
    try {
      const { data, error } = await supabaseAdmin
        .from(TABLES.MATS)
        .select('cellStructure, materialColor, borderColor');

      if (error) throw error;

      const grouped: { [key: string]: { materialColors: Set<string>, borderColors: Set<string> } } = {};

      data.forEach(item => {
        if (!grouped[item.cellStructure]) {
          grouped[item.cellStructure] = {
            materialColors: new Set(),
            borderColors: new Set()
          };
        }
        grouped[item.cellStructure].materialColors.add(item.materialColor);
        grouped[item.cellStructure].borderColors.add(item.borderColor);
      });

      const result: { [key: string]: AvailableColors } = {};
      Object.keys(grouped).forEach(structure => {
        result[structure] = {
          materialColors: [...grouped[structure].materialColors].sort(),
          borderColors: [...grouped[structure].borderColors].sort()
        };
      });

      return result;
    } catch (error) {
      console.error('Error fetching all available colors:', error);
      throw new Error('Failed to fetch all available colors');
    }
  }

  // Wyczyść cache
  static clearCache(): void {
    this.colorCache = {};
    this.cacheExpiry = {};
  }
}

