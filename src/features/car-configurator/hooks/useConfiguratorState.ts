import { useCallback, useEffect, useState } from "react";
import type { Brand } from "@/entities/car";
import {
  type ConfiguratorState,
  type ConfiguratorUrlParams,
  getConfigUpdatesFromUrl,
  mergeStoredConfig,
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
  const lockedEntry = !!(urlParams.brandParam && urlParams.modelParam);

  return {
    ...baseState,
    brand: urlParams.brandParam || baseState.brand,
    model: urlParams.modelParam || baseState.model,
    generation: urlParams.generationParam || baseState.generation,
    year: lockedEntry ? "" : urlParams.yearParam || baseState.year,
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
};

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
  const [config, setConfig] = useState<ConfiguratorState>(() =>
    getInitialConfig(searchParams, initialState)
  );

  useEffect(() => {
    const urlParams = getUrlParams(searchParams);
    setConfig((prev) => {
      const updates = getConfigUpdatesFromUrl({
        previous: prev,
        urlParams,
        brands,
      });
      return Object.keys(updates).length > 0 ? { ...prev, ...updates } : prev;
    });
  }, [searchParams, brands]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(config));
  }, [config, storageKey]);

  useEffect(() => {
    const urlParams = getUrlParams(searchParams);
    const saved = localStorage.getItem(storageKey);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as Partial<ConfiguratorState>;
      setConfig((prev) =>
        mergeStoredConfig({ previous: prev, stored: parsed, urlParams })
      )
    } catch (error) {
      console.error("Error loading saved config:", error);
    }
  }, [searchParams, storageKey]);

  const updateConfig = useCallback((updates: Partial<ConfiguratorState>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  return { config, setConfig, updateConfig };
};
