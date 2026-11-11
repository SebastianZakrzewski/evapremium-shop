import type { Brand } from "@/entities/car"
import { isGearbox, type Gearbox } from "@/features/car-configurator/domain/gearbox"
import type { PodpietkaMounting } from "@/features/car-configurator/domain/podpietkaMounting"
import {
  brandNameToNavigationSlug,
  resolveBrandFromUrlParam,
} from "@/shared/brands/brandParam"
import { formatBrandDisplayName } from "@/shared/vehicle/displayLabels"

export interface ConfiguratorState {
  brand: string;
  brandKey: string;
  model: string;
  modelFamilyKey: string;
  modelKey: string;
  generation: string;
  templateId: string;
  recordKey: string;
  year: string;
  gearbox: Gearbox | "";
  bodyType: string;
  bodyTypeKey: string;
  pricingCategoryKey: string;
  catalogVersionCode: string;
  matType: "3d-with-rims" | "classic" | "single";
  variant: string;
  structure: "diamonds" | "honey";
  color: string;
  edgeColor: string;
  heelPad: boolean;
  selectedPodpietka?: string;
  podpietkaColor?: string;
  podpietkaMounting?: PodpietkaMounting;
  /** Optional accessory ids (organizers and finishes). Prices come from the shop catalog. */
  selectedAddonIds?: string[];
}

export type ConfiguratorUrlParams = {
  brandParam?: string | null;
  modelParam?: string | null;
  yearParam?: string | null;
  bodyTypeParam?: string | null;
  generationParam?: string | null;
};

const isSameToken = (left: string, right: string): boolean =>
  left.trim().toLowerCase() === right.trim().toLowerCase();

/** Nazwa z katalogu, np. „Bayon 1 gen”, to ten sam model co slug „bayon” w adresie. */
const urlModelMatchesConfiguredModel = (
  previous: ConfiguratorState,
  modelParam: string,
): boolean => {
  const param = modelParam.trim().toLowerCase()
  if (!param) return false
  if (
    [previous.modelKey, previous.modelFamilyKey].some(
      (value) => value.trim().toLowerCase() === param,
    )
  ) {
    return true
  }
  const model = previous.model.trim().toLowerCase()
  if (model === param) return true
  if (!model.startsWith(param)) return false
  const boundary = model.charAt(param.length)
  return boundary === "" || /[\s\-_(]/.test(boundary)
}

export const isLockedProductEntry = (urlParams: ConfiguratorUrlParams): boolean =>
  !!(urlParams.brandParam?.trim() && urlParams.modelParam?.trim());

export const resolveBrandFromParam = (brandParam: string, brands: Brand[]): string => {
  if (!brandParam) return ""

  const fromUrl = resolveBrandFromUrlParam(brandParam)
  if (fromUrl?.displayName) return fromUrl.displayName

  if (brands.length > 0) {
    const paramSlug = brandNameToNavigationSlug(brandParam)
    const matched = brands.find((brand) => {
      const name = brand.name.toLowerCase()
      return (
        name === brandParam.toLowerCase() ||
        brandNameToNavigationSlug(brand.name) === paramSlug
      )
    })
    if (matched) return formatBrandDisplayName(matched.name)
  }

  return formatBrandDisplayName(brandParam)
}

/** Wybory produktu kasowane przy nowej marce lub modelu. */
export const freshVehicleConfiguration: Partial<ConfiguratorState> = {
  modelKey: "",
  generation: "",
  templateId: "",
  recordKey: "",
  year: "",
  gearbox: "",
  bodyType: "",
  bodyTypeKey: "",
  pricingCategoryKey: "",
  catalogVersionCode: "",
  matType: "3d-with-rims",
  variant: "",
  structure: "diamonds",
  color: "black",
  edgeColor: "black",
  heelPad: false,
  selectedPodpietka: undefined,
  podpietkaColor: undefined,
  podpietkaMounting: undefined,
  selectedAddonIds: [],
}

export const getConfigUpdatesFromUrl = ({
  previous,
  urlParams,
  brands,
}: {
  previous: ConfiguratorState;
  urlParams: ConfiguratorUrlParams;
  brands: Brand[];
}): Partial<ConfiguratorState> => {
  const updates: Partial<ConfiguratorState> = {};
  const { brandParam, modelParam, bodyTypeParam, generationParam } = urlParams;

  if (brandParam) {
    const resolvedBrand = resolveBrandFromParam(brandParam, brands);
    if (previous.brand !== resolvedBrand) {
      updates.brand = resolvedBrand;
    }
  }

  if (modelParam && !urlModelMatchesConfiguredModel(previous, modelParam)) {
    updates.model = modelParam;
    updates.year = "";
    if (!bodyTypeParam) {
      updates.bodyType = "";
    }
  }

  if (generationParam && previous.generation !== generationParam) {
    updates.generation = generationParam;
  }

  if (bodyTypeParam && !isSameToken(previous.bodyType, bodyTypeParam)) {
    updates.bodyType = bodyTypeParam;
  }

  return updates;
};

export const mergeStoredConfig = ({
  previous,
  stored,
  urlParams,
}: {
  previous: ConfiguratorState;
  stored: Partial<ConfiguratorState>;
  urlParams: ConfiguratorUrlParams;
}): ConfiguratorState => {
  const updates: Partial<ConfiguratorState> = { ...stored };

  if (urlParams.brandParam) {
    delete updates.brand
    delete updates.brandKey
  }

  if (urlParams.modelParam) {
    const storedModel = stored.model ?? ""
    const storedModelMatchesUrl =
      storedModel.length > 0 && isSameToken(storedModel, urlParams.modelParam)

    if (!storedModelMatchesUrl) {
      delete updates.year
      delete updates.gearbox
      delete updates.variant
    }

    delete updates.modelFamilyKey
    delete updates.modelKey
    delete updates.recordKey
    delete updates.templateId
    delete updates.pricingCategoryKey
    delete updates.catalogVersionCode
    delete updates.bodyTypeKey

    if (!urlParams.generationParam) {
      delete updates.generation
    }

    if (
      !previous.model ||
      !isSameToken(previous.model, urlParams.modelParam)
    ) {
      updates.model = urlParams.modelParam
    } else {
      delete updates.model
    }

    if (!storedModelMatchesUrl && !urlParams.bodyTypeParam) {
      delete updates.bodyType
    }
  }

  if (urlParams.bodyTypeParam) {
    delete updates.recordKey
    delete updates.templateId
    delete updates.bodyTypeKey
    delete updates.pricingCategoryKey
    if (
      !previous.bodyType ||
      !isSameToken(previous.bodyType, urlParams.bodyTypeParam)
    ) {
      updates.bodyType = urlParams.bodyTypeParam;
    } else {
      delete updates.bodyType;
    }
  }

  if (urlParams.generationParam) {
    updates.generation = urlParams.generationParam;
  }

  return { ...previous, ...updates };
};

const MAT_TYPES = new Set(["3d-with-rims", "classic", "single"])
const STRUCTURES = new Set(["diamonds", "honey"])

export const configuratorStorageKeyForUrl = (
  baseKey: string,
  urlParams: ConfiguratorUrlParams,
): string => {
  const brand = urlParams.brandParam?.trim().toLowerCase()
  const model = urlParams.modelParam?.trim().toLowerCase()
  if (!brand || !model) return baseKey
  return `${baseKey}::${brand}::${model}`
}

export const parseStoredConfiguratorState = (
  raw: string | null,
): Partial<ConfiguratorState> | null => {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null
    const record = parsed as Record<string, unknown>
    const stored: Partial<ConfiguratorState> = {}

    if (typeof record.brand === "string") stored.brand = record.brand
    if (typeof record.model === "string") stored.model = record.model
    if (typeof record.generation === "string") stored.generation = record.generation
    if (typeof record.year === "string" && /^\d{4}$/.test(record.year)) stored.year = record.year
    if (isGearbox(record.gearbox)) stored.gearbox = record.gearbox
    if (typeof record.bodyType === "string") stored.bodyType = record.bodyType
    if (typeof record.variant === "string") stored.variant = record.variant
    if (typeof record.matType === "string" && MAT_TYPES.has(record.matType)) {
      stored.matType = record.matType as ConfiguratorState["matType"]
    }
    if (typeof record.structure === "string" && STRUCTURES.has(record.structure)) {
      stored.structure = record.structure as ConfiguratorState["structure"]
    }
    if (typeof record.color === "string") stored.color = record.color
    if (typeof record.edgeColor === "string") stored.edgeColor = record.edgeColor
    if (typeof record.heelPad === "boolean") stored.heelPad = record.heelPad
    if (Array.isArray(record.selectedAddonIds)) {
      stored.selectedAddonIds = record.selectedAddonIds.filter((id) => typeof id === "string")
    }

    return stored
  } catch {
    return null
  }
}

export const readCompatibleStoredConfig = (
  baseKey: string,
  urlParams: ConfiguratorUrlParams,
  readItem: (key: string) => string | null,
): Partial<ConfiguratorState> | null => {
  const scoped = parseStoredConfiguratorState(readItem(configuratorStorageKeyForUrl(baseKey, urlParams)))
  if (scoped) return scoped

  const legacy = parseStoredConfiguratorState(readItem(baseKey))
  if (!legacy) return null
  if (
    urlParams.modelParam &&
    legacy.model &&
    !isSameToken(legacy.model, urlParams.modelParam)
  ) {
    return null
  }
  return legacy
}
