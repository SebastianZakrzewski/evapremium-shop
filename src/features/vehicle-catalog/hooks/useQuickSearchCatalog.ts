"use client"

import { useQuery } from "@tanstack/react-query"
import {
  fetchCatalogModels,
  fetchCatalogTemplates,
} from "../api/client"

export const useQuickSearchCatalog = (brandKey: string, modelFamilyKey: string) => {
  const modelsQuery = useQuery({
    queryKey: ["vehicle-catalog", "quick-search-models", brandKey],
    queryFn: () => fetchCatalogModels(brandKey),
    enabled: Boolean(brandKey),
    staleTime: 30 * 60 * 1000,
  })

  const templatesQuery = useQuery({
    queryKey: ["vehicle-catalog", "quick-search-templates", brandKey, modelFamilyKey],
    queryFn: () => fetchCatalogTemplates(brandKey, modelFamilyKey),
    enabled: Boolean(brandKey && modelFamilyKey),
    staleTime: 30 * 60 * 1000,
  })

  return {
    models: modelsQuery.data ?? [],
    templates: templatesQuery.data ?? [],
    isLoading: modelsQuery.isLoading || templatesQuery.isLoading,
  }
}
