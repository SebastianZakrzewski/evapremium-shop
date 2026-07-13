import type {
  PricingResolveInput,
  VehicleCatalogBrand,
  VehicleModelFamily,
  VehicleTemplateOption,
} from "../model/schemas"

type BrandsResponse = {
  level: "brands"
  brands: VehicleCatalogBrand[]
}

type ModelsResponse = {
  level: "models"
  models: VehicleModelFamily[]
}

type TemplatesResponse = {
  level: "templates"
  templates: VehicleTemplateOption[]
}

export type PricingResponse = {
  recordKey: string
  templateId: string
  pricingCategoryKey: string
  catalogVersionCode: string
  availableMatTypes: Array<"classic" | "3d-with-rims" | "single">
  matType: "classic" | "3d-with-rims" | "single" | null
  variants: Array<{
    key: string
    label: string
    basePrice: number
    priceAfterDiscount: number
    discount: number
  }>
  selectedVariant: {
    key: string
    label: string
    basePrice: number
    priceAfterDiscount: number
    discount: number
  } | null
}

const requestJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init)
  const payload = (await response.json()) as T & { error?: string }
  if (!response.ok) throw new Error(payload.error ?? "Vehicle catalog request failed")
  return payload
}

export const fetchCatalogBrands = async (): Promise<VehicleCatalogBrand[]> => {
  const response = await requestJson<BrandsResponse>("/api/vehicle-catalog")
  return response.brands
}

export const fetchCatalogModels = async (
  brandKey: string,
  modelParam = "",
): Promise<VehicleModelFamily[]> => {
  const params = new URLSearchParams({ brandKey })
  if (modelParam.trim()) params.set("modelParam", modelParam.trim())
  const response = await requestJson<ModelsResponse>(
    `/api/vehicle-catalog?${params.toString()}`,
  )
  return response.models
}

export const fetchCatalogTemplates = async (
  brandKey: string,
  modelFamilyKey: string,
): Promise<VehicleTemplateOption[]> => {
  const response = await requestJson<TemplatesResponse>(
    `/api/vehicle-catalog?brandKey=${encodeURIComponent(brandKey)}` +
      `&modelFamilyKey=${encodeURIComponent(modelFamilyKey)}`,
  )
  return response.templates
}

export const fetchCatalogTemplatesByPrefix = async (
  brandKey: string,
  modelFamilyPrefix: string,
): Promise<VehicleTemplateOption[]> => {
  const response = await requestJson<TemplatesResponse>(
    `/api/vehicle-catalog?brandKey=${encodeURIComponent(brandKey)}` +
      `&modelFamilyPrefix=${encodeURIComponent(modelFamilyPrefix)}`,
  )
  return response.templates
}

export const fetchResolvedPricing = async (
  input: PricingResolveInput,
): Promise<PricingResponse> =>
  requestJson<PricingResponse>("/api/pricing/resolve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
