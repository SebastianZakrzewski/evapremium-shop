import { NextRequest, NextResponse } from 'next/server';
import { CarModelService } from '@/lib/services/CarModelService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Nieprawidłowe ID modelu auta' },
        { status: 400 }
      );
    }

    const carModel = await CarModelService.getCarModelById(id);
    
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
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Nieprawidłowe ID modelu auta' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const carModel = await CarModelService.updateCarModel({ id, ...body });
    
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
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Nieprawidłowe ID modelu auta' },
        { status: 400 }
      );
    }

    await CarModelService.deleteCarModel(id);
    
    return NextResponse.json({ message: 'Model auta został usunięty' });
  } catch (error) {
    console.error('Błąd podczas usuwania modelu auta:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas usuwania modelu auta' },
      { status: 500 }
    );
  }
} 