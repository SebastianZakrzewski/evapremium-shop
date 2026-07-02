"use client"

import { useEffect, useMemo, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Car, CheckCircle2 } from "lucide-react"
import { normalizeBrandName } from "@/shared/brands"
import { useBrands } from "@/features/brands/hooks/useBrands"
import { useConfiguratorCarData } from "@/features/car-configurator"
import type { ProductEntryLock } from "@/features/car-configurator/utils/productEntryContext"

type LockedCarContextStepProps = {
  config: {
    brand: string
    model: string
    year: string
    bodyType: string
  }
  productEntry: ProductEntryLock
  onUpdate: (updates: {
    brand?: string
    model?: string
    year?: string
    bodyType?: string
  }) => void
  onNext: () => void
}

const mapBrandNameForApi = (brandName: string): string => {
  if (!brandName) return ""
  const normalized = normalizeBrandName(brandName.toLowerCase().trim())
  return normalized ?? brandName.charAt(0).toUpperCase() + brandName.slice(1)
}

const selectClassName =
  "w-full px-4 py-3 min-h-[44px] bg-[#111] border border-white/10 rounded-lg text-white text-sm appearance-none cursor-pointer focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"

export const LockedCarContextStep = ({
  config,
  productEntry,
  onUpdate,
  onNext,
}: LockedCarContextStepProps) => {
  const { brands } = useBrands()
  const brandApiName = mapBrandNameForApi(config.brand)

  const {
    models: apiModels,
    getYearsForModel,
    getYearsForGeneration,
    getBodyTypesForYear,
    isLoading: modelsLoading,
  } = useConfiguratorCarData({
    brandApiName,
    enabled: !!config.brand,
  })

  const brandLogo = useMemo(() => {
    if (!config.brand || !brands.length) return null
    const brand = brands.find(
      (b) => b.name.toLowerCase() === config.brand.toLowerCase()
    )
    return brand?.logo ?? null
  }, [config.brand, brands])

  const normalizedModel = useMemo(() => {
    if (!config.model || apiModels.length === 0) return config.model
    const found = apiModels.find(
      (m) => m.toLowerCase() === config.model.toLowerCase()
    )
    return found ?? config.model
  }, [config.model, apiModels])

  const availableYears = useMemo(() => {
    if (!normalizedModel) return []

    if (productEntry.generationParam) {
      const generationYears = getYearsForGeneration(
        normalizedModel,
        productEntry.generationParam
      )
      if (generationYears.length > 0) return generationYears
    }

    return getYearsForModel(normalizedModel)
  }, [
    normalizedModel,
    productEntry.generationParam,
    getYearsForGeneration,
    getYearsForModel,
  ])

  const availableBodyTypes = useMemo(() => {
    if (!normalizedModel || !config.year) return []
    const year = parseInt(config.year, 10)
    if (Number.isNaN(year)) return []
    return getBodyTypesForYear(normalizedModel, year)
  }, [normalizedModel, config.year, getBodyTypesForYear])

  const onUpdateRef = useRef(onUpdate)
  onUpdateRef.current = onUpdate

  useEffect(() => {
    if (!productEntry.isLocked || modelsLoading || !normalizedModel) return

    const updates: {
      model?: string
      bodyType?: string
    } = {}

    if (normalizedModel !== config.model) {
      updates.model = normalizedModel
    }

    if (config.year && !config.bodyType) {
      const yearNum = parseInt(config.year, 10)
      if (!Number.isNaN(yearNum)) {
        const bodyTypes = getBodyTypesForYear(normalizedModel, yearNum)
        let resolvedBodyType = productEntry.bodyTypeParam || ""

        if (resolvedBodyType) {
          const match = bodyTypes.find(
            (bt) => bt.toLowerCase() === resolvedBodyType.toLowerCase()
          )
          resolvedBodyType = match ?? ""
        } else if (bodyTypes.length === 1) {
          resolvedBodyType = bodyTypes[0]
        }

        if (resolvedBodyType) {
          updates.bodyType = resolvedBodyType
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      onUpdateRef.current(updates)
    }
  }, [
    productEntry.isLocked,
    productEntry.bodyTypeParam,
    modelsLoading,
    normalizedModel,
    config.model,
    config.year,
    config.bodyType,
    getBodyTypesForYear,
  ])

  const isStepComplete = !!(
    config.brand &&
    config.model &&
    config.year &&
    config.bodyType
  )

  const needsManualYear =
    !modelsLoading && !!normalizedModel && !config.year && availableYears.length > 0

  const needsManualBodyType =
    !modelsLoading &&
    !!config.year &&
    !config.bodyType &&
    availableBodyTypes.length > 0

  const generationLabel = productEntry.generationParam

  const handleYearChange = (year: string) => {
    onUpdate({ year, bodyType: "" })
  }

  const handleBodyTypeChange = (bodyType: string) => {
    onUpdate({ bodyType })
  }

  const hintMessage = (() => {
    if (modelsLoading) return null
    if (needsManualYear) {
      return generationLabel
        ? `Wybierz rok produkcji z generacji ${generationLabel}`
        : "Wybierz rok produkcji z listy dostępnych roczników"
    }
    if (needsManualBodyType) return "Wybierz typ nadwozia, aby kontynuować"
    if (!isStepComplete && !normalizedModel) {
      return "Nie znaleźliśmy tego modelu w bazie — wybierz inny model"
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

        <DetailRow label="Model" value={normalizedModel || config.model} />
        {config.year && !needsManualYear && (
          <DetailRow label="Rok produkcji" value={config.year} />
        )}
        {config.bodyType && !needsManualBodyType && (
          <DetailRow label="Typ nadwozia" value={config.bodyType} />
        )}
        {generationLabel && (
          <DetailRow label="Generacja" value={generationLabel} />
        )}
      </div>

      {modelsLoading && (
        <p className="text-xs text-gray-400 text-center">Ładowanie danych auta…</p>
      )}

      {needsManualYear && (
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
              onChange={(e) => handleYearChange(e.target.value)}
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
              value={config.bodyType}
              onChange={(e) => handleBodyTypeChange(e.target.value)}
              className={selectClassName}
              aria-label="Wybierz typ nadwozia"
            >
              <option value="">Wybierz typ nadwozia</option>
              {availableBodyTypes.map((bodyType) => (
                <option key={bodyType} value={bodyType}>
                  {bodyType}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-400">▼</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col items-end gap-2 pt-2">
        {hintMessage && (
          <p className="text-xs text-gray-400 text-right">{hintMessage}</p>
        )}
        <Button
          onClick={onNext}
          disabled={!isStepComplete || modelsLoading}
          className="w-full sm:w-auto px-6 py-3 min-h-[44px] bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          Dalej
        </Button>
      </div>
    </div>
  )
}

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-3 py-2 border-t border-white/5 first:border-t-0 first:pt-0">
    <span className="text-xs text-gray-500">{label}</span>
    <span className="text-sm text-white font-medium text-right flex items-center gap-1.5">
      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" aria-hidden />
      {value}
    </span>
  </div>
)
