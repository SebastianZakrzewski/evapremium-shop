import { NextRequest, NextResponse } from 'next/server';
import { SupabaseCarModelService } from '@/lib/services/SupabaseCarModelService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNum = parseInt(id);
    
    if (isNaN(idNum)) {
      return NextResponse.json(
        { error: 'Nieprawidłowe ID modelu auta' },
        { status: 400 }
      );
    }

    const carModel = await SupabaseCarModelService.getCarModelById(idNum);
    
    if (!carModel) {
      return NextResponse.json(
        { error: 'Model auta nie został znaleziony' },
        { status: 404 }
      );
    }

    return NextResponse.json(carModel);
  } catch (error) {
    console.error('Błąd podczas pobierania modelu auta:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas pobierania modelu auta' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNum = parseInt(id);
    
    if (isNaN(idNum)) {
      return NextResponse.json(
        { error: 'Nieprawidłowe ID modelu auta' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const carModel = await SupabaseCarModelService.updateCarModel({ id: idNum, ...body });
    
    return NextResponse.json(carModel);
  } catch (error) {
    console.error('Błąd podczas aktualizacji modelu auta:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas aktualizacji modelu auta' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNum = parseInt(id);
    
    if (isNaN(idNum)) {
      return NextResponse.json(
        { error: 'Nieprawidłowe ID modelu auta' },
        { status: 400 }
      );
    }

    await SupabaseCarModelService.deleteCarModel(idNum);
    
    return NextResponse.json({ message: 'Model auta został usunięty' });
  } catch (error) {
    console.error('Błąd podczas usuwania modelu auta:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas usuwania modelu auta' },
      { status: 500 }
    );
  }
} 