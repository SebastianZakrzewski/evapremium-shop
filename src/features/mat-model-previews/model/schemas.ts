import { z } from "zod"

export const MatModelPreviewSchema = z.object({
  id: z.string().uuid(),
  mat_template_id: z.string().uuid(),
  body_type_key: z.string().min(1).nullable(),
  image_url: z.string().min(1),
  alt_text: z.string().nullable(),
  caption: z.string().nullable(),
  sort_order: z.number().int().nonnegative(),
  is_primary: z.boolean(),
  is_active: z.boolean(),
})

export type MatModelPreview = z.infer<typeof MatModelPreviewSchema>

export const MatModelPreviewsQuerySchema = z
  .object({
    recordKey: z.string().min(1).optional(),
    matTemplateId: z.string().uuid().optional(),
    brandKey: z.string().min(1).optional(),
    modelKey: z.string().min(1).optional(),
    bodyTypeKey: z.string().min(1).optional(),
  })
  .refine(
    (value) =>
      Boolean(
        value.recordKey ||
          value.matTemplateId ||
          (value.brandKey && value.modelKey),
      ),
    {
      message: "Podaj recordKey, matTemplateId albo brandKey+modelKey",
    },
  )

export type MatModelPreviewsQuery = z.infer<typeof MatModelPreviewsQuerySchema>
