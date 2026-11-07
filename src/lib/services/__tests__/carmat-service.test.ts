import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CarMatService } from '../carmat-service';
import { MatsModel } from '@/lib/mapping/carmat-mapping';

const { query } = vi.hoisted(() => {
  let pending: Promise<{ data: unknown; error: unknown; count?: number }> = Promise.resolve({ data: [], error: null, count: 0 });
  const once: Array<{ data: unknown; error: unknown; count?: number }> = [];
  let wantsSingle = false;
  const api: Record<string, unknown> = {};
  const passthrough = () => api;
  for (const name of ['from', 'select', 'eq', 'limit', 'range', 'or', 'insert', 'update', 'delete', 'order', 'is', 'in']) {
    api[name] = () => {
      wantsSingle = false;
      return api;
    };
  }
  api.single = () => {
    wantsSingle = true;
    return api;
  };
  api.mockResolvedValue = (value: { data: unknown; error: unknown; count?: number }) => {
    pending = Promise.resolve(value);
    return api;
  };
  api.mockResolvedValueOnce = (value: { data: unknown; error: unknown; count?: number }) => {
    once.push(value);
    return api;
  };
  api.then = (resolve: (value: unknown) => void, reject?: (reason: unknown) => void) => {
    const next = once.length ? Promise.resolve(once.shift()) : pending;
    const asSingle = wantsSingle;
    wantsSingle = false;
    return next.then((value) => {
      const data = value.data;
      const shaped = asSingle
        ? (Array.isArray(data) ? data[0] ?? null : data)
        : (data == null || Array.isArray(data) ? data : [data]);
      resolve({ ...value, data: shaped });
    }, reject);
  };
  return { query: api };
});

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ from: () => query }),
}));

describe('CarMatService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllMats', () => {
    it('should return all mats successfully', async () => {
      const mockData = [
        {
          id: 'cb465347-82dc-4f40-ae66-5e20628d4617',
          matType: '3d-with-rims',
          cellStructure: 'rhombus',
          materialColor: 'beżowy',
          borderColor: 'beżowy',
          createdAt: '2025-09-03T08:49:35.43',
          updatedAt: '2025-09-03T08:49:35.43',
          imagePath: '/test/image.webp'
        }
      ];

      query.mockResolvedValue({
        data: mockData,
        error: null,
        count: 1
      });

      const result = await CarMatService.getAllMats();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toHaveProperty('id');
      expect(result.data[0]).toHaveProperty('type', '3d-with-rims');
      expect(result.data[0]).toHaveProperty('color', 'beżowy');
      expect(result.data[0]).toHaveProperty('cellType', 'rhombus');
      expect(result.data[0]).toHaveProperty('edgeColor', 'beżowy');
    });

    it('should apply filters correctly', async () => {
      const mockData = [
        {
          id: 'cb465347-82dc-4f40-ae66-5e20628d4617',
          matType: '3d-with-rims',
          cellStructure: 'rhombus',
          materialColor: 'czarny',
          borderColor: 'czarny',
          createdAt: '2025-09-03T08:49:35.43',
          updatedAt: '2025-09-03T08:49:35.43',
          imagePath: '/test/image.webp'
        }
      ];

      query.mockResolvedValue({
        data: mockData,
        error: null,
        count: 1
      });

      const result = await CarMatService.getAllMats({
        type: '3d-with-rims',
        color: 'czarny',
        limit: 10
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });

    it('should handle errors gracefully', async () => {
      query.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
        count: 0
      });

      const result = await CarMatService.getAllMats();

      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
      expect(result.error).toBe('Database error');
    });
  });

  describe('getMatById', () => {
    it('should return mat by id successfully', async () => {
      const mockData = {
        id: 'cb465347-82dc-4f40-ae66-5e20628d4617',
        matType: '3d-with-rims',
        cellStructure: 'rhombus',
        materialColor: 'beżowy',
        borderColor: 'beżowy',
        createdAt: '2025-09-03T08:49:35.43',
        updatedAt: '2025-09-03T08:49:35.43',
        imagePath: '/test/image.webp'
      };

      query.mockResolvedValue({
        data: mockData,
        error: null
      });

      const result = await CarMatService.getMatById(3410383687);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id', 3410383687);
      expect(result.data).toHaveProperty('type', '3d-with-rims');
    });

    it('should return null for non-existent id', async () => {
      query.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' }
      });

      const result = await CarMatService.getMatById(999999999);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
      expect(result.error).toBe('Record not found');
    });
  });

  describe('get3DMats', () => {
    it('should return only 3D mats', async () => {
      const mockData = [
        {
          id: 'cb465347-82dc-4f40-ae66-5e20628d4617',
          matType: '3d-with-rims',
          cellStructure: 'rhombus',
          materialColor: 'beżowy',
          borderColor: 'beżowy',
          createdAt: '2025-09-03T08:49:35.43',
          updatedAt: '2025-09-03T08:49:35.43',
          imagePath: '/test/image.webp'
        }
      ];

      query.mockResolvedValue({
        data: mockData,
        error: null,
        count: 1
      });

      const result = await CarMatService.get3DMats();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].type).toBe('3d-with-rims');
    });
  });

  describe('getClassicMats', () => {
    it('should return only classic mats', async () => {
      const mockData = [
        {
          id: 'cb465347-82dc-4f40-ae66-5e20628d4617',
          matType: '3d-without-rims',
          cellStructure: 'rhombus',
          materialColor: 'beżowy',
          borderColor: 'beżowy',
          createdAt: '2025-09-03T08:49:35.43',
          updatedAt: '2025-09-03T08:49:35.43',
          imagePath: '/test/image.webp'
        }
      ];

      query.mockResolvedValue({
        data: mockData,
        error: null,
        count: 1
      });

      const result = await CarMatService.getClassicMats();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].type).toBe('3d-without-rims');
    });
  });

  describe('getUniqueValues', () => {
    it('should return unique values for a field', async () => {
      const mockData = [
        { materialColor: 'czarny' },
        { materialColor: 'beżowy' },
        { materialColor: 'czarny' },
        { materialColor: 'niebieski' }
      ];

      query.mockResolvedValue({
        data: mockData,
        error: null
      });

      const result = await CarMatService.getUniqueValues('materialColor');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(['czarny', 'beżowy', 'niebieski']);
    });
  });

  describe('createMat', () => {
    it('should create a new mat successfully', async () => {
      const newMat: MatsModel = {
        id: 1234567890,
        type: '3d-with-rims',
        color: 'czarny',
        cellType: 'rhombus',
        edgeColor: 'czarny',
        image: '/test/image.webp'
      };

      const mockData = {
        id: 'cb465347-82dc-4f40-ae66-5e20628d4617',
        matType: '3d-with-rims',
        cellStructure: 'rhombus',
        materialColor: 'czarny',
        borderColor: 'czarny',
        createdAt: '2025-09-03T08:49:35.43',
        updatedAt: '2025-09-03T08:49:35.43',
        imagePath: '/test/image.webp'
      };

      query.mockResolvedValue({
        data: mockData,
        error: null
      });

      const result = await CarMatService.createMat(newMat);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('type', '3d-with-rims');
      expect(result.data).toHaveProperty('color', 'czarny');
    });

    it('should validate mat data before creating', async () => {
      const invalidMat = {
        id: 1234567890,
        type: '3d-with-rims',
        // missing required fields
      } as MatsModel;

      const result = await CarMatService.createMat(invalidMat);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid mat data');
    });
  });

  describe('updateMat', () => {
    it('should update a mat successfully', async () => {
      const existingMat: MatsModel = {
        id: 3410383687,
        type: '3d-with-rims',
        color: 'beżowy',
        cellType: 'rhombus',
        edgeColor: 'beżowy',
        image: '/test/image.webp'
      };

      const updatedMat = {
        color: 'czarny',
        edgeColor: 'czarny'
      };

      const mockData = {
        id: 'cb465347-82dc-4f40-ae66-5e20628d4617',
        matType: '3d-with-rims',
        cellStructure: 'rhombus',
        materialColor: 'czarny',
        borderColor: 'czarny',
        createdAt: '2025-09-03T08:49:35.43',
        updatedAt: '2025-09-03T08:49:35.43',
        imagePath: '/test/image.webp'
      };

      query.mockResolvedValueOnce({
        data: {
          id: 'cb465347-82dc-4f40-ae66-5e20628d4617',
          matType: '3d-with-rims',
          cellStructure: 'rhombus',
          materialColor: 'beżowy',
          borderColor: 'beżowy',
          createdAt: '2025-09-03T08:49:35.43',
          updatedAt: '2025-09-03T08:49:35.43',
          imagePath: '/test/image.webp'
        },
        error: null
      });

      query.mockResolvedValue({
        data: mockData,
        error: null
      });

      const result = await CarMatService.updateMat(3410383687, updatedMat);

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('color', 'czarny');
      expect(result.data).toHaveProperty('edgeColor', 'czarny');
    });
  });

  describe('deleteMat', () => {
    it('should delete a mat successfully', async () => {
      query.mockResolvedValueOnce({
        data: [{ id: 'cb465347-82dc-4f40-ae66-5e20628d4617' }],
        error: null,
      });
      query.mockResolvedValue({
        data: null,
        error: null
      });

      const result = await CarMatService.deleteMat(3410383687);

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });
  });

  describe('searchMats', () => {
    it('should search mats by query', async () => {
      const mockData = [
        {
          id: 'cb465347-82dc-4f40-ae66-5e20628d4617',
          matType: '3d-with-rims',
          cellStructure: 'rhombus',
          materialColor: 'czarny',
          borderColor: 'czarny',
          createdAt: '2025-09-03T08:49:35.43',
          updatedAt: '2025-09-03T08:49:35.43',
          imagePath: '/test/image.webp'
        }
      ];

      query.mockResolvedValue({
        data: mockData,
        error: null,
        count: 1
      });

      const result = await CarMatService.searchMats('czarny');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].color).toBe('czarny');
    });
  });

  describe('getStats', () => {
    it('should return statistics', async () => {
      const mockData = [
        {
          matType: '3d-with-rims',
          materialColor: 'czarny',
          cellStructure: 'rhombus',
          borderColor: 'czarny'
        },
        {
          matType: '3d-with-rims',
          materialColor: 'beżowy',
          cellStructure: 'rhombus',
          borderColor: 'beżowy'
        }
      ];

      query.mockResolvedValue({
        data: mockData,
        error: null
      });

      const result = await CarMatService.getStats();

      expect(result.success).toBe(true);
      expect(result.data.totalCount).toBe(2);
      expect(result.data.typeCounts['3d-with-rims']).toBe(2);
      expect(result.data.colorCounts['czarny']).toBe(1);
      expect(result.data.colorCounts['beżowy']).toBe(1);
    });
  });
});
