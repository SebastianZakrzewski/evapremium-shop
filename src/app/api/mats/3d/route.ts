import { NextRequest, NextResponse } from 'next/server';
import { MatsService } from '@/lib/services/MatsService';

// GET /api/mats/3d
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const edgeColor = searchParams.get('edgeColor') || 'black';
    const cellType = searchParams.get('cellType') || 'diamonds';
    const type = searchParams.get('type') || '3d';

    // Pobierz dywaniki z określonym kolorem obszycia
    const filter = {
      type,
      cellType,
      edgeColor
    };

    const mats = await MatsService.getMatsByFilter(filter);
    
    return NextResponse.json({
      success: true,
      data: mats,
      count: mats.length,
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