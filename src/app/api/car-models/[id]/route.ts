import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, TABLES } from '@/lib/database/supabase';

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

    const { data, error } = await supabaseAdmin
      .from(TABLES.CAR_MODELS)
      .select('*')
      .eq('id', idNum)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Model auta nie został znaleziony' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
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
    
    const { data, error } = await supabaseAdmin
      .from(TABLES.CAR_MODELS)
      .update(body)
      .eq('id', idNum)
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json(data);
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

    const { error } = await supabaseAdmin
      .from(TABLES.CAR_MODELS)
      .delete()
      .eq('id', idNum);

    if (error) throw error;
    
    return NextResponse.json({ message: 'Model auta został usunięty' });
  } catch (error) {
    console.error('Błąd podczas usuwania modelu auta:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas usuwania modelu auta' },
      { status: 500 }
    );
  }
} 