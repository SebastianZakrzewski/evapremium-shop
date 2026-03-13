/**
 * Walidacja i typy dla tabeli car_models_extended (Supabase)
 *
 * Zgodne ze schematem:
 * brand_name, model_name, generation, body_type, year_from, year_to,
 * is_currently_produced, brand_image, model_image, vehicle_category,
 * template_available, stoper_type, stoper_count, template_location,
 * notes_general, notes_front, notes_rear, notes_trunk, has_hook_mount,
 * mat_format, completeness, has_tunnel_mat, velcro_notes
 */

import { z } from 'zod';

/** Schemat pojedynczego wiersza z tabeli car_models_extended */
export const CarModelsExtendedRowSchema = z.object({
  brand_name: z.string().max(100),
  model_name: z.string().max(200),
  generation: z.string().max(50).nullable(),
  body_type: z.string().max(100).nullable(),
  year_from: z.number().int().nullable(),
  year_to: z.number().int().nullable(),
  is_currently_produced: z.boolean().nullable(),

  brand_image: z.string().max(500).nullable().optional(),
  model_image: z.string().max(500).nullable().optional(),
  vehicle_category: z.string().max(50).nullable().optional(),

  template_available: z.boolean().nullable().optional(),
  stoper_type: z.string().max(50).nullable().optional(),
  stoper_count: z.number().nullable().optional(),
  template_location: z.string().max(200).nullable().optional(),

  notes_general: z.string().nullable().optional(),
  notes_front: z.string().nullable().optional(),
  notes_rear: z.string().nullable().optional(),
  notes_trunk: z.string().nullable().optional(),

  has_hook_mount: z.boolean().nullable().optional(),
  mat_format: z.string().max(200).nullable().optional(),
  completeness: z.string().max(100).nullable().optional(),
  has_tunnel_mat: z.boolean().nullable().optional(),
  velcro_notes: z.string().max(200).nullable().optional(),
});

export type CarModelsExtendedRow = z.infer<typeof CarModelsExtendedRowSchema>;

/** Kolumny podstawowe (zawsze dostępne) */
const CAR_MODELS_EXTENDED_BASE_COLUMNS = [
  'brand_name',
  'model_name',
  'generation',
  'body_type',
  'year_from',
  'year_to',
  'is_currently_produced',
] as const;

/** Kolumny rozszerzone (wymagają migracji tabeli) */
const CAR_MODELS_EXTENDED_EXTENDED_COLUMNS = [
  'brand_image',
  'model_image',
  'vehicle_category',
  'template_available',
  'stoper_type',
  'stoper_count',
  'template_location',
  'notes_general',
  'notes_front',
  'notes_rear',
  'notes_trunk',
  'has_hook_mount',
  'mat_format',
  'completeness',
  'has_tunnel_mat',
  'velcro_notes',
] as const;

/** Lista kolumn do SELECT – pełna (wymaga migracji tabeli) */
export const CAR_MODELS_EXTENDED_SELECT = [
  ...CAR_MODELS_EXTENDED_BASE_COLUMNS,
  ...CAR_MODELS_EXTENDED_EXTENDED_COLUMNS,
].join(', ');

/** Lista kolumn podstawowych (backward compatibility) */
export const CAR_MODELS_EXTENDED_SELECT_MINIMAL =
  CAR_MODELS_EXTENDED_BASE_COLUMNS.join(', ');
