import { prisma } from '../database/prisma';

export interface CreateCarModelData {
  name: string;
  displayName?: string;
  yearFrom?: number;
  yearTo?: number;
  generation?: string;
  bodyType?: string;
  engineType?: string;
  carBrandId: number;
}

export interface UpdateCarModelData extends Partial<CreateCarModelData> {
  id: number;
}

export class CarModelService {
  /**
   * Pobiera wszystkie modele aut z informacjami o marce
   */
  static async getAllCarModels() {
    return await prisma.carModel.findMany({
      include: {
        carBrand: true
      },
      where: {
        isActive: true
      },
      orderBy: [
        { carBrand: { name: 'asc' } },
        { name: 'asc' }
      ]
    });
  }

  /**
   * Pobiera modele aut dla konkretnej marki
   */
  static async getCarModelsByBrand(brandId: number) {
    return await prisma.carModel.findMany({
      where: {
        carBrandId: brandId,
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    });
  }

  /**
   * Pobiera model auta po ID
   */
  static async getCarModelById(id: number) {
    return await prisma.carModel.findUnique({
      where: { id },
      include: {
        carBrand: true
      }
    });
  }

  /**
   * Tworzy nowy model auta
   */
  static async createCarModel(data: CreateCarModelData) {
    return await prisma.carModel.create({
      data,
      include: {
        carBrand: true
      }
    });
  }

  /**
   * Aktualizuje model auta
   */
  static async updateCarModel(data: UpdateCarModelData) {
    const { id, ...updateData } = data;
    return await prisma.carModel.update({
      where: { id },
      data: updateData,
      include: {
        carBrand: true
      }
    });
  }

  /**
   * Usuwa model auta (soft delete)
   */
  static async deleteCarModel(id: number) {
    return await prisma.carModel.update({
      where: { id },
      data: { isActive: false }
    });
  }

  /**
   * Pobiera modele aut z filtrowaniem
   */
  static async getCarModelsWithFilters(filters: {
    brandId?: number;
    bodyType?: string;
    engineType?: string;
    yearFrom?: number;
    yearTo?: number;
  }) {
    const where: any = { isActive: true };

    if (filters.brandId) {
      where.carBrandId = filters.brandId;
    }

    if (filters.bodyType) {
      where.bodyType = filters.bodyType;
    }

    if (filters.engineType) {
      where.engineType = filters.engineType;
    }

    if (filters.yearFrom) {
      where.yearFrom = { gte: filters.yearFrom };
    }

    if (filters.yearTo) {
      where.yearTo = { lte: filters.yearTo };
    }

    return await prisma.carModel.findMany({
      where,
      include: {
        carBrand: true
      },
      orderBy: [
        { carBrand: { name: 'asc' } },
        { name: 'asc' }
      ]
    });
  }

  /**
   * Pobiera unikalne typy nadwozi
   */
  static async getBodyTypes() {
    const bodyTypes = await prisma.carModel.findMany({
      where: { isActive: true },
      select: { bodyType: true },
      distinct: ['bodyType']
    });

    return bodyTypes
      .map(item => item.bodyType)
      .filter(Boolean) as string[];
  }

  /**
   * Pobiera unikalne typy silników
   */
  static async getEngineTypes() {
    const engineTypes = await prisma.carModel.findMany({
      where: { isActive: true },
      select: { engineType: true },
      distinct: ['engineType']
    });

    return engineTypes
      .map(item => item.engineType)
      .filter(Boolean) as string[];
  }
} 