"use client"



import { useQuery } from "@tanstack/react-query"

import {

  fetchCatalogBrands,

  fetchCatalogModels,

  fetchCatalogTemplates,

  fetchCatalogTemplatesByPrefix,

} from "../api/client"



export const useVehicleCatalog = (

  brandKey: string,

  modelFamilyKey: string,

  modelFamilyPrefix = "",

  modelParamForBrand = "",

) => {

  const brandsQuery = useQuery({

    queryKey: ["vehicle-catalog", "brands"],

    queryFn: fetchCatalogBrands,

    staleTime: 30 * 60 * 1000,

  })

  const modelsQuery = useQuery({

    queryKey: ["vehicle-catalog", "models", brandKey, modelParamForBrand],

    queryFn: () => fetchCatalogModels(brandKey, modelParamForBrand),

    enabled: Boolean(brandKey),

    staleTime: 30 * 60 * 1000,

  })

  const templatesQuery = useQuery({

    queryKey: [

      "vehicle-catalog",

      "templates",

      brandKey,

      modelFamilyKey,

      modelFamilyPrefix,

    ],

    queryFn: () =>

      modelFamilyPrefix

        ? fetchCatalogTemplatesByPrefix(brandKey, modelFamilyPrefix)

        : fetchCatalogTemplates(brandKey, modelFamilyKey),

    enabled: Boolean(brandKey && (modelFamilyKey || modelFamilyPrefix)),

    staleTime: 30 * 60 * 1000,

  })



  return {

    brands: brandsQuery.data ?? [],

    models: modelsQuery.data ?? [],

    templates: templatesQuery.data ?? [],

    isLoading:

      brandsQuery.isLoading ||

      modelsQuery.isLoading ||

      templatesQuery.isLoading,

    error:

      brandsQuery.error ??

      modelsQuery.error ??

      templatesQuery.error ??

      null,

  }

}

