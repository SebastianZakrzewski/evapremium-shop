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
const BrandParamsSchema = z.object({
  brand: z.string().min(1, 'Nazwa marki jest wymagana')
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brand: string }> }
) {
  try {
    // Pobierz parametry asynchronicznie
    const resolvedParams = await params;
    
    // Walidacja parametrów
    const validatedParams = BrandParamsSchema.parse({
      brand: decodeURIComponent(resolvedParams.brand)
    });

    const brandName = validatedParams.brand;

    // Pobierz wszystkie modele dla danej marki
    let queryResult = await supabase
      .from('car_models_extended')
      .select(CAR_MODELS_EXTENDED_SELECT)
      .eq('brand_name', brandName)
      .order('model_name', { ascending: true })
      .order('generation', { ascending: true });
    let { data: models, error } = queryResult;

    if (error && (error.message?.includes('column') || error.message?.includes('does not exist'))) {
      queryResult = await supabase
        .from('car_models_extended')
        .select(CAR_MODELS_EXTENDED_SELECT_MINIMAL)
        .eq('brand_name', brandName)
        .order('model_name', { ascending: true })
        .order('generation', { ascending: true });
      models = queryResult.data;
      error = queryResult.error;
    }

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Błąd podczas pobierania modeli' },
        { status: 500 }
      );
    }

    if (!models || models.length === 0) {
      return NextResponse.json([]);
    }

    // Grupuj modele po nazwie
    const modelsList = Array.isArray(models) ? (models as unknown[]) : [];
    const groupedModels = modelsList.reduce((acc: Record<string, {
      brand: string;
      model: string;
      brandImage?: string | null;
      modelImage?: string | null;
      vehicleCategory?: string | null;
      generations: Array<Record<string, unknown>>;
      bodyTypes: Set<string>;
      years: Set<number>;
      isCurrentlyProduced: boolean;
    }>, item: unknown) => {
      const row = item as Record<string, unknown>;
      const modelName = row.model_name as string;
      if (!acc[modelName]) {
        acc[modelName] = {
          brand: brandName,
          model: modelName,
          brandImage: row.brand_image as string | null | undefined,
          modelImage: row.model_image as string | null | undefined,
          vehicleCategory: row.vehicle_category as string | null | undefined,
          generations: [],
          bodyTypes: new Set(),
          years: new Set(),
          isCurrentlyProduced: false,
        };
      }
      acc[modelName].generations.push({
        generation: row.generation,
        bodyType: row.body_type,
        yearFrom: row.year_from,
        yearTo: row.year_to,
        isCurrentlyProduced: row.is_currently_produced,
        templateAvailable: row.template_available ?? undefined,
        templateLocation: row.template_location ?? undefined,
        stoperType: row.stoper_type ?? undefined,
        stoperCount: row.stoper_count ?? undefined,
        notesGeneral: row.notes_general ?? undefined,
        notesFront: row.notes_front ?? undefined,
        notesRear: row.notes_rear ?? undefined,
        notesTrunk: row.notes_trunk ?? undefined,
        hasHookMount: row.has_hook_mount ?? undefined,
        matFormat: row.mat_format ?? undefined,
        completeness: row.completeness ?? undefined,
        hasTunnelMat: row.has_tunnel_mat ?? undefined,
        velcroNotes: row.velcro_notes ?? undefined,
      });
      if (row.body_type) acc[modelName].bodyTypes.add(row.body_type as string);
      if (row.year_from != null) acc[modelName].years.add(row.year_from as number);
      if (row.year_to != null) acc[modelName].years.add(row.year_to as number);
      if (row.is_currently_produced) acc[modelName].isCurrentlyProduced = true;
      return acc;
    }, {});

    const response = Object.values(groupedModels).map((model) => ({
      brand: model.brand,
      model: model.model,
      brandImage: model.brandImage,
      modelImage: model.modelImage,
      vehicleCategory: model.vehicleCategory,
      bodyTypes: Array.from(model.bodyTypes).sort(),
      years: Array.from(model.years).sort((a, b) => b - a),
      isCurrentlyProduced: model.isCurrentlyProduced,
      generations: model.generations,
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
