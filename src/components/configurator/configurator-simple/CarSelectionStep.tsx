"use client"

import { useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { DarkSelect } from "@/components/configurator/configurator-v2/ui/DarkSelect"
import {
  freshVehicleConfiguration,
  type ConfiguratorState,
} from "@/features/car-configurator/utils/configuratorState"
import {
  GEARBOX_OPTIONS,
  isGearbox,
} from "@/features/car-configurator/domain/gearbox"
import { useVehicleCatalog } from "@/features/vehicle-catalog/hooks/useVehicleCatalog"
import { useConfiguratorV2InitialVehicleScroll } from "@/components/configurator/configurator-v2/hooks/useConfiguratorV2InitialVehicleScroll"
import { resolveConfiguratorV2VehicleScrollTarget } from "@/components/configurator/configurator-v2/utils/resolveConfiguratorV2VehicleScrollTarget"
import {
  VEHICLE_BODY_TYPE_FIELD_ID,
  VEHICLE_GEARBOX_FIELD_ID,
  VEHICLE_YEAR_FIELD_ID,
} from "@/components/configurator/configurator-v2/utils/configuratorV2VehicleFieldIds"
import {
  generationsForBody,
  resolveTemplateForSelection,
  selectionAfterBodyType,
  uniqueBodyOptions,
  yearsForBodyGeneration,
} from "./vehicleBodySelection"

type CarSelectionStepProps = {
  config: ConfiguratorState
  onUpdate: (updates: Partial<ConfiguratorState>) => void
  onNext: () => void
  onVehicleChange?: () => void
  hideNextButton?: boolean
  surface?: "dark" | "light"
}

export const CarSelectionStep = ({
  config,
  onUpdate,
  onNext,
  onVehicleChange,
  hideNextButton = false,
  surface = "dark",
}: CarSelectionStepProps) => {
  const { brands, models, templates, isLoading, error } = useVehicleCatalog(
    config.brandKey,
    config.modelFamilyKey,
  )

  useEffect(() => {
    if (config.brandKey || !config.brand || brands.length === 0) return
    const brand = brands.find(
      (item) =>
        item.key.toLowerCase() === config.brand.toLowerCase() ||
        item.name.toLowerCase() === config.brand.toLowerCase(),
    )
    if (brand) onUpdate({ brand: brand.displayName ?? brand.name, brandKey: brand.key })
  }, [brands, config.brand, config.brandKey, onUpdate])

  useEffect(() => {
    if (config.modelFamilyKey || !config.model || models.length === 0) return
    const model = models.find(
      (item) =>
        item.key.toLowerCase() === config.model.toLowerCase() ||
        item.name.toLowerCase() === config.model.toLowerCase(),
    )
    if (model) {
      onUpdate({
        model: model.displayName ?? model.name,
        modelFamilyKey: model.key,
      })
    }
  }, [models, config.model, config.modelFamilyKey, onUpdate])

  const bodyOptions = useMemo(() => uniqueBodyOptions(templates), [templates])
  const generations = useMemo(
    () => generationsForBody(templates, config.bodyTypeKey),
    [config.bodyTypeKey, templates],
  )
  const selectedGeneration = generations.find(
    (item) => item.modelKey === config.modelKey && item.generation === config.generation,
  )
  const years = selectedGeneration
    ? yearsForBodyGeneration(templates, config.bodyTypeKey, selectedGeneration.modelKey, selectedGeneration.generation)
    : []

  useEffect(() => {
    if (isLoading || !config.modelFamilyKey || bodyOptions.length !== 1) return
    const only = bodyOptions[0]
    if (!only) return
    const next = selectionAfterBodyType(config, templates, only)
    if (
      next.bodyTypeKey === config.bodyTypeKey &&
      next.modelKey === config.modelKey &&
      next.generation === config.generation &&
      next.year === config.year &&
      next.recordKey === config.recordKey
    ) {
      return
    }
    onUpdate(next)
  }, [
    bodyOptions,
    config,
    isLoading,
    onUpdate,
    templates,
  ])
  const isComplete = Boolean(
    config.brandKey &&
      config.modelFamilyKey &&
      config.modelKey &&
      config.year &&
      config.gearbox &&
      config.bodyTypeKey &&
      config.recordKey,
  )

  const initialScrollTargetId = useMemo(
    () =>
      resolveConfiguratorV2VehicleScrollTarget({
        isLocked: false,
        brandSelected: Boolean(config.brandKey && config.brand),
        modelSelected: Boolean(config.modelFamilyKey && config.model),
        year: config.year,
        gearbox: config.gearbox,
        bodyTypeKey: config.bodyTypeKey,
        modelKey: config.modelKey,
        isLoading,
        bodyOptionsCount: bodyOptions.length,
        yearOptionsCount: years.length,
      }),
    [
      bodyOptions.length,
      config.brand,
      config.brandKey,
      config.bodyTypeKey,
      config.model,
      config.modelFamilyKey,
      config.modelKey,
      config.year,
      config.gearbox,
      isLoading,
      years.length,
    ],
  )

  useConfiguratorV2InitialVehicleScroll({
    scrollTargetId: initialScrollTargetId,
    isReady: !isLoading,
  })

  const handleBrandChange = (brandKey: string) => {
    if (brandKey === config.brandKey) return
    const brand = brands.find((item) => item.key === brandKey)
    onVehicleChange?.()
    onUpdate({
      brand: brand?.displayName ?? brand?.name ?? "",
      brandKey,
      model: "",
      modelFamilyKey: "",
      ...freshVehicleConfiguration,
    })
  }

  const handleModelChange = (modelFamilyKey: string) => {
    if (modelFamilyKey === config.modelFamilyKey) return
    const model = models.find((item) => item.key === modelFamilyKey)
    onVehicleChange?.()
    onUpdate({
      model: model?.displayName ?? model?.name ?? "",
      modelFamilyKey,
      ...freshVehicleConfiguration,
    })
  }

  const clearDependentProduct = {
    variant: "",
    selectedPodpietka: undefined,
    podpietkaColor: undefined,
    podpietkaMounting: undefined,
  }

  const handleGenerationChange = (value: string) => {
    const generation = generations.find((item) => item.value === value)
    onUpdate({
      modelKey: generation?.modelKey ?? "",
      generation: generation?.generation ?? "",
      year: "",
      recordKey: "",
      templateId: "",
      pricingCategoryKey: "",
      ...clearDependentProduct,
    })
  }

  const handleBodyChange = (bodyTypeKey: string) => {
    const body = bodyOptions.find((item) => item.key === bodyTypeKey)
    if (!body) return
    onUpdate({
      ...selectionAfterBodyType(config, templates, body),
      ...clearDependentProduct,
    })
  }

  const handleYearChange = (year: string) => {
    const template = resolveTemplateForSelection(templates, {
      modelKey: config.modelKey,
      generation: config.generation,
      bodyTypeKey: config.bodyTypeKey,
      year,
    })
    onUpdate({
      year,
      recordKey: template?.recordKey ?? "",
      templateId: template?.id ?? "",
      pricingCategoryKey: template?.pricingCategoryKey ?? "",
      ...clearDependentProduct,
    })
  }

  const fields = [
    {
      id: undefined,
      label: "Marka",
      value: config.brandKey,
      disabled: isLoading,
      placeholder: "Wybierz markę",
      options: brands.map((item) => ({
        value: item.key,
        label: item.displayName ?? item.name,
      })),
      onChange: handleBrandChange,
    },
    {
      id: undefined,
      label: "Model",
      value: config.modelFamilyKey,
      disabled: !config.brandKey,
      placeholder: "Wybierz model",
      options: models.map((item) => ({
        value: item.key,
        label: item.displayName ?? item.name,
      })),
      onChange: handleModelChange,
    },
    ...(bodyOptions.length > 1
      ? [{
          id: VEHICLE_BODY_TYPE_FIELD_ID,
          label: "Typ nadwozia",
          value: config.bodyTypeKey,
          disabled: !config.modelFamilyKey || isLoading,
          placeholder: "Wybierz typ nadwozia",
          options: bodyOptions.map((item) => ({
            value: item.key,
            label: item.displayLabel || item.label,
          })),
          onChange: handleBodyChange,
        }]
      : []),
    ...(generations.length > 1
      ? [{
          id: undefined,
          label: "Generacja",
          value: selectedGeneration?.value ?? "",
          disabled: !config.bodyTypeKey,
          placeholder: "Wybierz generację",
          options: generations.map((item) => ({
            value: item.value,
            label: item.generationDisplay || item.generation,
          })),
          onChange: handleGenerationChange,
        }]
      : []),
    {
      id: VEHICLE_YEAR_FIELD_ID,
      label: "Rok produkcji",
      value: config.year,
      disabled: !config.modelKey || !config.bodyTypeKey,
      placeholder: "Wybierz rok",
      options: years.map((year) => ({ value: String(year), label: String(year) })),
      onChange: handleYearChange,
    },
    {
      id: VEHICLE_GEARBOX_FIELD_ID,
      label: "Skrzynia biegów",
      value: config.gearbox,
      disabled: !config.year,
      placeholder: "Wybierz skrzynię biegów",
      options: GEARBOX_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
      })),
      onChange: (gearbox: string) =>
        onUpdate({
          gearbox: isGearbox(gearbox) ? gearbox : "",
        }),
    },
  ]

  return (
    <div className="space-y-5">
      {fields.map((field) => (
        <div key={field.label} id={field.id} className="block scroll-mt-4">
          <span
            className={`mb-2 block text-[13px] font-medium ${
              surface === "light" ? "text-neutral-700" : "text-white/55"
            }`}
          >
            {field.label} *
          </span>
          <DarkSelect
            id={field.id ? `${field.id}-select` : field.label}
            value={field.value}
            placeholder={field.placeholder}
            ariaLabel={field.label}
            options={field.options}
            disabled={field.disabled}
            surface={surface}
            onChange={field.onChange}
          />
        </div>
      ))}

      {error && (
        <p role="alert" className="text-sm text-red-400">
          Nie udało się pobrać katalogu pojazdów.
        </p>
      )}

      {!hideNextButton && (
        <Button
          type="button"
          onClick={onNext}
          disabled={!isComplete}
          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50"
        >
          Dalej
        </Button>
      )}
    </div>
  )
}
