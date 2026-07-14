"use client"

import { useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import type { ConfiguratorState } from "@/features/car-configurator/utils/configuratorState"
import { useVehicleCatalog } from "@/features/vehicle-catalog/hooks/useVehicleCatalog"

type CarSelectionStepProps = {
  config: ConfiguratorState
  onUpdate: (updates: Partial<ConfiguratorState>) => void
  onNext: () => void
  hideNextButton?: boolean
}

const selectClassName =
  "w-full px-4 py-3 min-h-[44px] bg-[#111] border border-white/10 rounded-lg text-white text-sm appearance-none cursor-pointer focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"

const yearsInRange = (from: number | null, to: number | null): number[] => {
  if (from == null) return []
  const end = Math.min(to ?? new Date().getFullYear() + 1, 2100)
  return Array.from({ length: end - from + 1 }, (_, index) => from + index).reverse()
}

export const CarSelectionStep = ({
  config,
  onUpdate,
  onNext,
  hideNextButton = false,
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

  const generations = useMemo(
    () =>
      [
        ...new Map(
          templates.map((template) => [
            `${template.modelKey}|${template.generation}`,
            {
              value: `${template.modelKey}|${template.generation}`,
              modelKey: template.modelKey,
              generation: template.generation,
              generationDisplay: template.generationDisplay,
              yearFrom: template.yearFrom,
              yearTo: template.yearTo,
            },
          ]),
        ).values(),
      ].sort((left, right) => (right.yearFrom ?? 0) - (left.yearFrom ?? 0)),
    [templates],
  )

  const selectedGeneration = generations.find(
    (item) =>
      item.modelKey === config.modelKey &&
      item.generation === config.generation,
  )
  const years = selectedGeneration
    ? yearsInRange(selectedGeneration.yearFrom, selectedGeneration.yearTo)
    : []
  const matchingTemplates = templates.filter((template) => {
    if (template.modelKey !== config.modelKey || !config.year) return false
    const year = Number(config.year)
    return (
      (template.yearFrom == null || year >= template.yearFrom) &&
      (template.yearTo == null || year <= template.yearTo)
    )
  })
  const bodyOptions = matchingTemplates.flatMap((template) =>
    template.bodyTypes.map((bodyType) => ({
      value: `${template.recordKey}::${bodyType.key}`,
      template,
      bodyType,
    })),
  )
  const selectedBodyValue = config.recordKey && config.bodyTypeKey
    ? `${config.recordKey}::${config.bodyTypeKey}`
    : ""
  const isComplete = Boolean(
    config.brandKey &&
      config.modelFamilyKey &&
      config.modelKey &&
      config.year &&
      config.bodyTypeKey &&
      config.recordKey,
  )

  const handleBrandChange = (brandKey: string) => {
    const brand = brands.find((item) => item.key === brandKey)
    onUpdate({
      brand: brand?.displayName ?? brand?.name ?? "",
      brandKey,
      model: "",
      modelFamilyKey: "",
      modelKey: "",
      generation: "",
      year: "",
      bodyType: "",
      bodyTypeKey: "",
      recordKey: "",
      templateId: "",
      pricingCategoryKey: "",
      variant: "",
    })
  }

  const handleModelChange = (modelFamilyKey: string) => {
    const model = models.find((item) => item.key === modelFamilyKey)
    onUpdate({
      model: model?.displayName ?? model?.name ?? "",
      modelFamilyKey,
      modelKey: "",
      generation: "",
      year: "",
      bodyType: "",
      bodyTypeKey: "",
      recordKey: "",
      templateId: "",
      pricingCategoryKey: "",
      variant: "",
    })
  }

  const handleGenerationChange = (value: string) => {
    const generation = generations.find((item) => item.value === value)
    onUpdate({
      modelKey: generation?.modelKey ?? "",
      generation: generation?.generation ?? "",
      year: "",
      bodyType: "",
      bodyTypeKey: "",
      recordKey: "",
      templateId: "",
      pricingCategoryKey: "",
      variant: "",
    })
  }

  const handleBodyChange = (value: string) => {
    const option = bodyOptions.find((item) => item.value === value)
    onUpdate({
      bodyType: option?.bodyType.displayLabel ?? option?.bodyType.label ?? "",
      bodyTypeKey: option?.bodyType.key ?? "",
      recordKey: option?.template.recordKey ?? "",
      templateId: option?.template.id ?? "",
      pricingCategoryKey: option?.template.pricingCategoryKey ?? "",
      variant: "",
    })
  }

  const fields = [
    {
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
    {
      label: "Generacja",
      value: selectedGeneration?.value ?? "",
      disabled: !config.modelFamilyKey,
      placeholder: "Wybierz generację",
      options: generations.map((item) => ({
        value: item.value,
        label: item.generationDisplay ?? item.generation,
      })),
      onChange: handleGenerationChange,
    },
    {
      label: "Rok produkcji",
      value: config.year,
      disabled: !config.modelKey,
      placeholder: "Wybierz rok",
      options: years.map((year) => ({ value: String(year), label: String(year) })),
      onChange: (year: string) =>
        onUpdate({
          year,
          bodyType: "",
          bodyTypeKey: "",
          recordKey: "",
          templateId: "",
          pricingCategoryKey: "",
          variant: "",
        }),
    },
    {
      label: "Typ nadwozia",
      value: selectedBodyValue,
      disabled: !config.year,
      placeholder: "Wybierz typ nadwozia",
      options: bodyOptions.map((item) => ({
        value: item.value,
        label: item.bodyType.displayLabel ?? item.bodyType.label,
      })),
      onChange: handleBodyChange,
    },
  ]

  return (
    <div className="space-y-5">
      {fields.map((field) => (
        <label key={field.label} className="block text-sm text-gray-400">
          <span className="mb-2 block font-medium">{field.label} *</span>
          <select
            value={field.value}
            onChange={(event) => field.onChange(event.target.value)}
            disabled={field.disabled}
            className={selectClassName}
            aria-label={field.label}
          >
            <option value="">{field.placeholder}</option>
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
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
