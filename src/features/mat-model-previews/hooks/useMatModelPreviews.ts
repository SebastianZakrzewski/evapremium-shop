"use client"

import { useQuery } from "@tanstack/react-query"
import { apiGet } from "@/lib/api/client"
import type { MatModelPreview } from "../model/schemas"

export type UseMatModelPreviewsParams = {
  recordKey?: string
  matTemplateId?: string
  brandKey?: string
  modelKey?: string
  bodyTypeKey?: string
  enabled?: boolean
}

export type UseMatModelPreviewsReturn = {
  previews: MatModelPreview[]
  isLoading: boolean
  error: Error | null
}

const buildQueryUrl = (params: UseMatModelPreviewsParams): string => {
  const searchParams = new URLSearchParams()
  if (params.recordKey) searchParams.set("recordKey", params.recordKey)
  if (params.matTemplateId) {
    searchParams.set("matTemplateId", params.matTemplateId)
  }
  if (params.brandKey) searchParams.set("brandKey", params.brandKey)
  if (params.modelKey) searchParams.set("modelKey", params.modelKey)
  if (params.bodyTypeKey) searchParams.set("bodyTypeKey", params.bodyTypeKey)
  return `/api/mat-model-previews?${searchParams.toString()}`
}

/**
 * Pobiera zdjęcia podglądowe produktu dla wybranego szablonu / modelu.
 */
export const useMatModelPreviews = (
  params: UseMatModelPreviewsParams = {},
): UseMatModelPreviewsReturn => {
  const {
    recordKey,
    matTemplateId,
    brandKey,
    modelKey,
    bodyTypeKey,
    enabled = true,
  } = params

  const canQuery = Boolean(
    recordKey || matTemplateId || (brandKey && modelKey),
  )

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "mat-model-previews",
      recordKey,
      matTemplateId,
      brandKey,
      modelKey,
      bodyTypeKey,
    ],
    queryFn: async () => {
      const response = await apiGet<{
        previews: MatModelPreview[]
        count: number
      }>(buildQueryUrl(params))
      return response
    },
    enabled: enabled && canQuery,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    retryDelay: 1000,
  })

  return {
    previews: data?.previews ?? [],
    isLoading,
    error: (error as Error) ?? null,
  }
}
