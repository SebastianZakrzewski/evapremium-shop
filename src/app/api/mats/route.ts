import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, TABLES } from '@/lib/database/supabase';

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

    let query = supabaseAdmin.from(TABLES.MATS).select('*');
    
    // Zastosuj filtry
    if (type) query = query.eq('matType', type);
    if (color) query = query.eq('materialColor', color);
    if (cellType) query = query.eq('cellStructure', cellType);
    if (edgeColor) query = query.eq('borderColor', edgeColor);

    const { data, error } = await query.order('createdAt', { ascending: true });

    if (error) throw error;

    // Mapowanie danych z bazy na format API
    const mats = (data || []).map(item => ({
      id: parseInt(item.id.split('-')[0], 16) || 0,
      type: item.matType,
      color: item.materialColor,
      cellType: item.cellStructure,
      edgeColor: item.borderColor,
      image: item.imagePath
    }));

    return NextResponse.json({
      success: true,
      data: mats,
      count: mats.length,
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
    
    const { data, error } = await supabaseAdmin
      .from(TABLES.MATS)
      .insert([{
        matType: body.type,
        materialColor: body.color,
        cellStructure: body.cellType,
        borderColor: body.edgeColor,
        imagePath: body.image
      }])
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
    
    return NextResponse.json({
      success: true,
      data: mat
    });
  } catch (error) {
    console.error('Error creating mats:', error);
    return NextResponse.json(
      { success: false, error: 'Błąd podczas tworzenia dywanika' },
      { status: 500 }
    );
  }
} 