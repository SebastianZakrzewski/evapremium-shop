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
        { error: 'Nieprawidłowe ID maty' },
        { status: 400 }
      );
    }

    // Znajdź matę po ID (konwersja z UUID)
    const { data, error } = await supabaseAdmin
      .from(TABLES.MATS)
      .select('*')
      .limit(1000);

    if (error) throw error;
    
    const foundItem = (data || []).find(item => 
      parseInt(item.id.split('-')[0], 16) === idNum
    );
    
    if (!foundItem) {
      return NextResponse.json(
        { error: 'Mata nie została znaleziona' },
        { status: 404 }
      );
    }

    const mat = {
      id: parseInt(foundItem.id.split('-')[0], 16) || 0,
      type: foundItem.matType,
      color: foundItem.materialColor,
      cellType: foundItem.cellStructure,
      edgeColor: foundItem.borderColor,
      image: foundItem.imagePath
    };

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
    
    // Znajdź matę po ID
    const { data: allData, error: fetchError } = await supabaseAdmin
      .from(TABLES.MATS)
      .select('*')
      .limit(1000);

    if (fetchError) throw fetchError;
    
    const foundItem = (allData || []).find(item => 
      parseInt(item.id.split('-')[0], 16) === idNum
    );
    
    if (!foundItem) {
      return NextResponse.json(
        { error: 'Mata nie została znaleziona' },
        { status: 404 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from(TABLES.MATS)
      .update({
        matType: body.type,
        materialColor: body.color,
        cellStructure: body.cellType,
        borderColor: body.edgeColor,
        imagePath: body.image
      })
      .eq('id', foundItem.id)
      .select()
      .single();

    if (error) throw error;

    const mat = {
      id: parseInt(data.id.split('-')[0], 16) || 0,
      type: data.matType,
      color: data.materialColor,
      cellType: data.cellStructure,
      edgeColor: data.borderColor,
      image: data.imagePath
    };
    
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

    // Znajdź matę po ID
    const { data: allData, error: fetchError } = await supabaseAdmin
      .from(TABLES.MATS)
      .select('*')
      .limit(1000);

    if (fetchError) throw fetchError;
    
    const foundItem = (allData || []).find(item => 
      parseInt(item.id.split('-')[0], 16) === idNum
    );
    
    if (!foundItem) {
      return NextResponse.json(
        { error: 'Mata nie została znaleziona' },
        { status: 404 }
      );
    }

    const { error } = await supabaseAdmin
      .from(TABLES.MATS)
      .delete()
      .eq('id', foundItem.id);

    if (error) throw error;
    
    return NextResponse.json({ message: 'Mata została usunięta' });
  } catch (error) {
    console.error('Błąd podczas usuwania maty:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas usuwania maty' },
      { status: 500 }
    );
  }
} 