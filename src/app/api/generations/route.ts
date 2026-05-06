import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { env } from '@/config/env';

export const maxDuration = 30
import {
  CAR_MODELS_EXTENDED_SELECT,
  CAR_MODELS_EXTENDED_SELECT_MINIMAL,
} from '@/lib/validators/car-models-extended';

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

// Schema walidacji parametrów zapytania
const QueryParamsSchema = z.object({
  brand: z.string().optional(),
  model: z.string().optional(),
  bodyType: z.string().optional(),
  yearFrom: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  yearTo: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  isCurrentlyProduced: z.string().transform(val => val === 'true').optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = {
      brand: searchParams.get('brand'),
      model: searchParams.get('model'),
      bodyType: searchParams.get('bodyType'),
      yearFrom: searchParams.get('yearFrom'),
      yearTo: searchParams.get('yearTo'),
      isCurrentlyProduced: searchParams.get('isCurrentlyProduced'),
    };

    // Walidacja parametrów
    const validatedParams = QueryParamsSchema.parse(queryParams);

    // Budowanie zapytania
    let query = supabase
      .from('car_models_extended')
      .select(CAR_MODELS_EXTENDED_SELECT)
      .order('brand_name', { ascending: true })
      .order('model_name', { ascending: true })
      .order('generation', { ascending: true });

    // Dodawanie filtrów
    if (validatedParams.brand) {
      query = query.eq('brand_name', validatedParams.brand);
    }
    
    if (validatedParams.model) {
      query = query.eq('model_name', validatedParams.model);
    }
    
    if (validatedParams.bodyType) {
      query = query.eq('body_type', validatedParams.bodyType);
    }
    
    if (validatedParams.yearFrom) {
      query = query.gte('year_from', validatedParams.yearFrom);
    }
    
    if (validatedParams.yearTo) {
      query = query.lte('year_to', validatedParams.yearTo);
    }
    
    if (validatedParams.isCurrentlyProduced !== undefined) {
      query = query.eq('is_currently_produced', validatedParams.isCurrentlyProduced);
    }

    let result = await query;
    let { data, error } = result;
    if (error && (error.message?.includes('column') || error.message?.includes('does not exist'))) {
      query = supabase
        .from('car_models_extended')
        .select(CAR_MODELS_EXTENDED_SELECT_MINIMAL)
        .order('brand_name', { ascending: true })
        .order('model_name', { ascending: true })
        .order('generation', { ascending: true });
      if (validatedParams.brand) query = query.eq('brand_name', validatedParams.brand);
      if (validatedParams.model) query = query.eq('model_name', validatedParams.model);
      if (validatedParams.bodyType) query = query.eq('body_type', validatedParams.bodyType);
      if (validatedParams.yearFrom) query = query.gte('year_from', validatedParams.yearFrom);
      if (validatedParams.yearTo) query = query.lte('year_to', validatedParams.yearTo);
      if (validatedParams.isCurrentlyProduced !== undefined) {
        query = query.eq('is_currently_produced', validatedParams.isCurrentlyProduced);
      }
      result = await query;
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Błąd podczas pobierania generacji' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json([]);
    }

    // Grupowanie generacji po marce, modelu i generacji
    const dataList = Array.isArray(data) ? (data as unknown[]) : [];
    const groupedGenerations = dataList.reduce((acc: Record<string, {
      brand: string;
      model: string;
      generation: string | null;
      yearFrom: number | null;
      yearTo: number | null;
      isCurrentlyProduced: boolean | null;
      templateAvailable?: boolean | null;
      templateLocation?: string | null;
      stoperType?: string | null;
      stoperCount?: number | null;
      notesGeneral?: string | null;
      notesFront?: string | null;
      notesRear?: string | null;
      notesTrunk?: string | null;
      hasHookMount?: boolean | null;
      matFormat?: string | null;
      completeness?: string | null;
      hasTunnelMat?: boolean | null;
      velcroNotes?: string | null;
      bodyTypes: Set<string>;
      years: Set<number>;
    }>, item: unknown) => {
      const row = item as Record<string, unknown>;
      const key = `${row.brand_name}-${row.model_name}-${row.generation}`;
      if (!acc[key]) {
        acc[key] = {
          brand: row.brand_name as string,
          model: row.model_name as string,
          generation: row.generation as string | null,
          yearFrom: row.year_from as number | null,
          yearTo: row.year_to as number | null,
          isCurrentlyProduced: row.is_currently_produced as boolean | null,
          templateAvailable: row.template_available as boolean | null | undefined,
          templateLocation: row.template_location as string | null | undefined,
          stoperType: row.stoper_type as string | null | undefined,
          stoperCount: row.stoper_count as number | null | undefined,
          notesGeneral: row.notes_general as string | null | undefined,
          notesFront: row.notes_front as string | null | undefined,
          notesRear: row.notes_rear as string | null | undefined,
          notesTrunk: row.notes_trunk as string | null | undefined,
          hasHookMount: row.has_hook_mount as boolean | null | undefined,
          matFormat: row.mat_format as string | null | undefined,
          completeness: row.completeness as string | null | undefined,
          hasTunnelMat: row.has_tunnel_mat as boolean | null | undefined,
          velcroNotes: row.velcro_notes as string | null | undefined,
          bodyTypes: new Set(),
          years: new Set(),
        };
      }
      if (row.body_type) acc[key].bodyTypes.add(row.body_type as string);
      if (row.year_from != null) acc[key].years.add(row.year_from as number);
      if (row.year_to != null) acc[key].years.add(row.year_to as number);
      return acc;
    }, {} as Record<string, {
      brand: string;
      model: string;
      generation: string | null;
      yearFrom: number | null;
      yearTo: number | null;
      isCurrentlyProduced: boolean | null;
      templateAvailable?: boolean | null;
      templateLocation?: string | null;
      stoperType?: string | null;
      stoperCount?: number | null;
      notesGeneral?: string | null;
      notesFront?: string | null;
      notesRear?: string | null;
      notesTrunk?: string | null;
      hasHookMount?: boolean | null;
      matFormat?: string | null;
      completeness?: string | null;
      hasTunnelMat?: boolean | null;
      velcroNotes?: string | null;
      bodyTypes: Set<string>;
      years: Set<number>;
    }>);

    const response = Object.values(groupedGenerations).map((gen) => ({
      brand: gen.brand,
      model: gen.model,
      generation: gen.generation,
      yearFrom: gen.yearFrom,
      yearTo: gen.yearTo,
      isCurrentlyProduced: gen.isCurrentlyProduced,
      templateAvailable: gen.templateAvailable,
      templateLocation: gen.templateLocation,
      stoperType: gen.stoperType,
      stoperCount: gen.stoperCount,
      notesGeneral: gen.notesGeneral,
      notesFront: gen.notesFront,
      notesRear: gen.notesRear,
      notesTrunk: gen.notesTrunk,
      hasHookMount: gen.hasHookMount,
      matFormat: gen.matFormat,
      completeness: gen.completeness,
      hasTunnelMat: gen.hasTunnelMat,
      velcroNotes: gen.velcroNotes,
      bodyTypes: Array.from(gen.bodyTypes).sort(),
      years: Array.from(gen.years).sort((a, b) => b - a),
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd serwera' },
      { status: 500 }
    );
  }
}
