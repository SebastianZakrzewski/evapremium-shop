import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { env } from '@/config/env';
import {
  CAR_MODELS_EXTENDED_SELECT,
  CAR_MODELS_EXTENDED_SELECT_MINIMAL,
} from '@/lib/validators/car-models-extended';

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

// Schema walidacji parametrów
const ModelParamsSchema = z.object({
  brand: z.string().min(1, 'Nazwa marki jest wymagana'),
  model: z.string().min(1, 'Nazwa modelu jest wymagana')
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brand: string; model: string }> }
) {
  try {
    // Pobierz parametry asynchronicznie
    const resolvedParams = await params;
    
    // Walidacja parametrów
    const validatedParams = ModelParamsSchema.parse({
      brand: decodeURIComponent(resolvedParams.brand),
      model: decodeURIComponent(resolvedParams.model)
    });

    const brandName = validatedParams.brand;
    const modelName = validatedParams.model;

    // Pobierz wszystkie generacje dla danego modelu
    let result = await supabase
      .from('car_models_extended')
      .select(CAR_MODELS_EXTENDED_SELECT)
      .eq('brand_name', brandName)
      .eq('model_name', modelName)
      .order('generation', { ascending: true });
    let { data: generations, error } = result;
    if (error && (error.message?.includes('column') || error.message?.includes('does not exist'))) {
      result = await supabase
        .from('car_models_extended')
        .select(CAR_MODELS_EXTENDED_SELECT_MINIMAL)
        .eq('brand_name', brandName)
        .eq('model_name', modelName)
        .order('generation', { ascending: true });
      generations = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Błąd podczas pobierania generacji' },
        { status: 500 }
      );
    }

    if (!generations || generations.length === 0) {
      return NextResponse.json([]);
    }

    // Grupuj po generacjach
    const generationsList = Array.isArray(generations) ? (generations as unknown[]) : [];
    const groupedGenerations = generationsList.reduce((acc: Record<string, {
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
      const generationKey = row.generation as string;
      if (!acc[generationKey]) {
        acc[generationKey] = {
          brand: brandName,
          model: modelName,
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
      if (row.body_type) acc[generationKey].bodyTypes.add(row.body_type as string);
      if (row.year_from != null) acc[generationKey].years.add(row.year_from as number);
      if (row.year_to != null) acc[generationKey].years.add(row.year_to as number);
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
