import { supabaseAdmin, TABLES } from '../database/supabase';
import { Mats, CreateMatsRequest, UpdateMatsRequest, MatsFilter } from '../types/mats';

export class SupabaseMatsService {
  // Helper function to map CarMat data to Mats format
  private static mapCarMatToMats(carMatData: any): Mats {
    return {
      id: parseInt(carMatData.id.split('-')[0], 16) || 0, // Convert UUID to int for compatibility
      type: carMatData.matType,
      color: carMatData.materialColor,
      cellType: carMatData.cellStructure,
      edgeColor: carMatData.borderColor,
      image: carMatData.imagePath
    };
  }

  // Helper function to map Mats data to CarMat format
  private static mapMatsToCarMat(matsData: any): any {
    return {
      matType: matsData.type,
      materialColor: matsData.color,
      cellStructure: matsData.cellType,
      borderColor: matsData.edgeColor,
      imagePath: matsData.image
    };
  }

  // Pobierz wszystkie dywaniki
  static async getAllMats(): Promise<Mats[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from(TABLES.MATS)
        .select('*')
        .order('createdAt', { ascending: true });

      if (error) throw error;
      return (data || []).map(item => this.mapCarMatToMats(item));
    } catch (error) {
      console.error('Error fetching mats:', error);
      throw new Error('Failed to fetch mats');
    }
  }

  // Pobierz dywanik po ID
  static async getMatsById(id: number): Promise<Mats | null> {
    try {
      // Since we're using UUIDs, we need to search differently
      // For now, let's get all and filter by converted ID
      const { data, error } = await supabaseAdmin
        .from(TABLES.MATS)
        .select('*')
        .limit(1000); // Get a reasonable number of records

      if (error) throw error;
      
      const foundItem = (data || []).find(item => 
        parseInt(item.id.split('-')[0], 16) === id
      );
      
      return foundItem ? this.mapCarMatToMats(foundItem) : null;
    } catch (error) {
      console.error('Error fetching mats by ID:', error);
      throw new Error('Failed to fetch mats by ID');
    }
  }

  // Pobierz dywaniki po filtrze
  static async getMatsByFilter(filter: MatsFilter): Promise<Mats[]> {
    try {
      let query = supabaseAdmin.from(TABLES.MATS).select('*');
      
      if (filter.type) query = query.eq('matType', filter.type);
      if (filter.color) query = query.eq('materialColor', filter.color);
      if (filter.cellType) query = query.eq('cellStructure', filter.cellType);
      if (filter.edgeColor) query = query.eq('borderColor', filter.edgeColor);

      const { data, error } = await query.order('createdAt', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(item => this.mapCarMatToMats(item));
    } catch (error) {
      console.error('Error fetching mats by filter:', error);
      throw new Error('Failed to fetch mats by filter');
    }
  }

  // Pobierz dywaniki po typie
  static async getMatsByType(type: string): Promise<Mats[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from(TABLES.MATS)
        .select('*')
        .eq('matType', type)
        .order('createdAt', { ascending: true });

      if (error) throw error;
      return (data || []).map(item => this.mapCarMatToMats(item));
    } catch (error) {
      console.error('Error fetching mats by type:', error);
      throw new Error('Failed to fetch mats by type');
    }
  }

  // Pobierz dywaniki po kolorze
  static async getMatsByColor(color: string): Promise<Mats[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from(TABLES.MATS)
        .select('*')
        .eq('materialColor', color)
        .order('createdAt', { ascending: true });

      if (error) throw error;
      return (data || []).map(item => this.mapCarMatToMats(item));
    } catch (error) {
      console.error('Error fetching mats by color:', error);
      throw new Error('Failed to fetch mats by color');
    }
  }

  // Pobierz unikalne kolory
  static async getUniqueColors(): Promise<string[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from(TABLES.MATS)
        .select('materialColor')
        .order('materialColor', { ascending: true });

      if (error) throw error;
      
      const uniqueColors = [...new Set(data?.map(item => item.materialColor) || [])];
      return uniqueColors;
    } catch (error) {
      console.error('Error fetching unique colors:', error);
      throw new Error('Failed to fetch unique colors');
    }
  }

  // Pobierz unikalne typy
  static async getUniqueTypes(): Promise<string[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from(TABLES.MATS)
        .select('matType')
        .order('matType', { ascending: true });

      if (error) throw error;
      
      const uniqueTypes = [...new Set(data?.map(item => item.matType) || [])];
      return uniqueTypes;
    } catch (error) {
      console.error('Error fetching unique types:', error);
      throw new Error('Failed to fetch unique types');
    }
  }

  // Pobierz unikalne typy komórek
  static async getUniqueCellTypes(): Promise<string[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from(TABLES.MATS)
        .select('cellStructure')
        .order('cellStructure', { ascending: true });

      if (error) throw error;
      
      const uniqueCellTypes = [...new Set(data?.map(item => item.cellStructure) || [])];
      return uniqueCellTypes;
    } catch (error) {
      console.error('Error fetching unique cell types:', error);
      throw new Error('Failed to fetch unique cell types');
    }
  }

  // Utwórz nowy dywanik
  static async createMats(data: CreateMatsRequest): Promise<Mats> {
    try {
      const carMatData = this.mapMatsToCarMat(data);
      const { data: result, error } = await supabaseAdmin
        .from(TABLES.MATS)
        .insert([carMatData])
        .select()
        .single();

      if (error) throw error;
      return this.mapCarMatToMats(result);
    } catch (error) {
      console.error('Error creating mats:', error);
      throw new Error('Failed to create mats');
    }
  }

  // Zaktualizuj dywanik
  static async updateMats(data: UpdateMatsRequest): Promise<Mats> {
    try {
      const { id, ...updateData } = data;
      const carMatData = this.mapMatsToCarMat(updateData);
      
      // Find the record by converted ID
      const { data: allData, error: fetchError } = await supabaseAdmin
        .from(TABLES.MATS)
        .select('*')
        .limit(1000);

      if (fetchError) throw fetchError;
      
      const foundItem = (allData || []).find(item => 
        parseInt(item.id.split('-')[0], 16) === id
      );
      
      if (!foundItem) {
        throw new Error('Mats not found');
      }

      const { data: result, error } = await supabaseAdmin
        .from(TABLES.MATS)
        .update(carMatData)
        .eq('id', foundItem.id)
        .select()
        .single();

      if (error) throw error;
      return this.mapCarMatToMats(result);
    } catch (error) {
      console.error('Error updating mats:', error);
      throw new Error('Failed to update mats');
    }
  }

  // Usuń dywanik
  static async deleteMats(id: number): Promise<boolean> {
    try {
      // Find the record by converted ID
      const { data: allData, error: fetchError } = await supabaseAdmin
        .from(TABLES.MATS)
        .select('*')
        .limit(1000);

      if (fetchError) throw fetchError;
      
      const foundItem = (allData || []).find(item => 
        parseInt(item.id.split('-')[0], 16) === id
      );
      
      if (!foundItem) {
        throw new Error('Mats not found');
      }

      const { error } = await supabaseAdmin
        .from(TABLES.MATS)
        .delete()
        .eq('id', foundItem.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting mats:', error);
      throw new Error('Failed to delete mats');
    }
  }

  // Sprawdź liczbę dywaników
  static async getMatsCount(): Promise<number> {
    try {
      const { count, error } = await supabaseAdmin
        .from(TABLES.MATS)
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error counting mats:', error);
      throw new Error('Failed to count mats');
    }
  }

  // Pobierz dywaniki z paginacją
  static async getMatsWithPagination(page: number = 1, limit: number = 10): Promise<{ mats: Mats[], total: number, page: number, totalPages: number }> {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const [matsResult, countResult] = await Promise.all([
        supabaseAdmin
          .from(TABLES.MATS)
          .select('*')
          .range(from, to)
          .order('createdAt', { ascending: true }),
        supabaseAdmin
          .from(TABLES.MATS)
          .select('*', { count: 'exact', head: true })
      ]);

      if (matsResult.error) throw matsResult.error;
      if (countResult.error) throw countResult.error;

      const total = countResult.count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        mats: (matsResult.data || []).map(item => this.mapCarMatToMats(item)),
        total,
        page,
        totalPages,
      };
    } catch (error) {
      console.error('Error fetching mats with pagination:', error);
      throw new Error('Failed to fetch mats with pagination');
    }
  }
}