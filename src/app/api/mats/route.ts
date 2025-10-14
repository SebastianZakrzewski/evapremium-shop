import { NextRequest, NextResponse } from 'next/server';
import { MatService } from '@/lib/services/MatService';
import { MatFilters } from '@/lib/types/mat';

const matService = new MatService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filters from query parameters
    const filters: MatFilters = {};
    
    const brandSlug = searchParams.get('brandSlug');
    if (brandSlug) {
      filters.carBrandSlug = brandSlug;
    }
    
    const modelSlug = searchParams.get('modelSlug');
    if (modelSlug) {
      filters.carModelSlug = modelSlug;
    }
    
    const generation = searchParams.get('generation');
    if (generation) {
      filters.generation = generation;
    }
    
    const bodyType = searchParams.get('bodyType');
    if (bodyType) {
      filters.bodyType = bodyType;
    }
    
    const yearFrom = searchParams.get('yearFrom');
    if (yearFrom) {
      filters.yearFrom = parseInt(yearFrom);
    }
    
    const yearTo = searchParams.get('yearTo');
    if (yearTo) {
      filters.yearTo = parseInt(yearTo);
    }
    
    const isActive = searchParams.get('isActive');
    if (isActive !== null) {
      filters.isActive = isActive === 'true';
    }
    
    const orderBy = searchParams.get('orderBy') as any;
    if (orderBy) {
      filters.orderBy = orderBy;
    }
    
    const orderDirection = searchParams.get('orderDirection') as any;
    if (orderDirection) {
      filters.orderDirection = orderDirection;
    }
    
    const mats = await matService.getAvailableMats(filters);
    
    return NextResponse.json({
      success: true,
      data: mats,
      count: mats.length
    });
  } catch (error) {
    console.error('Error fetching mats:', error);
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