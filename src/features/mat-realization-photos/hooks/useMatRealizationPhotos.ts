"use client"

import { useQuery } from "@tanstack/react-query"
import { apiGet } from "@/lib/api/client"
import type {
  MatRealizationMatType,
  MatRealizationPhoto,
} from "../model/schemas"

export type UseMatRealizationPhotosParams = {
  recordKey?: string
  matTemplateId?: string
  brandKey?: string
  modelKey?: string
  matType?: MatRealizationMatType
  enabled?: boolean
}

export type UseMatRealizationPhotosReturn = {
  photos: MatRealizationPhoto[]
  isLoading: boolean
  error: Error | null
}

const buildQueryUrl = (params: UseMatRealizationPhotosParams): string => {
  const searchParams = new URLSearchParams()
  if (params.recordKey) searchParams.set("recordKey", params.recordKey)
  if (params.matTemplateId) {
    searchParams.set("matTemplateId", params.matTemplateId)
  }
  if (params.brandKey) searchParams.set("brandKey", params.brandKey)
  if (params.modelKey) searchParams.set("modelKey", params.modelKey)
  if (params.matType) searchParams.set("matType", params.matType)
  return `/api/mat-realization-photos?${searchParams.toString()}`
}

/**
 * Pobiera zdjęcia rzeczywistych realizacji dla wybranego szablonu / modelu
 * i typu dywanika (3d-with-rims | classic).
 */
export const useMatRealizationPhotos = (
  params: UseMatRealizationPhotosParams = {},
): UseMatRealizationPhotosReturn => {
  const {
    recordKey,
    matTemplateId,
    brandKey,
    modelKey,
    matType,
    enabled = true,
  } = params

  const canQuery = Boolean(
    (recordKey || matTemplateId || (brandKey && modelKey)) && matType,
  )

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "mat-realization-photos",
      recordKey,
      matTemplateId,
      brandKey,
      modelKey,
      matType,
    ],
    queryFn: async () => {
      const response = await apiGet<{
        photos: MatRealizationPhoto[]
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
    photos: data?.photos ?? [],
    isLoading,
    error: (error as Error) ?? null,
  }
}
