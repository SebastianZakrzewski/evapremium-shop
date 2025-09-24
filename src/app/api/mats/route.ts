import { NextRequest, NextResponse } from 'next/server';
import { CarMatService } from '@/lib/services/carmat-service';

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
    const offset = (page - 1) * limit;

    const result = await CarMatService.getAllMats({
      type: type || undefined,
      color: color || undefined,
      cellType: cellType || undefined,
      edgeColor: edgeColor || undefined,
      limit,
      offset
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Błąd serwera' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      count: result.count,
      filtered: !!(type || color || cellType || edgeColor)
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
    
    const result = await CarMatService.createMat(body);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Nieprawidłowe dane dywanika' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Error creating mats:', error);
    return NextResponse.json(
      { success: false, error: 'Błąd podczas tworzenia dywanika' },
      { status: 500 }
    );
  }
} 