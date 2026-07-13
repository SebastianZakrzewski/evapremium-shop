/**
 * Validation schema for evapremium_shop.mat_templates
 * Mapped from output/evamats-templates-compact.json + structured extras.
 */
import { z } from 'zod'

export const MatTemplateCompactSchema = z.object({
  dealer_pricing_category: z.string().min(1).max(100),
  dealer_pricing_category_key: z.string().min(1).max(100),
  brand_name: z.string().min(1).max(100),
  model_name: z.string().min(1).max(200),
  model_family_name: z.string().min(1).max(200),
  model_family_key: z.string().min(1).max(200),
  generation: z.string().max(50).nullable(),
  year_from: z.number().int().min(1900).max(2100).nullable(),
  year_to: z.number().int().min(1900).max(2100).nullable(),
  body_type_1: z.string().max(100).nullable(),
  body_type_2: z.string().max(100).nullable(),
  body_type_3: z.string().max(100).nullable(),
  body_type_variants: z.array(z.string().min(1).max(100)),
})

export const MatTemplateRowSchema = MatTemplateCompactSchema.extend({
  id: z.string().uuid().optional(),
  dealer_pricing_category_source: z.string().max(100).nullable().optional(),
  brand_key: z.string().min(1).max(100),
  model_key: z.string().min(1).max(200),
  is_open_ended: z.boolean().default(false),
  body_type_1_key: z.string().max(50).nullable().optional(),
  body_type_2_key: z.string().max(50).nullable().optional(),
  body_type_3_key: z.string().max(50).nullable().optional(),
  body_type: z.string().max(100).nullable().optional(),
  body_type_key: z.string().max(50).nullable().optional(),
  record_key: z.string().min(1).max(300),
  source_file: z.string().max(255).nullable().optional(),
  source_sheet: z.string().max(100).nullable().optional(),
  source_row_id: z.number().int().positive().nullable().optional(),
  json_version: z.string().max(20).default('1.5.0'),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
}).refine(
  (row) => row.year_from == null || row.year_to == null || row.year_from <= row.year_to,
  { message: 'year_from must be less than or equal to year_to', path: ['year_to'] },
)

export type MatTemplateCompact = z.infer<typeof MatTemplateCompactSchema>
export type MatTemplateRow = z.infer<typeof MatTemplateRowSchema>

export const MAT_TEMPLATES_SELECT = [
  'id',
  'dealer_pricing_category',
  'dealer_pricing_category_key',
  'dealer_pricing_category_source',
  'brand_name',
  'brand_key',
  'model_name',
  'model_key',
  'model_family_name',
  'model_family_key',
  'generation',
  'year_from',
  'year_to',
  'is_open_ended',
  'body_type_1',
  'body_type_2',
  'body_type_3',
  'body_type_1_key',
  'body_type_2_key',
  'body_type_3_key',
  'body_type',
  'body_type_key',
  'body_type_variants',
  'record_key',
  'source_file',
  'source_sheet',
  'source_row_id',
  'json_version',
  'is_active',
  'created_at',
  'updated_at',
].join(', ')

export const MAT_TEMPLATE_JSON_TO_DB_MAP = {
  dealer_pricing_category: 'dealer_pricing_category',
  dealer_pricing_category_key: 'dealer_pricing_category_key',
  dealer_pricing_category_source: 'dealer_pricing_category_source',
  brand_name: 'brand_name',
  brand_key: 'brand_key',
  model_name: 'model_name',
  model_key: 'model_key',
  model_family_name: 'model_family_name',
  model_family_key: 'model_family_key',
  generation: 'generation',
  'generation.year_from': 'year_from',
  'generation.year_to': 'year_to',
  'generation.is_open_ended': 'is_open_ended',
  body_type_1: 'body_type_1',
  body_type_2: 'body_type_2',
  body_type_3: 'body_type_3',
  'body_types.body_type_1.key': 'body_type_1_key',
  'body_types.body_type_2.key': 'body_type_2_key',
  'body_types.body_type_3.key': 'body_type_3_key',
  body_type: 'body_type',
  body_type_key: 'body_type_key',
  body_type_variants: 'body_type_variants',
  record_key: 'record_key',
  id: 'source_row_id',
} as const
