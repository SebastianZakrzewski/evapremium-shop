"use client"

import { useEffect, useMemo, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Car, CheckCircle2 } from "lucide-react"
import { normalizeBrandName } from "@/shared/brands"
import { useBrands } from "@/features/brands/hooks/useBrands"
import { useConfiguratorCarData } from "@/features/car-configurator"
import {
  parseYearFromGeneration,
  type ProductEntryLock,
} from "@/features/car-configurator/utils/productEntryContext"

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
    getBodyTypesForYear,
    findCarDetailsByGeneration,
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

  const onUpdateRef = useRef(onUpdate)
  onUpdateRef.current = onUpdate

  useEffect(() => {
    if (!productEntry.isLocked || modelsLoading || !normalizedModel) return

    const updates: {
      model?: string
      year?: string
      bodyType?: string
    } = {}

    if (normalizedModel !== config.model) {
      updates.model = normalizedModel
    }

    let resolvedYear = productEntry.yearParam || config.year
    let resolvedBodyType = productEntry.bodyTypeParam || config.bodyType

    if (!resolvedYear && productEntry.generationParam) {
      const fromApi = findCarDetailsByGeneration(
        normalizedModel,
        productEntry.generationParam
      )
      if (fromApi) {
        resolvedYear = String(fromApi.year)
        if (!resolvedBodyType && fromApi.bodyType) {
          resolvedBodyType = fromApi.bodyType
        }
      } else {
        const parsedYear = parseYearFromGeneration(productEntry.generationParam)
        if (parsedYear) resolvedYear = String(parsedYear)
      }
    }

    if (!resolvedYear) {
      const years = getYearsForModel(normalizedModel)
      if (years.length > 0) {
        resolvedYear = String(years[0])
      }
    }

    if (resolvedYear && !resolvedBodyType) {
      const yearNum = parseInt(resolvedYear, 10)
      if (!Number.isNaN(yearNum)) {
        const bodyTypes = getBodyTypesForYear(normalizedModel, yearNum)
        if (bodyTypes.length === 1) {
          resolvedBodyType = bodyTypes[0]
        } else if (productEntry.bodyTypeParam) {
          const match = bodyTypes.find(
            (bt) =>
              bt.toLowerCase() === productEntry.bodyTypeParam?.toLowerCase()
          )
          if (match) resolvedBodyType = match
        }
      }
    }

    if (resolvedYear && resolvedYear !== config.year) {
      updates.year = resolvedYear
    }
    if (resolvedBodyType && resolvedBodyType !== config.bodyType) {
      updates.bodyType = resolvedBodyType
    }

    if (Object.keys(updates).length > 0) {
      onUpdateRef.current(updates)
    }
  }, [
    productEntry.isLocked,
    productEntry.yearParam,
    productEntry.bodyTypeParam,
    productEntry.generationParam,
    modelsLoading,
    normalizedModel,
    config.model,
    config.year,
    config.bodyType,
    findCarDetailsByGeneration,
    getYearsForModel,
    getBodyTypesForYear,
  ])

  const isStepComplete = !!(
    config.brand &&
    config.model &&
    config.year &&
    config.bodyType
  )

  const generationLabel = productEntry.generationParam

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-400 leading-relaxed">
        Konfigurujesz dywaniki dla wybranego modelu z katalogu. Dane pojazdu są
        ustawione automatycznie.
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
        {config.year && <DetailRow label="Rok produkcji" value={config.year} />}
        {config.bodyType && (
          <DetailRow label="Typ nadwozia" value={config.bodyType} />
        )}
        {generationLabel && (
          <DetailRow label="Generacja" value={generationLabel} />
        )}
      </div>

      {modelsLoading && (
        <p className="text-xs text-gray-400 text-center">Ładowanie danych auta…</p>
      )}

      <div className="flex flex-col items-end gap-2 pt-2">
        {!isStepComplete && !modelsLoading && (
          <p className="text-xs text-gray-400 text-right">
            Uzupełniamy dane pojazdu na podstawie wybranego produktu…
          </p>
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
