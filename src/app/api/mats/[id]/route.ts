import { NextRequest, NextResponse } from 'next/server';
import { MatsService } from '@/lib/services/MatsService';

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

    const mat = await MatsService.getMatsById(idNum);
    
    if (!mat) {
      return NextResponse.json(
        { error: 'Mata nie została znaleziona' },
        { status: 404 }
      );
    }

    return NextResponse.json(mat);
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
    const mat = await MatsService.updateMats({ id: idNum, ...body });
    
    return NextResponse.json(mat);
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

    await MatsService.deleteMats(idNum);
    
    return NextResponse.json({ message: 'Mata została usunięta' });
  } catch (error) {
    console.error('Błąd podczas usuwania maty:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas usuwania maty' },
      { status: 500 }
    );
  }
} 