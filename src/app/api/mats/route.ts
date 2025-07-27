import { NextRequest, NextResponse } from 'next/server';
import { MatsService } from '@/lib/services/MatsService';

// GET /api/mats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const color = searchParams.get('color');
    const cellType = searchParams.get('cellType');
    const edgeColor = searchParams.get('edgeColor');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let mats;

    // Jeśli są parametry filtrowania
    if (type || color || cellType || edgeColor) {
      const filter: any = {};
      if (type) filter.type = type;
      if (color) filter.color = color;
      if (cellType) filter.cellType = cellType;
      if (edgeColor) filter.edgeColor = edgeColor;

      mats = await MatsService.getMatsByFilter(filter);
      
      return NextResponse.json({
        success: true,
        data: mats,
        count: mats.length,
        filtered: true
      });
    }

    // Jeśli nie ma filtrów, zwróć z paginacją
    const result = await MatsService.getMatsWithPagination(page, limit);
    
    return NextResponse.json({
      success: true,
      data: result.mats,
      count: result.total,
      page: result.page,
      totalPages: result.totalPages,
      pagination: {
        current: result.page,
        total: result.totalPages,
        hasNext: result.page < result.totalPages,
        hasPrev: result.page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching mats:', error);
    return NextResponse.json(
      { success: false, error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}

// POST /api/mats
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const mats = await MatsService.createMats(body);
    
    return NextResponse.json({
      success: true,
      data: mats
    });
  } catch (error) {
    console.error('Error creating mats:', error);
    return NextResponse.json(
      { success: false, error: 'Błąd podczas tworzenia dywanika' },
      { status: 500 }
    );
  }
} 