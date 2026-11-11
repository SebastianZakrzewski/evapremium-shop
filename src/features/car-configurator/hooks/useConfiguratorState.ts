import { useCallback, useEffect, useRef, useState } from "react";
import type { Brand } from "@/entities/car";
import {
  type ConfiguratorState,
  type ConfiguratorUrlParams,
  configuratorStorageKeyForUrl,
  getConfigUpdatesFromUrl,
  mergeStoredConfig,
  readCompatibleStoredConfig,
} from "../utils/configuratorState";

const CONFIGURATOR_STORAGE_KEY = "configurator-simple-state";

const getUrlParams = (searchParams: URLSearchParams): ConfiguratorUrlParams => ({
  brandParam: searchParams.get("brand"),
  modelParam: searchParams.get("model"),
  yearParam: searchParams.get("year"),
  bodyTypeParam: searchParams.get("bodyType"),
  generationParam: searchParams.get("generation"),
});

const getInitialConfig = (
  searchParams: URLSearchParams,
  baseState: ConfiguratorState
): ConfiguratorState => {
  const urlParams = getUrlParams(searchParams);

  return {
    ...baseState,
    brand: urlParams.brandParam || baseState.brand,
    model: urlParams.modelParam || baseState.model,
    generation: urlParams.generationParam || baseState.generation,
    year: "",
    bodyType: urlParams.bodyTypeParam || baseState.bodyType,
  };
};

const defaultState: ConfiguratorState = {
  brand: "",
  brandKey: "",
  model: "",
  modelFamilyKey: "",
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
  selectedFinishIds: undefined,
};

const isFourDigitYear = (value: string | null): value is string =>
  Boolean(value && /^\d{4}$/.test(value.trim()));

export type UseConfiguratorStateArgs = {
  searchParams: URLSearchParams;
  brands: Brand[];
  storageKey?: string;
  initialState?: ConfiguratorState;
};

export const useConfiguratorState = ({
  searchParams,
  brands,
  storageKey = CONFIGURATOR_STORAGE_KEY,
  initialState = defaultState,
}: UseConfiguratorStateArgs) => {
  const urlParams = getUrlParams(searchParams);
  const activeStorageKey = configuratorStorageKeyForUrl(storageKey, urlParams);
  const enteredVehicle = Boolean(urlParams.brandParam?.trim() && urlParams.modelParam?.trim());
  const [config, setConfig] = useState<ConfiguratorState>(() =>
    getInitialConfig(searchParams, initialState)
  );
  const [hydrated, setHydrated] = useState(false);
  const suppressSave = useRef(true);
  const seenYearParam = useRef<string | null | undefined>(undefined);
  const hydratedKey = useRef<string | null>(null);

  useEffect(() => {
    suppressSave.current = true;
    const params = getUrlParams(searchParams);
    const switchingVehicle =
      hydratedKey.current !== null && hydratedKey.current !== activeStorageKey;
    hydratedKey.current = activeStorageKey;
    const stored =
      enteredVehicle || switchingVehicle || typeof window === "undefined"
        ? null
        : readCompatibleStoredConfig(storageKey, params, (key) => localStorage.getItem(key));
    setConfig(
      mergeStoredConfig({
        previous: getInitialConfig(searchParams, initialState),
        stored: stored ?? {},
        urlParams: params,
      }),
    );
    setHydrated(true);
    // A brand and model in the URL always start from defaults. Storage is
    // only a draft for the open configurator before a vehicle is chosen.
    // A year-only URL change must not replace the selection on screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStorageKey]);

  const urlSignature = searchParams.toString();
  const brandsSignature = brands.map((brand) => brand.name).join("|");

  useEffect(() => {
    if (!hydrated) return;
    const params = getUrlParams(searchParams);
    setConfig((prev) => {
      const updates = getConfigUpdatesFromUrl({
        previous: prev,
        urlParams: params,
        brands,
      });
      return Object.keys(updates).length > 0 ? { ...prev, ...updates } : prev;
    });
  }, [brands, brandsSignature, hydrated, searchParams, urlSignature]);

  useEffect(() => {
    if (!hydrated) return;
    const yearParam = urlParams.yearParam ?? null;
    if (seenYearParam.current === undefined) {
      seenYearParam.current = yearParam;
      return;
    }
    if (seenYearParam.current === yearParam) return;
    seenYearParam.current = yearParam;
    setConfig((prev) => {
      if (isFourDigitYear(yearParam)) {
        const year = yearParam.trim();
        return prev.year === year ? prev : { ...prev, year };
      }
      if (yearParam) {
        return prev.year === "" ? prev : { ...prev, year: "" };
      }
      return prev;
    });
  }, [hydrated, urlParams.yearParam]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    if (suppressSave.current) {
      suppressSave.current = false;
      return;
    }
    if (enteredVehicle) return;
    try {
      localStorage.setItem(activeStorageKey, JSON.stringify(config));
    } catch {
      // A full browser store must not discard the in-memory selection.
    }
  }, [activeStorageKey, config, enteredVehicle, hydrated]);

  const updateConfig = useCallback((updates: Partial<ConfiguratorState>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  return { config, setConfig, updateConfig, hydrated };
};
