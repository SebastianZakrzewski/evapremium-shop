import type { Brand } from "@/entities/car";

export interface ConfiguratorState {
  brand: string;
  model: string;
  year: string;
  bodyType: string;
  matType: "3d-with-rims" | "classic";
  variant: "" | "front" | "basic" | "premium" | "complete";
  structure: "diamonds" | "honey";
  color: string;
  edgeColor: string;
  heelPad: boolean;
  selectedPodpietka?: string;
  podpietkaColor?: string;
}

export type ConfiguratorUrlParams = {
  brandParam?: string | null;
  modelParam?: string | null;
  yearParam?: string | null;
  bodyTypeParam?: string | null;
};

const capitalize = (value: string): string =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const isSameToken = (left: string, right: string): boolean =>
  left.trim().toLowerCase() === right.trim().toLowerCase();

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
  const { brandParam, modelParam, yearParam, bodyTypeParam } = urlParams;

  if (brandParam) {
    const resolvedBrand = resolveBrandFromParam(brandParam, brands);
    if (previous.brand !== resolvedBrand) {
      updates.brand = resolvedBrand;
    }
  }

  if (modelParam && !isSameToken(previous.model, modelParam)) {
    updates.model = modelParam;
  }

  if (yearParam && previous.year !== yearParam) {
    updates.year = yearParam;
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
    delete updates.brand;
  }

  if (urlParams.modelParam) {
    if (
      !previous.model ||
      !isSameToken(previous.model, urlParams.modelParam)
    ) {
      updates.model = urlParams.modelParam;
    } else {
      delete updates.model;
    }
  }

  if (urlParams.bodyTypeParam) {
    if (
      !previous.bodyType ||
      !isSameToken(previous.bodyType, urlParams.bodyTypeParam)
    ) {
      updates.bodyType = urlParams.bodyTypeParam;
    } else {
      delete updates.bodyType;
    }
  }

  return { ...previous, ...updates };
};
