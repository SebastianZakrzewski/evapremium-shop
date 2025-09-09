import { NextRequest, NextResponse } from 'next/server';
import { CarMatService } from '@/lib/services/carmat-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNum = parseInt(id);
    
    if (isNaN(idNum)) {
      return NextResponse.json(
        { error: 'Nieprawidłowe ID maty' },
        { status: 400 }
      );
    }

    const result = await CarMatService.getMatById(idNum);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Wystąpił błąd podczas pobierania maty' },
        { status: result.data === null ? 404 : 500 }
      );
    }

    if (!result.data) {
      return NextResponse.json(
        { error: 'Mata nie została znaleziona' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Błąd podczas pobierania maty:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas pobierania maty' },
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
        { error: 'Nieprawidłowe ID maty' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    const result = await CarMatService.updateMat(idNum, body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Wystąpił błąd podczas aktualizacji maty' },
        { status: result.data === null ? 404 : 400 }
      );
    }

    if (!result.data) {
      return NextResponse.json(
        { error: 'Mata nie została znaleziona' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Błąd podczas aktualizacji maty:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas aktualizacji maty' },
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
        { error: 'Nieprawidłowe ID maty' },
        { status: 400 }
      );
    }

    const result = await CarMatService.deleteMat(idNum);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Wystąpił błąd podczas usuwania maty' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ message: 'Mata została usunięta' });
  } catch (error) {
    console.error('Błąd podczas usuwania maty:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas usuwania maty' },
      { status: 500 }
    );
  }
} 