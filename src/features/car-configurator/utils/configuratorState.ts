import type { Brand } from "@/entities/car";
import type { PodpietkaMounting } from "@/features/car-configurator/domain/podpietkaMounting";

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
}

export type ConfiguratorUrlParams = {
  brandParam?: string | null;
  modelParam?: string | null;
  yearParam?: string | null;
  bodyTypeParam?: string | null;
  generationParam?: string | null;
};

const capitalize = (value: string): string =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const isSameToken = (left: string, right: string): boolean =>
  left.trim().toLowerCase() === right.trim().toLowerCase();

export const isLockedProductEntry = (urlParams: ConfiguratorUrlParams): boolean =>
  !!(urlParams.brandParam?.trim() && urlParams.modelParam?.trim());

export const resolveBrandFromParam = (brandParam: string, brands: Brand[]): string => {
  if (!brandParam) return "";
  if (brands.length > 0) {
    const matched = brands.find(
      (brand) => brand.name.toLowerCase() === brandParam.toLowerCase()
    );
    if (matched) return matched.name;
  }
  return capitalize(brandParam);
};

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
  const { brandParam, modelParam, yearParam, bodyTypeParam, generationParam } = urlParams;

  if (brandParam) {
    const resolvedBrand = resolveBrandFromParam(brandParam, brands);
    if (previous.brand !== resolvedBrand) {
      updates.brand = resolvedBrand;
    }
  }

  if (modelParam && !isSameToken(previous.model, modelParam)) {
    updates.model = modelParam;
    updates.year = "";
    if (!bodyTypeParam) {
      updates.bodyType = "";
    }
  }

  if (generationParam && previous.generation !== generationParam) {
    updates.generation = generationParam;
  }

  if (modelParam && yearParam && previous.year) {
    updates.year = "";
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
    delete updates.year
    delete updates.modelFamilyKey
    delete updates.modelKey
    delete updates.recordKey
    delete updates.templateId
    delete updates.pricingCategoryKey
    delete updates.bodyTypeKey

    if (!urlParams.generationParam) {
      delete updates.generation
    }

    const storedModelMatchesUrl =
      stored.model && isSameToken(stored.model, urlParams.modelParam)

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
