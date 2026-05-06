import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { MatService } from '@/lib/services/MatService';

export const maxDuration = 30
import { MatFilters } from '@/entities/product';

const matService = new MatService();

const matsQuerySchema = z.object({
  brandSlug: z.string().trim().min(1).optional(),
  modelSlug: z.string().trim().min(1).optional(),
  generation: z.string().trim().min(1).optional(),
  bodyType: z.string().trim().min(1).optional(),
  yearFrom: z.coerce.number().int().optional(),
  yearTo: z.coerce.number().int().optional(),
  isActive: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .optional()
    .transform((val) => (typeof val === 'string' ? val === 'true' : val)),
  orderBy: z.string().trim().optional(),
  orderDirection: z.enum(['asc', 'desc']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const parsed = matsQuerySchema.safeParse(Object.fromEntries(searchParams.entries()));
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid query parameters',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const payload = parsed.data;

    // Parse filters from query parameters
    const filters: MatFilters = {};

    if (payload.brandSlug) {
      filters.carBrandSlug = payload.brandSlug;
    }

    if (payload.modelSlug) {
      filters.carModelSlug = payload.modelSlug;
    }

    if (payload.generation) {
      filters.generation = payload.generation;
    }

    if (payload.bodyType) {
      filters.bodyType = payload.bodyType;
    }

    if (payload.yearFrom !== undefined) {
      filters.yearFrom = payload.yearFrom;
    }

    if (payload.yearTo !== undefined) {
      filters.yearTo = payload.yearTo;
    }

    if (payload.isActive !== undefined) {
      filters.isActive = payload.isActive;
    }

    if (payload.orderBy) {
      filters.orderBy = payload.orderBy as any;
    }

    if (payload.orderDirection) {
      filters.orderDirection = payload.orderDirection as any;
    }

    console.log('🔍 API /api/mats: Fetching mats with filters:', filters);

    const mats = await matService.getAvailableMats(filters);

    console.log(`✅ API /api/mats: Found ${mats.length} mats`);

    return NextResponse.json({
      success: true,
      data: mats,
      count: mats.length
    });
  } catch (error) {
    console.error('❌ Error fetching mats:', error);
    // Zwróć pustą tablicę zamiast błędu 500, jeśli tabela jest pusta lub nie istnieje
    if (error instanceof Error && (error.message.includes('relation') || error.message.includes('does not exist'))) {
      console.warn('⚠️ Mats table may not exist or be empty, returning empty array');
      return NextResponse.json({
        success: true,
        data: [],
        count: 0
      });
    }
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.carBrandSlug || !body.carModelSlug || !body.basePrice) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: carBrandSlug, carModelSlug, basePrice' 
        },
        { status: 400 }
      );
    }
    
    const mat = await matService.createMat(body);
    
    return NextResponse.json({
      success: true,
      data: mat
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating mat:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 400 }
    );
  }
}