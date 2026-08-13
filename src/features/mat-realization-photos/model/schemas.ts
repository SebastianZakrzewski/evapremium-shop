import { z } from "zod"

/** Typy dywanika dla zdjęć realizacji (3D z rantami / 3D bez rantów). */
export const MatRealizationMatTypeSchema = z.enum([
  "3d-with-rims",
  "classic",
])

export type MatRealizationMatType = z.infer<typeof MatRealizationMatTypeSchema>

export const MatRealizationPhotoSchema = z.object({
  id: z.string().uuid(),
  mat_template_id: z.string().uuid(),
  mat_type: MatRealizationMatTypeSchema,
  image_url: z.string().min(1),
  alt_text: z.string().nullable(),
  caption: z.string().nullable(),
  sort_order: z.number().int().nonnegative(),
  is_primary: z.boolean(),
  is_active: z.boolean(),
})

export type MatRealizationPhoto = z.infer<typeof MatRealizationPhotoSchema>

export const MatRealizationPhotosQuerySchema = z
  .object({
    recordKey: z.string().min(1).optional(),
    matTemplateId: z.string().uuid().optional(),
    brandKey: z.string().min(1).optional(),
    modelKey: z.string().min(1).optional(),
    matType: MatRealizationMatTypeSchema.optional(),
  })
  .refine(
    (value) =>
      Boolean(
        value.recordKey ||
          value.matTemplateId ||
          (value.brandKey && value.modelKey),
      ),
    {
      message:
        "Podaj recordKey, matTemplateId albo brandKey+modelKey",
    },
  )

export type MatRealizationPhotosQuery = z.infer<
  typeof MatRealizationPhotosQuerySchema
>

export const isMatRealizationMatType = (
  value: string | undefined | null,
): value is MatRealizationMatType =>
  value === "3d-with-rims" || value === "classic"
