import { prisma } from '../database/prisma';
import { Mats, CreateMatsRequest, UpdateMatsRequest, MatsFilter } from '../types/mats';

export class MatsService {
  // Pobierz wszystkie dywaniki
  static async getAllMats(): Promise<Mats[]> {
    try {
      const mats = await prisma.mats.findMany();
      return mats;
    } catch (error) {
      console.error('Error fetching mats:', error);
      throw new Error('Failed to fetch mats');
    }
  }

  // Pobierz dywanik po ID
  static async getMatsById(id: number): Promise<Mats | null> {
    try {
      const mats = await prisma.mats.findUnique({
        where: { id },
      });
      return mats;
    } catch (error) {
      console.error('Error fetching mats by ID:', error);
      throw new Error('Failed to fetch mats by ID');
    }
  }

  // Pobierz dywaniki po filtrze
  static async getMatsByFilter(filter: MatsFilter): Promise<Mats[]> {
    try {
      const whereClause: any = {};
      
      if (filter.type) whereClause.type = filter.type;
      if (filter.color) whereClause.color = filter.color;
      if (filter.cellType) whereClause.cellType = filter.cellType;
      if (filter.edgeColor) whereClause.edgeColor = filter.edgeColor;

      const mats = await prisma.mats.findMany({
        where: whereClause,
      });
      return mats;
    } catch (error) {
      console.error('Error fetching mats by filter:', error);
      throw new Error('Failed to fetch mats by filter');
    }
  }

  // Pobierz dywaniki po typie
  static async getMatsByType(type: string): Promise<Mats[]> {
    try {
      const mats = await prisma.mats.findMany({
        where: { type },
      });
      return mats;
    } catch (error) {
      console.error('Error fetching mats by type:', error);
      throw new Error('Failed to fetch mats by type');
    }
  }

  // Pobierz dywaniki po kolorze
  static async getMatsByColor(color: string): Promise<Mats[]> {
    try {
      const mats = await prisma.mats.findMany({
        where: { color },
      });
      return mats;
    } catch (error) {
      console.error('Error fetching mats by color:', error);
      throw new Error('Failed to fetch mats by color');
    }
  }

  // Pobierz unikalne kolory
  static async getUniqueColors(): Promise<string[]> {
    try {
      const colors = await prisma.mats.findMany({
        select: { color: true },
        distinct: ['color'],
      });
      return colors.map(c => c.color);
    } catch (error) {
      console.error('Error fetching unique colors:', error);
      throw new Error('Failed to fetch unique colors');
    }
  }

  // Pobierz unikalne typy
  static async getUniqueTypes(): Promise<string[]> {
    try {
      const types = await prisma.mats.findMany({
        select: { type: true },
        distinct: ['type'],
      });
      return types.map(t => t.type);
    } catch (error) {
      console.error('Error fetching unique types:', error);
      throw new Error('Failed to fetch unique types');
    }
  }

  // Pobierz unikalne typy komórek
  static async getUniqueCellTypes(): Promise<string[]> {
    try {
      const cellTypes = await prisma.mats.findMany({
        select: { cellType: true },
        distinct: ['cellType'],
      });
      return cellTypes.map(ct => ct.cellType);
    } catch (error) {
      console.error('Error fetching unique cell types:', error);
      throw new Error('Failed to fetch unique cell types');
    }
  }

  // Utwórz nowy dywanik
  static async createMats(data: CreateMatsRequest): Promise<Mats> {
    try {
      const mats = await prisma.mats.create({
        data,
      });
      return mats;
    } catch (error) {
      console.error('Error creating mats:', error);
      throw new Error('Failed to create mats');
    }
  }

  // Zaktualizuj dywanik
  static async updateMats(data: UpdateMatsRequest): Promise<Mats> {
    try {
      const { id, ...updateData } = data;
      const mats = await prisma.mats.update({
        where: { id },
        data: updateData,
      });
      return mats;
    } catch (error) {
      console.error('Error updating mats:', error);
      throw new Error('Failed to update mats');
    }
  }

  // Usuń dywanik
  static async deleteMats(id: number): Promise<boolean> {
    try {
      await prisma.mats.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error('Error deleting mats:', error);
      throw new Error('Failed to delete mats');
    }
  }

  // Sprawdź liczbę dywaników
  static async getMatsCount(): Promise<number> {
    try {
      const count = await prisma.mats.count();
      return count;
    } catch (error) {
      console.error('Error counting mats:', error);
      throw new Error('Failed to count mats');
    }
  }

  // Pobierz dywaniki z paginacją
  static async getMatsWithPagination(page: number = 1, limit: number = 10): Promise<{ mats: Mats[], total: number, page: number, totalPages: number }> {
    try {
      const skip = (page - 1) * limit;
      
      const [mats, total] = await Promise.all([
        prisma.mats.findMany({
          skip,
          take: limit,
        }),
        prisma.mats.count(),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        mats,
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