import { NextRequest, NextResponse } from 'next/server';
import { MatsService } from '@/lib/services/MatsService';

// GET /api/mats/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Nieprawidłowe ID' },
        { status: 400 }
      );
    }

    const mats = await MatsService.getMatsById(id);
    
    if (!mats) {
      return NextResponse.json(
        { success: false, error: 'Dywanik nie został znaleziony' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: mats
    });
  } catch (error) {
    console.error('Error fetching mats by ID:', error);
    return NextResponse.json(
      { success: false, error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}

// PUT /api/mats/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Nieprawidłowe ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updateData = { ...body, id };

    const mats = await MatsService.updateMats(updateData);
    
    return NextResponse.json({
      success: true,
      data: mats
    });
  } catch (error) {
    console.error('Error updating mats:', error);
    return NextResponse.json(
      { success: false, error: 'Błąd podczas aktualizacji dywanika' },
      { status: 500 }
    );
  }
}

// DELETE /api/mats/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Nieprawidłowe ID' },
        { status: 400 }
      );
    }

    const success = await MatsService.deleteMats(id);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Nie udało się usunąć dywanika' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Dywanik został usunięty'
    });
  } catch (error) {
    console.error('Error deleting mats:', error);
    return NextResponse.json(
      { success: false, error: 'Błąd podczas usuwania dywanika' },
      { status: 500 }
    );
  }
} 