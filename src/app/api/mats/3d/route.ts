import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, TABLES } from '@/lib/database/supabase';

// GET /api/mats/3d
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const edgeColor = searchParams.get('edgeColor') || 'black';
    const cellType = searchParams.get('cellType') || 'diamonds';
    const type = searchParams.get('type') || '3d';

    // Pobierz dywaniki z określonymi filtrami
    const { data, error } = await supabaseAdmin
      .from(TABLES.MATS)
      .select('*')
      .eq('matType', type)
      .eq('cellStructure', cellType)
      .eq('borderColor', edgeColor)
      .order('createdAt', { ascending: true });

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