"use client"

import { useEffect, useMemo, useRef } from "react"
import { buildVehicleDisplayLabels } from "@/shared/vehicle/displayLabels"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Car, CheckCircle2 } from "lucide-react"
import { resolveConfiguratorBrandImage } from "@/features/car-configurator/utils/resolveConfiguratorBrandImage"
import {
  shouldServeBrandImageUnoptimized,
} from "@/shared/brands"
import type { ConfiguratorState } from "@/features/car-configurator/utils/configuratorState"
import type { ProductEntryLock } from "@/features/car-configurator/utils/productEntryContext"
import {
  bodyTypeMatchesParam,
  resolveCatalogBrandKey,
  resolveModelFamiliesFromParam,
} from "@/features/vehicle-catalog/domain/catalogKeys"
import { useVehicleCatalog } from "@/features/vehicle-catalog/hooks/useVehicleCatalog"
import {
  computeLockedCarAvailableYears,
  isCatalogResolving,
  resolveLockedCarGeneration,
} from "@/features/car-configurator/utils/lockedCarContextLogic"

type LockedCarContextStepProps = {
  config: Pick<
    ConfiguratorState,
    | "brand"
    | "brandKey"
    | "model"
    | "modelFamilyKey"
    | "modelKey"
    | "generation"
    | "year"
    | "bodyType"
    | "bodyTypeKey"
    | "recordKey"
    | "templateId"
    | "pricingCategoryKey"
  >
  productEntry: ProductEntryLock
  onUpdate: (updates: Partial<ConfiguratorState>) => void
  onNext: () => void
  hideNextButton?: boolean
}

const selectClassName =
  "w-full px-4 py-3 min-h-[44px] bg-[#111] border border-white/10 rounded-lg text-white text-sm appearance-none cursor-pointer focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"

const normalizeToken = (value: string): string =>
  value.toLowerCase().replace(/[\s_-]+/g, "")

export const LockedCarContextStep = ({
  config,
  productEntry,
  onUpdate,
  onNext,
  hideNextButton = false,
}: LockedCarContextStepProps) => {
  const provisionalBrandKey =
    config.brandKey || productEntry.brandParam || ""
  const { brands: catalogBrands, models, isLoading: isModelsQueryLoading } =
    useVehicleCatalog(provisionalBrandKey, "", "", productEntry.modelParam ?? "")
  const brandKey = useMemo(
    () =>
      resolveCatalogBrandKey(
        productEntry.brandParam,
        config.brandKey,
        catalogBrands,
      ),
    [catalogBrands, config.brandKey, productEntry.brandParam],
  )
  const catalogBrandKey = brandKey || provisionalBrandKey

  const modelResolution = useMemo(() => {
    if (!productEntry.modelParam || models.length === 0) {
      return { mode: "none" as const }
    }
    return resolveModelFamiliesFromParam(productEntry.modelParam, models)
  }, [productEntry.modelParam, models])

  const templateModelFamilyKey =
    modelResolution.mode === "single" ? modelResolution.family.key : ""
  const templateModelFamilyPrefix =
    modelResolution.mode === "prefix" ? modelResolution.prefix : ""

  const { templates, isLoading: isTemplatesQueryLoading } = useVehicleCatalog(
    catalogBrandKey,
    templateModelFamilyKey,
    templateModelFamilyPrefix,
  )
  const isLoading = isCatalogResolving({
    isModelsQueryLoading,
    modelsCount: models.length,
    isTemplatesQueryLoading,
    templatesCount: templates.length,
    hasTemplateQuery: Boolean(templateModelFamilyKey || templateModelFamilyPrefix),
  })
  const isModelCatalogResolved = modelResolution.mode !== "none"

  const onUpdateRef = useRef(onUpdate)
  onUpdateRef.current = onUpdate

  useEffect(() => {
    if (!brandKey || config.brandKey === brandKey) return
    const brand = catalogBrands.find((item) => item.key === brandKey)
    onUpdateRef.current({
      brandKey,
      ...(brand ? { brand: brand.name } : {}),
    })
  }, [brandKey, catalogBrands, config.brandKey])

  useEffect(() => {
    if (modelResolution.mode === "single") {
      if (
        config.modelFamilyKey === modelResolution.family.key &&
        config.model === modelResolution.displayName
      ) {
        return
      }
      onUpdateRef.current({
        model: modelResolution.displayName,
        modelFamilyKey: modelResolution.family.key,
      })
      return
    }

    if (modelResolution.mode === "prefix" && config.model !== modelResolution.displayName) {
      onUpdateRef.current({ model: modelResolution.displayName })
    }
  }, [modelResolution, config.modelFamilyKey, config.model])

  const brandLogo = useMemo(
    () =>
      resolveConfiguratorBrandImage({
        brand: config.brand,
        brandKey: config.brandKey || brandKey,
        brandParam: productEntry.brandParam,
      }),
    [brandKey, config.brand, config.brandKey, productEntry.brandParam],
  )

  const generations = useMemo(() => {
    const items = templates.map((template) => ({
      value: `${template.modelKey}|${template.generation}`,
      modelKey: template.modelKey,
      generation: template.generation,
      yearFrom: template.yearFrom,
      yearTo: template.yearTo,
    }))

    if (productEntry.generationParam) {
      const generationToken = normalizeToken(productEntry.generationParam)
      return items.filter(
        (item) =>
          normalizeToken(item.generation).includes(generationToken) ||
          generationToken.includes(normalizeToken(item.generation)),
      )
    }

    return [...new Map(items.map((item) => [item.value, item])).values()].sort(
      (left, right) => (right.yearFrom ?? 0) - (left.yearFrom ?? 0),
    )
  }, [templates, productEntry.generationParam])

  const selectedGeneration = generations.find(
    (item) =>
      item.modelKey === config.modelKey &&
      item.generation === config.generation,
  )

  const resolvedGeneration = useMemo(
    () =>
      resolveLockedCarGeneration({
        generations,
        selectedGeneration,
        modelResolution,
        modelParam: productEntry.modelParam,
        generationParam: productEntry.generationParam,
      }),
    [
      generations,
      selectedGeneration,
      modelResolution,
      productEntry.modelParam,
      productEntry.generationParam,
    ],
  )

  const availableYears = useMemo(
    () =>
      computeLockedCarAvailableYears({
        yearParam: productEntry.yearParam,
        generationParam: productEntry.generationParam,
        resolvedGeneration,
        templates,
      }),
    [
      resolvedGeneration,
      productEntry.yearParam,
      productEntry.generationParam,
      templates,
    ],
  )

  const matchingTemplates = templates.filter((template) => {
    if (!config.year) return false
    const year = Number(config.year)
    if (productEntry.generationParam && config.modelKey) {
      if (template.modelKey !== config.modelKey) return false
    }
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

  const activeTemplate = useMemo(
    () => templates.find((template) => template.recordKey === config.recordKey) ?? null,
    [templates, config.recordKey],
  )

  const vehicleDisplay = useMemo(() => {
    if (!activeTemplate) {
      return buildVehicleDisplayLabels({
        brandName: config.brand,
        modelFamilyName: config.model,
        modelFamilyKey: config.modelFamilyKey,
        modelKey: config.modelKey || config.model,
        generation: config.generation,
        yearFrom: resolvedGeneration?.yearFrom,
        yearTo: resolvedGeneration?.yearTo,
        bodyType: config.bodyType,
      })
    }

    return buildVehicleDisplayLabels({
      brandName: config.brand,
      modelFamilyName: config.model,
      modelFamilyKey: config.modelFamilyKey,
      modelKey: activeTemplate.modelKey,
      generation: activeTemplate.generation,
      yearFrom: activeTemplate.yearFrom,
      yearTo: activeTemplate.yearTo,
      isOpenEnded: activeTemplate.isOpenEnded,
      bodyType:
        activeTemplate.bodyTypes.find((item) => item.key === config.bodyTypeKey)?.label
        ?? config.bodyType,
    })
  }, [
    activeTemplate,
    config.brand,
    config.bodyType,
    config.bodyTypeKey,
    config.generation,
    config.model,
    config.modelFamilyKey,
    config.modelKey,
    resolvedGeneration?.yearFrom,
    resolvedGeneration?.yearTo,
  ])

  useEffect(() => {
    if (isLoading || !resolvedGeneration || config.modelKey) return
    onUpdateRef.current({
      modelKey: resolvedGeneration.modelKey,
      generation: resolvedGeneration.generation,
    })
  }, [isLoading, resolvedGeneration, config.modelKey])

  useEffect(() => {
    if (isLoading || generations.length !== 1 || config.modelKey) return
    const generation = generations[0]
    onUpdateRef.current({
      modelKey: generation.modelKey,
      generation: generation.generation,
    })
  }, [isLoading, generations, config.modelKey])

  useEffect(() => {
    if (config.year || isLoading || availableYears.length === 0) return
    if (!productEntry.yearParam) return

    const year = Number(productEntry.yearParam)
    if (!Number.isNaN(year) && availableYears.includes(year)) {
      onUpdateRef.current({ year: String(year) })
    }
  }, [productEntry.yearParam, config.year, availableYears, isLoading])

  useEffect(() => {
    if (!config.year || availableYears.length === 0) return
    const year = Number(config.year)
    if (availableYears.includes(year)) return

    onUpdateRef.current({
      year: "",
      bodyType: "",
      bodyTypeKey: "",
      recordKey: "",
      templateId: "",
      pricingCategoryKey: "",
    })
  }, [config.year, availableYears])

  useEffect(() => {
    if (!config.year || config.bodyTypeKey || bodyOptions.length === 0) return

    let resolved = bodyOptions.find(
      (option) =>
        productEntry.bodyTypeParam &&
        bodyTypeMatchesParam(option.bodyType, productEntry.bodyTypeParam),
    )

    if (!resolved && productEntry.bodyTypeParam) {
      resolved = bodyOptions.find(
        (option) =>
          option.bodyType.label.toLowerCase() ===
          productEntry.bodyTypeParam?.toLowerCase(),
      )
    }

    if (!resolved && bodyOptions.length === 1) {
      resolved = bodyOptions[0]
    }

    if (resolved) {
      onUpdateRef.current({
        bodyType: resolved.bodyType.displayLabel ?? resolved.bodyType.label,
        bodyTypeKey: resolved.bodyType.key,
        recordKey: resolved.template.recordKey,
        templateId: resolved.template.id,
        pricingCategoryKey: resolved.template.pricingCategoryKey,
      })
    }
  }, [
    bodyOptions,
    config.year,
    config.bodyTypeKey,
    productEntry.bodyTypeParam,
  ])

  const showYearSelect = !isLoading && availableYears.length > 0
  const needsManualBodyType =
    !isLoading && !!config.year && !config.bodyTypeKey && bodyOptions.length > 0

  const isStepComplete = Boolean(
    config.brand &&
      config.model &&
      config.year &&
      config.bodyTypeKey &&
      config.recordKey,
  )

  const handleYearChange = (year: string) => {
    onUpdate({
      year,
      bodyType: "",
      bodyTypeKey: "",
      recordKey: "",
      templateId: "",
      pricingCategoryKey: "",
    })
  }

  const handleBodyTypeChange = (value: string) => {
    const option = bodyOptions.find((item) => item.value === value)
    if (!option) return
    onUpdate({
      bodyType: option.bodyType.displayLabel ?? option.bodyType.label,
      bodyTypeKey: option.bodyType.key,
      recordKey: option.template.recordKey,
      templateId: option.template.id,
      pricingCategoryKey: option.template.pricingCategoryKey,
    })
  }

  const bodyTypeParamMismatch =
    !!config.year &&
    !!productEntry.bodyTypeParam &&
    bodyOptions.length > 0 &&
    !bodyOptions.some((option) =>
      bodyTypeMatchesParam(option.bodyType, productEntry.bodyTypeParam!),
    )

  const hintMessage = (() => {
    if (isLoading) return null
    if (showYearSelect && !config.year) {
      return vehicleDisplay.yearRangeDisplay
        ? `Wybierz rok produkcji z zakresu ${vehicleDisplay.yearRangeDisplay}`
        : "Wybierz rok produkcji z listy dostępnych roczników"
    }
    if (bodyTypeParamMismatch) {
      return `Typ nadwozia „${productEntry.bodyTypeParam}” nie jest dostępny dla wybranego rocznika — wybierz z listy`
    }
    if (needsManualBodyType) return "Wybierz typ nadwozia, aby kontynuować"
    if (
      !isStepComplete &&
      !isModelCatalogResolved &&
      !isLoading &&
      models.length > 0
    ) {
      return "Nie znaleźliśmy tego modelu w katalogu — sprawdź parametry wejścia"
    }
    return null
  })()

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-400 leading-relaxed">
        Konfigurujesz dywaniki dla wybranego modelu. Uzupełnij rok produkcji i typ
        nadwozia, aby dopasować szablon.
      </p>

      <div className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="relative w-12 h-12 bg-white/5 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
            {brandLogo ? (
              <Image
                src={brandLogo}
                alt={config.brand}
                fill
                className="object-contain p-1.5"
                sizes="48px"
                unoptimized={shouldServeBrandImageUnoptimized(brandLogo)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-red-400">
                <Car className="w-5 h-5" aria-hidden />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">
              Marka
            </p>
            <p className="text-white font-semibold">{config.brand}</p>
          </div>
        </div>

        <DetailRow
          label="Model"
          value={vehicleDisplay.modelDisplay || config.model}
          verified={isModelCatalogResolved}
        />
        {vehicleDisplay.generationNumberDisplay && (
          <DetailRow
            label="Generacja"
            value={vehicleDisplay.generationNumberDisplay}
            verified
          />
        )}
        {!config.year && vehicleDisplay.yearRangeDisplay && (
          <DetailRow
            label="Roczniki"
            value={vehicleDisplay.yearRangeDisplay}
            verified={!!resolvedGeneration}
          />
        )}
        {config.bodyTypeKey && !needsManualBodyType && (
          <DetailRow
            label="Typ nadwozia"
            value={vehicleDisplay.bodyTypeDisplay || config.bodyType}
            verified
          />
        )}
      </div>

      {isLoading && (
        <p className="text-xs text-gray-400 text-center">Ładowanie katalogu pojazdów…</p>
      )}

      {showYearSelect && (
        <div>
          <label
            htmlFor="locked-car-year"
            className="block text-sm font-medium text-gray-400 mb-2"
          >
            Rok produkcji *
          </label>
          <div className="relative">
            <select
              id="locked-car-year"
              value={config.year}
              onChange={(event) => handleYearChange(event.target.value)}
              className={selectClassName}
              aria-label="Wybierz rok produkcji"
            >
              <option value="">Wybierz rok</option>
              {availableYears.map((year) => (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-400">▼</span>
            </div>
          </div>
        </div>
      )}

      {needsManualBodyType && (
        <div>
          <label
            htmlFor="locked-car-body-type"
            className="block text-sm font-medium text-gray-400 mb-2"
          >
            Typ nadwozia *
          </label>
          <div className="relative">
            <select
              id="locked-car-body-type"
              value={
                config.recordKey && config.bodyTypeKey
                  ? `${config.recordKey}::${config.bodyTypeKey}`
                  : ""
              }
              onChange={(event) => handleBodyTypeChange(event.target.value)}
              className={selectClassName}
              aria-label="Wybierz typ nadwozia"
            >
              <option value="">Wybierz typ nadwozia</option>
              {bodyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.bodyType.displayLabel ?? option.bodyType.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-400">▼</span>
            </div>
          </div>
        </div>
      )}

      {(hintMessage || !hideNextButton) && (
        <div className="flex flex-col items-end gap-2 pt-2">
          {hintMessage && (
            <p className="text-xs text-gray-400 text-right">{hintMessage}</p>
          )}
          {!hideNextButton && (
            <Button
              type="button"
              onClick={onNext}
              disabled={!isStepComplete || isLoading}
              className="w-full sm:w-auto px-6 py-3 min-h-[44px] bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Dalej
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

const DetailRow = ({
  label,
  value,
  verified = false,
}: {
  label: string
  value: string
  verified?: boolean
}) => (
  <div className="flex items-center justify-between gap-3 py-2 border-t border-white/5 first:border-t-0 first:pt-0">
    <span className="text-xs text-gray-500">{label}</span>
    <span className="text-sm text-white font-medium text-right flex items-center gap-1.5">
      {verified && (
        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" aria-hidden />
      )}
      {value}
    </span>
  </div>
)
