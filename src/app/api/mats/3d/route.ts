import { NextRequest, NextResponse } from 'next/server';
import { CarMatService } from '@/lib/services/carmat-service';

// GET /api/mats/3d
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const edgeColor = searchParams.get('edgeColor') || 'black';
    const cellType = searchParams.get('cellType') || 'diamonds';
    const type = searchParams.get('type') || '3d';

    const result = await CarMatService.get3DMats({
      cellType: cellType === 'diamonds' ? 'rhombus' : cellType,
      edgeColor: edgeColor === 'black' ? 'czarny' : edgeColor
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
      filter: {
        type,
        cellType,
        edgeColor
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