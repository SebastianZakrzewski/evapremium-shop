import { createClient } from '@supabase/supabase-js';
import { 
  mapCarMatArrayToMats, 
  mapMatsToCarMat, 
  validateMatsModel, 
  validateCarMatRecord,
  convertNumberToUuid,
  convertIdToNumber,
  findUuidById,
  type MatsModel,
  type CarMatRecord
} from '@/lib/mapping/carmat-mapping';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export interface CarMatFilters {
  type?: string;
  color?: string;
  cellType?: string;
  edgeColor?: string;
  limit?: number;
  offset?: number;
}

export interface CarMatServiceResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  error?: string;
}

export class CarMatService {
  /**
   * Pobiera wszystkie rekordy z tabeli CarMat
   */
  static async getAllMats(filters: CarMatFilters = {}): Promise<CarMatServiceResponse<MatsModel[]>> {
    try {
      let query = supabase.from('CarMat').select('*', { count: 'exact' });

      // Zastosuj filtry
      if (filters.type) {
        query = query.eq('matType', filters.type);
      }
      if (filters.color) {
        query = query.eq('materialColor', filters.color);
      }
      if (filters.cellType) {
        query = query.eq('cellStructure', filters.cellType);
      }
      if (filters.edgeColor) {
        query = query.eq('borderColor', filters.edgeColor);
      }

      // Zastosuj paginację
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        return {
          success: false,
          data: [],
          error: error.message
        };
      }

      const mappedData = mapCarMatArrayToMats(data || []);
      
      return {
        success: true,
        data: mappedData,
        count: count || 0
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Pobiera rekord po ID
   */
  static async getMatById(id: number): Promise<CarMatServiceResponse<MatsModel | null>> {
    try {
      // Znajdź rzeczywisty UUID na podstawie ID
      const uuid = await findUuidById(id, supabase);
      
      if (!uuid) {
        return {
          success: true,
          data: null,
          error: 'Record not found'
        };
      }
      
      const { data, error } = await supabase
        .from('CarMat')
        .select('*')
        .eq('id', uuid)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: true,
            data: null,
            error: 'Record not found'
          };
        }
        return {
          success: false,
          data: null,
          error: error.message
        };
      }

      const mappedData = mapCarMatArrayToMats([data])[0];
      
      return {
        success: true,
        data: mappedData
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Pobiera rekordy 3D (z ramkami)
   */
  static async get3DMats(filters: Omit<CarMatFilters, 'type'> = {}): Promise<CarMatServiceResponse<MatsModel[]>> {
    return this.getAllMats({
      ...filters,
      type: '3d-with-rims'
    });
  }

  /**
   * Pobiera rekordy klasyczne (bez ramek)
   */
  static async getClassicMats(filters: Omit<CarMatFilters, 'type'> = {}): Promise<CarMatServiceResponse<MatsModel[]>> {
    return this.getAllMats({
      ...filters,
      type: '3d-without-rims'
    });
  }

  /**
   * Pobiera rekordy z określoną strukturą komórek
   */
  static async getMatsByCellType(cellType: string, filters: Omit<CarMatFilters, 'cellType'> = {}): Promise<CarMatServiceResponse<MatsModel[]>> {
    return this.getAllMats({
      ...filters,
      cellType
    });
  }

  /**
   * Pobiera rekordy z określonym kolorem materiału
   */
  static async getMatsByColor(color: string, filters: Omit<CarMatFilters, 'color'> = {}): Promise<CarMatServiceResponse<MatsModel[]>> {
    return this.getAllMats({
      ...filters,
      color
    });
  }

  /**
   * Pobiera rekordy z określonym kolorem obszycia
   */
  static async getMatsByEdgeColor(edgeColor: string, filters: Omit<CarMatFilters, 'edgeColor'> = {}): Promise<CarMatServiceResponse<MatsModel[]>> {
    return this.getAllMats({
      ...filters,
      edgeColor
    });
  }

  /**
   * Pobiera unikalne wartości dla określonego pola
   */
  static async getUniqueValues(field: keyof CarMatRecord): Promise<CarMatServiceResponse<string[]>> {
    try {
      const { data, error } = await supabase
        .from('CarMat')
        .select(field);

      if (error) {
        return {
          success: false,
          data: [],
          error: error.message
        };
      }

      const uniqueValues = [...new Set(data?.map(item => item[field]).filter(Boolean) || [])];
      
      return {
        success: true,
        data: uniqueValues
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Pobiera unikalne kolory materiału
   */
  static async getUniqueColors(): Promise<CarMatServiceResponse<string[]>> {
    return this.getUniqueValues('materialColor');
  }

  /**
   * Pobiera unikalne kolory obszycia
   */
  static async getUniqueEdgeColors(): Promise<CarMatServiceResponse<string[]>> {
    return this.getUniqueValues('borderColor');
  }

  /**
   * Pobiera unikalne typy mat
   */
  static async getUniqueTypes(): Promise<CarMatServiceResponse<string[]>> {
    return this.getUniqueValues('matType');
  }

  /**
   * Pobiera unikalne struktury komórek
   */
  static async getUniqueCellTypes(): Promise<CarMatServiceResponse<string[]>> {
    return this.getUniqueValues('cellStructure');
  }

  /**
   * Tworzy nowy rekord w tabeli CarMat
   */
  static async createMat(matData: MatsModel): Promise<CarMatServiceResponse<MatsModel>> {
    try {
      if (!validateMatsModel(matData)) {
        return {
          success: false,
          data: matData,
          error: 'Invalid mat data'
        };
      }

      const carMatData = mapMatsToCarMat(matData);
      
      if (!validateCarMatRecord(carMatData)) {
        return {
          success: false,
          data: matData,
          error: 'Invalid CarMat data'
        };
      }

      const { data, error } = await supabase
        .from('CarMat')
        .insert(carMatData)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          data: matData,
          error: error.message
        };
      }

      const mappedData = mapCarMatArrayToMats([data])[0];
      
      return {
        success: true,
        data: mappedData
      };
    } catch (error) {
      return {
        success: false,
        data: matData,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Aktualizuje rekord w tabeli CarMat
   */
  static async updateMat(id: number, matData: Partial<MatsModel>): Promise<CarMatServiceResponse<MatsModel | null>> {
    try {
      // Znajdź rzeczywisty UUID na podstawie ID
      const uuid = await findUuidById(id, supabase);
      
      if (!uuid) {
        return {
          success: false,
          data: null,
          error: 'Record not found'
        };
      }
      
      // Pobierz istniejący rekord
      const existingRecord = await this.getMatById(id);
      if (!existingRecord.success || !existingRecord.data) {
        return {
          success: false,
          data: null,
          error: 'Record not found'
        };
      }

      // Połącz dane
      const updatedData = { ...existingRecord.data, ...matData };
      
      if (!validateMatsModel(updatedData)) {
        return {
          success: false,
          data: null,
          error: 'Invalid updated mat data'
        };
      }

      const carMatData = mapMatsToCarMat(updatedData);
      
      if (!validateCarMatRecord(carMatData)) {
        return {
          success: false,
          data: null,
          error: 'Invalid CarMat data'
        };
      }

      const { data, error } = await supabase
        .from('CarMat')
        .update(carMatData)
        .eq('id', uuid)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          data: null,
          error: error.message
        };
      }

      const mappedData = mapCarMatArrayToMats([data])[0];
      
      return {
        success: true,
        data: mappedData
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Usuwa rekord z tabeli CarMat
   */
  static async deleteMat(id: number): Promise<CarMatServiceResponse<boolean>> {
    try {
      // Znajdź rzeczywisty UUID na podstawie ID
      const uuid = await findUuidById(id, supabase);
      
      if (!uuid) {
        return {
          success: false,
          data: false,
          error: 'Record not found'
        };
      }
      
      const { error } = await supabase
        .from('CarMat')
        .delete()
        .eq('id', uuid);

      if (error) {
        return {
          success: false,
          data: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        data: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Wyszukuje rekordy na podstawie zapytania tekstowego
   */
  static async searchMats(query: string, filters: CarMatFilters = {}): Promise<CarMatServiceResponse<MatsModel[]>> {
    try {
      let searchQuery = supabase
        .from('CarMat')
        .select('*', { count: 'exact' })
        .or(`matType.ilike.%${query}%,materialColor.ilike.%${query}%,cellStructure.ilike.%${query}%,borderColor.ilike.%${query}%`);

      // Zastosuj dodatkowe filtry
      if (filters.type) {
        searchQuery = searchQuery.eq('matType', filters.type);
      }
      if (filters.color) {
        searchQuery = searchQuery.eq('materialColor', filters.color);
      }
      if (filters.cellType) {
        searchQuery = searchQuery.eq('cellStructure', filters.cellType);
      }
      if (filters.edgeColor) {
        searchQuery = searchQuery.eq('borderColor', filters.edgeColor);
      }

      // Zastosuj paginację
      if (filters.limit) {
        searchQuery = searchQuery.limit(filters.limit);
      }
      if (filters.offset) {
        searchQuery = searchQuery.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error, count } = await searchQuery;

      if (error) {
        return {
          success: false,
          data: [],
          error: error.message
        };
      }

      const mappedData = mapCarMatArrayToMats(data || []);
      
      return {
        success: true,
        data: mappedData,
        count: count || 0
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Pobiera statystyki tabeli CarMat
   */
  static async getStats(): Promise<CarMatServiceResponse<{
    totalCount: number;
    typeCounts: Record<string, number>;
    colorCounts: Record<string, number>;
    cellTypeCounts: Record<string, number>;
    edgeColorCounts: Record<string, number>;
  }>> {
    try {
      const { data, error } = await supabase
        .from('CarMat')
        .select('matType, materialColor, cellStructure, borderColor', { count: 'exact' });

      if (error) {
        return {
          success: false,
          data: {
            totalCount: 0,
            typeCounts: {},
            colorCounts: {},
            cellTypeCounts: {},
            edgeColorCounts: {}
          },
          error: error.message
        };
      }

      const totalCount = data?.length || 0;
      const typeCounts: Record<string, number> = {};
      const colorCounts: Record<string, number> = {};
      const cellTypeCounts: Record<string, number> = {};
      const edgeColorCounts: Record<string, number> = {};

      data?.forEach(record => {
        typeCounts[record.matType] = (typeCounts[record.matType] || 0) + 1;
        colorCounts[record.materialColor] = (colorCounts[record.materialColor] || 0) + 1;
        cellTypeCounts[record.cellStructure] = (cellTypeCounts[record.cellStructure] || 0) + 1;
        edgeColorCounts[record.borderColor] = (edgeColorCounts[record.borderColor] || 0) + 1;
      });

      return {
        success: true,
        data: {
          totalCount,
          typeCounts,
          colorCounts,
          cellTypeCounts,
          edgeColorCounts
        }
      };
    } catch (error) {
      return {
        success: false,
        data: {
          totalCount: 0,
          typeCounts: {},
          colorCounts: {},
          cellTypeCounts: {},
          edgeColorCounts: {}
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export default CarMatService;
