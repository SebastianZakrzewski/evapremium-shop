"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCart } from "@/features/shopping-cart/hooks/useCart"
import { openCartModal } from "@/features/shopping-cart/utils/openCartModal"
import { useAccessories } from "@/features/accessories/hooks/useAccessories"
import { useBrands } from "@/features/brands/hooks/useBrands"
import { useMatModelPreviews } from "@/features/mat-model-previews"
import {
  isMatRealizationMatType,
  useMatRealizationPhotos,
} from "@/features/mat-realization-photos"
import { useConfiguratorState } from "@/features/car-configurator/hooks/useConfiguratorState"
import { getProductEntryLock } from "@/features/car-configurator/utils/productEntryContext"
import { useResolvedPricing } from "@/features/vehicle-catalog/hooks/useResolvedPricing"
import { reconcileVariantWithOfferedKeys } from "@/features/vehicle-catalog/domain/reconcileVariantWithOfferedKeys"
import { mapConfiguratorV2Sections } from "@/features/car-configurator/adapters/configuratorV2SectionMapper"
import {
  getPodpietkaMountingFee,
  getPodpietkaTotalPrice,
} from "@/features/car-configurator/domain/podpietkaMounting"
import { resolvePersistedMatSetVariantLabel } from "@/shared/mat-set-labels"
import { formatBrandDisplayName } from "@/shared/vehicle/displayLabels"
import { getBrandLogo, normalizeBrandName } from "@/shared/brands"
import { getMatImagePath } from "@/lib/image-mapping"
import { getMatTypeForDynamicPreview } from "@/components/configurator/configurator-simple/rugPreviewConfig"
import { ConfiguratorLoader } from "@/components/configurator/configurator-simple/ConfiguratorLoader"
import { CarSelectionStep } from "@/components/configurator/configurator-simple/CarSelectionStep"
import { LockedCarContextStep } from "@/components/configurator/configurator-simple/LockedCarContextStep"
import { AccessoriesStep } from "@/components/configurator/configurator-simple/AccessoriesStep"
import { getVariantPresentation } from "@/components/configurator/configurator-simple/variantPresentation"
import { matTypeOptions } from "@/components/configurator/configurator-v2/mat-type/matTypePresentation"
import { cellStructureOptions } from "@/components/configurator/configurator-v2/structure/cellStructurePresentation"
import { getMaterialColorIconSrc } from "@/components/configurator/configurator-v2/material-color/materialColorIcons"
import { getEdgeColorIconSrc } from "@/components/configurator/configurator-v2/edge-color/edgeColorIcons"
import { buildMatCartPayload } from "@/components/configurator/configurator-v2/steps/buildMatCartPayload"
import { explainConfigurationReset } from "@/components/configurator/configurator-v2/steps/explainConfigurationReset"
import { CompareMatTypesModal } from "@/components/configurator/configurator-v2/modals/CompareMatTypesModal"
import { CompareVariantsModal } from "@/components/configurator/configurator-v2/modals/CompareVariantsModal"
import { VariantTunnelBonusNotice } from "@/components/configurator/configurator-v2/variant/VariantTunnelBonusNotice"
import { shouldShowVariantTunnelBonus } from "@/components/configurator/configurator-v2/variant/variantTunnelBonus"
import { VariantTrunkMatRimNotice } from "@/components/configurator/configurator-v2/variant/VariantTrunkMatRimNotice"
import { shouldShowVariantTrunkMatRimNotice } from "@/components/configurator/configurator-v2/variant/trunkMatRimNotice"
import {
  getAvailableColors,
  getAvailableMaterialColorsForEdge,
  getColorInfo,
} from "@/lib/color-mapping"
import { formatPricePln } from "@/lib/utils/formatPrice"
import { createViewContentData, trackViewContent } from "@/lib/tracking/events"
import type { ConfiguratorState } from "@/features/car-configurator/utils/configuratorState"
import { accessoryAlreadyInCart, findMatchingMatInCart } from "./cart/matAlreadyInCart"
import {
  CONFIGURATOR_STEP_BY_SECTION,
  trackConfiguratorSectionView,
  trackConfiguratorStepComplete,
  type ConfiguratorAnalyticsStep,
} from "./analytics/configuratorAnalytics"
import { filterPreviewsForBodyType } from "./preview/filterPreviewsForBodyType"
import { preloadPinnedImage, TeslaPinnedGallery, type GallerySlide } from "./preview/TeslaPinnedGallery"
import { isMarketingConfiguratorImage } from "./preview/isMarketingConfiguratorImage"
import {
  DEFAULT_MAT_IMAGE,
  resolvePerColorMatImage,
} from "./preview/resolvePinnedMatImage"
import { TESLA_LAYOUT } from "./tokens"
import { TeslaRoundPicker } from "./ui/TeslaRoundPicker"
import { TeslaSection } from "./ui/TeslaSection"
import { TeslaPriceSheet } from "./ui/TeslaPriceSheet"
import { TeslaStickyBar } from "./ui/TeslaStickyBar"
import { TeslaTextCard } from "./ui/TeslaTextCard"
import { alignCarSummary, scrollBehaviorForMotion } from "./scroll/alignCarSummary"
import { TeslaTrustRow } from "./ui/TeslaTrustRow"

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" })
}

export default function TeslaConfigurator() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { addToCart, isLoading: cartLoading, items: cartItems } = useCart()
  const { accessories } = useAccessories()
  const { brands, isLoading: brandsLoading } = useBrands()
  const { config, updateConfig, hydrated } = useConfiguratorState({
    searchParams,
    brands,
    storageKey: "configurator-v2-state",
  })
  const productEntry = useMemo(() => getProductEntryLock(searchParams), [searchParams])
  const brandForImage = useMemo(() => {
    const brandSlug = searchParams.get("brand") || config.brand.toLowerCase()
    return normalizeBrandName(brandSlug) || brandSlug
  }, [config.brand, searchParams])

  const realizationMatType = isMatRealizationMatType(config.matType) ? config.matType : undefined
  const { photos: realizationPhotos } = useMatRealizationPhotos({
    recordKey: config.recordKey || undefined,
    brandKey: config.brandKey || undefined,
    modelKey: config.modelKey || config.model || undefined,
    matType: realizationMatType,
    enabled: !!(config.brand && config.model && realizationMatType),
  })
  const { previews: modelPreviews } = useMatModelPreviews({
    recordKey: config.recordKey || undefined,
    brandKey: config.brandKey || undefined,
    modelKey: config.modelKey || config.model || undefined,
    bodyTypeKey: config.bodyTypeKey || config.bodyType || undefined,
    enabled: !!(config.modelKey || config.recordKey || (config.brand && config.model)),
  })
  const pricingQuery = useResolvedPricing({
    recordKey: config.recordKey || undefined,
    year: config.year ? Number(config.year) : undefined,
    bodyTypeKey: config.bodyTypeKey || undefined,
    matType: config.matType,
    variantKey: config.variant || undefined,
  })

  const [editingCar, setEditingCar] = useState(false)
  const [alignZestaw, setAlignZestaw] = useState(false)
  const [matInView, setMatInView] = useState(false)
  const [resetNotice, setResetNotice] = useState<string | null>(null)
  const [priceOpen, setPriceOpen] = useState(false)
  const [compareTypes, setCompareTypes] = useState(false)
  const [compareVariants, setCompareVariants] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [cartError, setCartError] = useState<string | null>(null)
  const [appearanceTouched, setAppearanceTouched] = useState(false)
  const previousConfig = useRef(config)
  const sawHydrated = useRef(false)
  const vehicleWasComplete = useRef<boolean | null>(null)
  const editBaseline = useRef<string | null>(null)
  const completedSteps = useRef(new Set<ConfiguratorAnalyticsStep>())
  const viewedContentKey = useRef<string | null>(null)

  const pricingVariants = pricingQuery.data?.variants ?? []
  const availableMatTypes = pricingQuery.data?.availableMatTypes ?? []
  const skipMatTypeStep = availableMatTypes.length === 1

  useEffect(() => {
    const pricing = pricingQuery.data
    if (!pricing) return
    const updates: Partial<ConfiguratorState> = {}
    const nextMatType = pricing.availableMatTypes?.[0]
    if (pricing.availableMatTypes?.length === 1 && nextMatType && config.matType !== nextMatType) {
      updates.matType = nextMatType
    } else if (
      config.matType &&
      pricing.availableMatTypes?.length &&
      !pricing.availableMatTypes.includes(config.matType)
    ) {
      updates.matType = nextMatType
      updates.variant = ""
    }
    if (config.pricingCategoryKey !== pricing.pricingCategoryKey) {
      updates.pricingCategoryKey = pricing.pricingCategoryKey
    }
    if (config.catalogVersionCode !== pricing.catalogVersionCode) {
      updates.catalogVersionCode = pricing.catalogVersionCode
    }
    if (Object.keys(updates).length > 0) updateConfig(updates)
  }, [
    pricingQuery.data,
    config.matType,
    config.pricingCategoryKey,
    config.catalogVersionCode,
    updateConfig,
  ])

  useEffect(() => {
    if (!pricingQuery.isSuccess || pricingQuery.isFetching || !pricingQuery.data) return
    const offered = pricingQuery.data.variants.map((variant) => variant.key)
    if (offered.length === 0 || !config.variant) return
    const reconciled = reconcileVariantWithOfferedKeys(config.variant, offered)
    if (!reconciled.cleared) return
    updateConfig({ variant: "" })
  }, [
    config.variant,
    pricingQuery.data,
    pricingQuery.isFetching,
    pricingQuery.isSuccess,
    updateConfig,
  ])

  useEffect(() => {
    if (!hydrated) {
      previousConfig.current = config
      return
    }
    if (!sawHydrated.current) {
      sawHydrated.current = true
      previousConfig.current = config
      return
    }
    const message = explainConfigurationReset(previousConfig.current, config)
    previousConfig.current = config
    if (message) setResetNotice(message)
  }, [config, hydrated])

  const selectedVariant = pricingQuery.data?.selectedVariant
  const priceBreakdown = useMemo(() => {
    if (!config.variant || !selectedVariant) {
      return { basePrice: 0, discount: 0, priceAfterDiscount: 0, totalPrice: 0 }
    }
    return {
      basePrice: selectedVariant.basePrice,
      discount: selectedVariant.discount,
      priceAfterDiscount: selectedVariant.priceAfterDiscount,
      totalPrice: selectedVariant.priceAfterDiscount,
    }
  }, [config.variant, selectedVariant])

  const selectedPodpietka = useMemo(() => {
    if (!config.selectedPodpietka) return null
    return accessories.find((item) => item.id === config.selectedPodpietka) ?? null
  }, [accessories, config.selectedPodpietka])
  const accessoryPrice = selectedPodpietka
    ? getPodpietkaTotalPrice(selectedPodpietka.price, config.podpietkaMounting)
    : 0
  const accessoryMountingFee = getPodpietkaMountingFee(config.podpietkaMounting)

  const mapperResult = useMemo(
    () =>
      mapConfiguratorV2Sections({
        config,
        skipMatTypeStep,
        totalPrice: priceBreakdown.totalPrice,
        variantPricingLabel: selectedVariant?.label,
      }),
    [config, skipMatTypeStep, priceBreakdown.totalPrice, selectedVariant?.label],
  )

  const writeEtap = useCallback(
    (etap: number) => {
      const params = new URLSearchParams(searchParams.toString())
      if (params.get("etap") === String(etap)) return
      params.set("etap", String(etap))
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  const markStep = useCallback(
    (step: ConfiguratorAnalyticsStep) => {
      if (completedSteps.current.has(step)) return
      completedSteps.current.add(step)
      trackConfiguratorStepComplete(step)
      writeEtap(CONFIGURATOR_STEP_BY_SECTION[step].etap)
    },
    [writeEtap],
  )

  useEffect(() => {
    if (!hydrated) return
    if (mapperResult.sections.vehicle.isComplete) markStep("vehicle")
    if (mapperResult.sections.matType.isComplete && mapperResult.sections.variant.isComplete) {
      markStep("variant")
    }
    if (
      appearanceTouched &&
      mapperResult.sections.structure.isComplete &&
      mapperResult.sections.color.isComplete &&
      mapperResult.sections.edgeColor.isComplete
    ) {
      markStep("appearance")
    }
    if (config.selectedPodpietka) markStep("accessories")
  }, [appearanceTouched, config.selectedPodpietka, hydrated, mapperResult.sections, markStep])

  useEffect(() => {
    if (!hydrated || !mapperResult.isReadyForCart || priceBreakdown.totalPrice <= 0) return
    const year = config.year || "all"
    const key = `${config.brand}_${config.model}_${year}_${config.matType}_${config.variant}_${config.structure}_${config.color}_${config.edgeColor}`
    if (viewedContentKey.current === key) return
    try {
      if (window.sessionStorage.getItem(`viewcontent_${key}`)) {
        viewedContentKey.current = key
        return
      }
      window.sessionStorage.setItem(`viewcontent_${key}`, Date.now().toString())
    } catch {
      // Still send the event when storage is blocked.
    }
    viewedContentKey.current = key
    trackViewContent(
      createViewContentData(
        {
          id: `${config.brand}-${config.model}-${year}-${config.matType}-${config.variant}`,
          name: `Dywaniki EVA Premium - ${formatBrandDisplayName(config.brand)} ${config.model}`,
          sku: `EVA-${config.matType}-${config.structure}-${config.color}-${config.edgeColor}`,
          price: priceBreakdown.totalPrice,
          brand: config.brand,
          category: "car_mats",
          configuration: {
            setType: config.matType,
            cellType: config.structure,
            setVariant: config.variant,
            materialColor: config.color,
            edgeColor: config.edgeColor,
            heelPad: config.heelPad,
            carDetails: {
              brand: config.brand,
              model: config.model,
              year,
              bodyType: config.bodyType || "universal",
            },
          },
        },
        priceBreakdown.totalPrice,
      ),
    )
  }, [config, hydrated, mapperResult.isReadyForCart, priceBreakdown.totalPrice])

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-configurator-section]")
    if (nodes.length === 0) return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || entry.intersectionRatio < TESLA_LAYOUT.sectionViewThreshold) {
            continue
          }
          const element = entry.target as HTMLElement
          trackConfiguratorSectionView({
            sectionId: element.id,
            sectionName: element.dataset.sectionName ?? element.id,
            etap: Number(element.dataset.etap ?? "1"),
          })
        }
      },
      { threshold: [0, TESLA_LAYOUT.sectionViewThreshold, 0.6] },
    )
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [hydrated, editingCar, mapperResult.sections.vehicle.isComplete])

  useEffect(() => {
    const update = () => {
      const zest = document.getElementById("section-zestaw")
      if (!zest) return
      const offset = Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--configurator-header-offset"),
      )
      const pinBottom = (Number.isFinite(offset) ? offset : 64) + TESLA_LAYOUT.imageAspectHeight
      const top = zest.getBoundingClientRect().top
      setMatInView(top <= pinBottom + 12)
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [hydrated])

  const bodyMatchedPreviews = useMemo(
    () =>
      filterPreviewsForBodyType(modelPreviews, config.bodyTypeKey).filter(
        (preview) => !isMarketingConfiguratorImage(preview.image_url),
      ),
    [config.bodyTypeKey, modelPreviews],
  )
  const offeredVariantKeys = pricingVariants.map((variant) => variant.key)
  const dynamicMatType = getMatTypeForDynamicPreview(config.matType, config.pricingCategoryKey)
  const neutralMatUrl = DEFAULT_MAT_IMAGE
  const explicitPerColorUrl = resolvePerColorMatImage({
    matType: config.matType,
    structure: config.structure,
    color: config.color,
    edgeColor: config.edgeColor,
  })
  const colorCandidate =
    explicitPerColorUrl ||
    getMatImagePath(dynamicMatType, config.structure, config.color, config.edgeColor)
  const [loadedColorUrl, setLoadedColorUrl] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    void preloadPinnedImage(colorCandidate).then((ready) => {
      if (!cancelled && ready) setLoadedColorUrl(colorCandidate)
    })
    return () => {
      cancelled = true
    }
  }, [colorCandidate])
  const inCarUrl = realizationPhotos.find(
    (photo) => !isMarketingConfiguratorImage(photo.image_url),
  )?.image_url
  const modelPreviewUrl = [...bodyMatchedPreviews].sort((left, right) => {
    if (left.is_primary !== right.is_primary) return left.is_primary ? -1 : 1
    return left.sort_order - right.sort_order
  })[0]?.image_url
  const pinnedMatUrl = inCarUrl || loadedColorUrl || modelPreviewUrl || DEFAULT_MAT_IMAGE

  const carSlides = useMemo(() => {
    const items: GallerySlide[] = []
    const seen = new Set<string>()
    const push = (slide: GallerySlide) => {
      if (!slide.src || seen.has(slide.src) || isMarketingConfiguratorImage(slide.src)) return
      seen.add(slide.src)
      items.push(slide)
    }
    const ordered = [...bodyMatchedPreviews].sort((left, right) => {
      if (left.is_primary !== right.is_primary) return left.is_primary ? -1 : 1
      return left.sort_order - right.sort_order
    })
    ordered.forEach((preview) => {
      push({
        id: `car-${preview.id}`,
        src: preview.image_url,
        alt: preview.alt_text ?? "Podgląd modelu",
        group: "car",
      })
    })
    if (items.length === 0 && config.brand) {
      const logo = getBrandLogo(brandForImage)
      if (logo && !isMarketingConfiguratorImage(logo)) {
        push({ id: "car-brand", src: logo, alt: config.brand, group: "car" })
      }
    }
    if (items.length === 0) {
      push({ id: "car-neutral", src: neutralMatUrl, alt: "Dywaniki EVA Premium", group: "car" })
    }
    return items
  }, [bodyMatchedPreviews, brandForImage, config.brand, neutralMatUrl])

  const matSlides = useMemo(() => {
    const items: GallerySlide[] = []
    const seen = new Set<string>()
    const push = (slide: GallerySlide) => {
      if (!slide.src || seen.has(slide.src) || isMarketingConfiguratorImage(slide.src)) return
      seen.add(slide.src)
      items.push(slide)
    }
    push({ id: "mat-active", src: pinnedMatUrl, alt: "Podgląd dywaników", group: "mat" })
    if (neutralMatUrl !== pinnedMatUrl) {
      push({ id: "mat-neutral", src: neutralMatUrl, alt: "Dywanik", group: "mat" })
    }
    const modelSlide = carSlides.find((slide) => slide.id.startsWith("car-") && slide.id !== "car-brand" && slide.id !== "car-neutral")
    if (modelSlide) push({ ...modelSlide, id: "mat-model", group: "mat" })
    return items
  }, [carSlides, neutralMatUrl, pinnedMatUrl])

  const vehicleReady = mapperResult.sections.vehicle.isComplete
  useEffect(() => {
    if (!vehicleReady) return undefined
    const materials = getAvailableColors(config.structure, "material")
    const edges = getAvailableColors(config.structure, "border")
    const urls = [
      getMatImagePath(dynamicMatType, config.structure, config.color || "black", config.edgeColor || "black"),
    ]
    for (const color of materials) {
      urls.push(getMatImagePath(dynamicMatType, config.structure, color, config.edgeColor || "black"))
    }
    for (const edge of edges) {
      urls.push(getMatImagePath(dynamicMatType, config.structure, config.color || "black", edge))
    }
    let cancelled = false
    const unique = [...new Set(urls)]
    void (async () => {
      for (const src of unique) {
        if (cancelled) return
        await preloadPinnedImage(src)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [vehicleReady, dynamicMatType, config.structure, config.color, config.edgeColor])
  const showCarForm = !vehicleReady || editingCar
  const vehicleSignature = [
    config.brand,
    config.model,
    config.year,
    config.gearbox,
    config.bodyType,
    config.recordKey,
  ].join("|")

  useEffect(() => {
    if (!hydrated) return
    if (vehicleWasComplete.current === null) {
      vehicleWasComplete.current = vehicleReady
      return
    }
    const becameComplete = !vehicleWasComplete.current && vehicleReady
    vehicleWasComplete.current = vehicleReady
    if (!becameComplete) return
    setEditingCar(false)
    setAlignZestaw(true)
  }, [hydrated, vehicleReady])

  useEffect(() => {
    if (!editingCar) {
      editBaseline.current = null
      return
    }
    if (editBaseline.current === null) {
      editBaseline.current = vehicleSignature
      return
    }
    if (!vehicleReady || editBaseline.current === vehicleSignature) return
    editBaseline.current = vehicleSignature
    setEditingCar(false)
    setAlignZestaw(true)
  }, [editingCar, vehicleReady, vehicleSignature])

  useEffect(() => {
    if (!alignZestaw || showCarForm) return undefined
    let inner = 0
    const frame = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        alignCarSummary(scrollBehaviorForMotion())
        setAlignZestaw(false)
      })
    })
    return () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(inner)
    }
  }, [alignZestaw, showCarForm])
  const summaryLine = [
    formatBrandDisplayName(config.brand),
    config.model,
    config.generation,
    config.bodyType,
    config.year ? `${config.year}–` : "",
  ]
    .filter(Boolean)
    .join(" ")

  const firstMissing = useMemo(() => {
    if (!mapperResult.sections.vehicle.isComplete) {
      return { id: "section-vehicle", hint: "Wybierz markę, model, rocznik, skrzynię i typ nadwozia." }
    }
    if (!mapperResult.sections.matType.isComplete) {
      return { id: "section-matType", hint: "Wybierz typ dywanika." }
    }
    if (!mapperResult.sections.variant.isComplete) {
      return { id: "section-zestaw", hint: "Wybierz wariant zestawu." }
    }
    if (!mapperResult.sections.structure.isComplete) {
      return { id: "section-structure", hint: "Wybierz strukturę komórek." }
    }
    if (!mapperResult.sections.color.isComplete) {
      return { id: "section-color", hint: "Wybierz kolor dywanika." }
    }
    if (!mapperResult.sections.edgeColor.isComplete) {
      return { id: "section-edge", hint: "Wybierz kolor obszycia." }
    }
    return null
  }, [mapperResult.sections])

  const handleAddToCart = useCallback(async () => {
    if (!mapperResult.isReadyForCart || firstMissing) {
      if (firstMissing) scrollToSection(firstMissing.id)
      return
    }
    if (findMatchingMatInCart(cartItems, config)) {
      openCartModal()
      return
    }
    setCartError(null)
    setIsAdding(true)
    markStep("appearance")
    markStep("accessories")
    markStep("summary")
    try {
      const matTypeForImage = getMatTypeForDynamicPreview(config.matType, config.pricingCategoryKey)
      const setVariantLabel = resolvePersistedMatSetVariantLabel({
        setType: config.matType,
        setVariant: config.variant,
        pricingCategoryKey: config.pricingCategoryKey,
        bodyTypeKey: config.bodyTypeKey,
        pricingLabel: selectedVariant?.label,
      })
      await addToCart(
        buildMatCartPayload({
          config,
          price: {
            basePrice: priceBreakdown.basePrice,
            priceAfterDiscount: priceBreakdown.priceAfterDiscount,
            totalPrice: priceBreakdown.totalPrice,
          },
          productId: crypto.randomUUID(),
          productImage: getMatImagePath(
            matTypeForImage,
            config.structure,
            config.color,
            config.edgeColor,
          ),
          setVariantLabel,
        }),
      )
      if (
        config.selectedPodpietka &&
        selectedPodpietka &&
        !accessoryAlreadyInCart(
          cartItems,
          selectedPodpietka.id,
          config.podpietkaColor,
          config.podpietkaMounting,
        )
      ) {
        await addToCart({
          productType: "accessory",
          productId: selectedPodpietka.id,
          quantity: 1,
          unitPrice: getPodpietkaTotalPrice(selectedPodpietka.price, config.podpietkaMounting),
          productName: `${selectedPodpietka.name}${config.podpietkaColor ? ` - ${config.podpietkaColor}` : ""}`,
          productSku: selectedPodpietka.sku,
          productImage: selectedPodpietka.images?.[0] ?? selectedPodpietka.imageSrc ?? "",
          configuration: {
            color: config.podpietkaColor || undefined,
            mounting: config.podpietkaMounting,
          },
        })
      }
      openCartModal()
    } catch (error) {
      setCartError(error instanceof Error ? error.message : "Nie udało się dodać produktu do koszyka")
    } finally {
      setIsAdding(false)
    }
  }, [
    addToCart,
    cartItems,
    config,
    firstMissing,
    mapperResult.isReadyForCart,
    markStep,
    priceBreakdown,
    selectedPodpietka,
    selectedVariant?.label,
  ])

  const materialColors = useMemo(
    () => getAvailableColors(config.structure, "material"),
    [config.structure],
  )
  const edgeColors = useMemo(
    () => getAvailableColors(config.structure, "border"),
    [config.structure],
  )

  const total = priceBreakdown.totalPrice + accessoryPrice
  const configurationInCart = findMatchingMatInCart(cartItems, config) != null
  const showPriceBar = vehicleReady && total > 0

  useEffect(() => {
    document.documentElement.dataset.configuratorOverlay = priceOpen ? "open" : ""
    document.documentElement.dataset.configuratorBar = showPriceBar ? "open" : ""
    return () => {
      document.documentElement.dataset.configuratorOverlay = ""
      document.documentElement.dataset.configuratorBar = ""
    }
  }, [priceOpen, showPriceBar])

  if ((brandsLoading && !config.brand) || !hydrated) {
    return <ConfiguratorLoader />
  }

  const sticky = (
    <TeslaStickyBar
      total={total}
      disabled={!mapperResult.isReadyForCart && !configurationInCart}
      hint={showPriceBar && firstMissing ? firstMissing.hint : null}
      pending={isAdding || cartLoading}
      inCart={configurationInCart}
      onPriceClick={() => setPriceOpen(true)}
      onAddToCart={() => {
        void handleAddToCart()
      }}
    />
  )

  const carSummary = vehicleReady && !showCarForm ? (
    <div
      id="configurator-car-summary"
      className="flex items-center justify-between gap-3 border-b"
      style={{
        padding: `8px 0`,
        borderColor: TESLA_LAYOUT.border,
      }}
    >
      <p className="min-w-0 truncate font-medium" style={{ fontSize: TESLA_LAYOUT.bodySize }}>
        {summaryLine}
      </p>
      <button
        type="button"
        className="shrink-0 underline"
        style={{ fontSize: TESLA_LAYOUT.bodySize }}
        onClick={() => {
          setEditingCar(true)
          scrollToSection("section-vehicle")
        }}
      >
        Zmień
      </button>
    </div>
  ) : null

  return (
    <div className="bg-white text-[#171a20]" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
      <div className="lg:grid lg:h-svh lg:grid-cols-[minmax(0,1fr)_minmax(22rem,34rem)] lg:overflow-hidden">
        <div className="bg-white lg:flex lg:h-svh lg:items-center lg:bg-[#f5f5f5]">
          <div
            className="w-full max-lg:fixed max-lg:inset-x-0 max-lg:z-20 max-lg:bg-white"
            style={{ top: "var(--configurator-header-offset, 0px)" }}
          >
            <TeslaPinnedGallery
              slides={matInView ? matSlides : carSlides}
              preferredId={matInView ? "mat-active" : (carSlides[0]?.id ?? null)}
              resetKey={`${matInView ? "mat" : "car"}:${pinnedMatUrl}`}
            />
          </div>
          <div
            className="lg:hidden"
            style={{ height: TESLA_LAYOUT.imageAspectHeight }}
            aria-hidden
          />
        </div>

        <div className="lg:flex lg:h-svh lg:min-h-0 lg:flex-col">
        <div
          id="configurator-options"
          className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto"
          style={{
            overflowAnchor: "none",
            padding: showPriceBar
              ? `0 ${TESLA_LAYOUT.pagePaddingX}px calc(${TESLA_LAYOUT.stickyBarMinHeight}px + env(safe-area-inset-bottom) + 16px)`
              : `0 ${TESLA_LAYOUT.pagePaddingX}px calc(24px + env(safe-area-inset-bottom))`,
          }}
        >
          {carSummary}
          <div id="section-vehicle">
            {showCarForm ? (
              <TeslaSection id="section-vehicle-fields" title="Wybór samochodu" etap={1}>
                {productEntry.isLocked ? (
                  <LockedCarContextStep
                    config={config}
                    productEntry={productEntry}
                    onUpdate={updateConfig}
                    onNext={() => setEditingCar(false)}
                    hideNextButton
                    surface="light"
                  />
                ) : (
                  <CarSelectionStep
                    config={config}
                    onUpdate={updateConfig}
                    onNext={() => setEditingCar(false)}
                    hideNextButton
                    surface="light"
                  />
                )}
              </TeslaSection>
            ) : null}
          </div>

          <TeslaSection id="section-zestaw" title="Zestaw" etap={2} tight>
            {resetNotice ? (
              <p role="status" className="mb-3" style={{ fontSize: TESLA_LAYOUT.captionSize, color: TESLA_LAYOUT.text }}>
                {resetNotice}
              </p>
            ) : null}
            <div className="flex flex-col" style={{ gap: TESLA_LAYOUT.cardGap }}>
              {pricingVariants.map((variant) => {
                const presentation = getVariantPresentation(
                  variant.key,
                  config.pricingCategoryKey,
                  config.bodyTypeKey,
                  { offeredVariantKeys },
                )
                return (
                  <TeslaTextCard
                    key={variant.key}
                    selected={config.variant === variant.key}
                    title={presentation.name ?? variant.label}
                    detail={presentation.description}
                    priceLabel={formatPricePln(variant.priceAfterDiscount)}
                    disabled={mapperResult.sections.variant.isDisabled}
                    onSelect={() => {
                      setResetNotice(null)
                      updateConfig({ variant: variant.key })
                    }}
                  />
                )
              })}
            </div>
            {pricingVariants.length === 0 ? (
              <p style={{ fontSize: TESLA_LAYOUT.captionSize, color: TESLA_LAYOUT.muted }}>
                Wybierz samochód, aby zobaczyć zestawy.
              </p>
            ) : null}
            <button
              type="button"
              className="mt-3 underline"
              style={{ fontSize: TESLA_LAYOUT.captionSize }}
              onClick={() => setCompareVariants(true)}
            >
              Porównaj warianty
            </button>
            {shouldShowVariantTrunkMatRimNotice({ matType: config.matType, variantKey: config.variant }) ? (
              <VariantTrunkMatRimNotice />
            ) : null}
            {shouldShowVariantTunnelBonus(config.pricingCategoryKey) && pricingVariants.length > 0 ? (
              <VariantTunnelBonusNotice />
            ) : null}
          </TeslaSection>

          {!skipMatTypeStep ? (
            <TeslaSection id="section-matType" title="Typ dywanika" etap={2}>
              <div className="flex flex-col" style={{ gap: TESLA_LAYOUT.cardGap }}>
                {matTypeOptions
                  .filter((type) => !availableMatTypes.length || availableMatTypes.includes(type.id))
                  .map((type) => (
                    <TeslaTextCard
                      key={type.id}
                      selected={config.matType === type.id}
                      title={type.name}
                      detail={type.description}
                      priceLabel="W zestawie"
                      disabled={mapperResult.sections.matType.isDisabled}
                      onSelect={() => {
                        updateConfig({ matType: type.id, variant: "" })
                      }}
                    />
                  ))}
              </div>
              <button
                type="button"
                className="mt-3 underline"
                style={{ fontSize: TESLA_LAYOUT.captionSize }}
                onClick={() => setCompareTypes(true)}
              >
                Wyświetl i porównaj funkcje
              </button>
            </TeslaSection>
          ) : null}

          <TeslaSection id="section-color" title="Kolor dywanika" etap={3}>
            <TeslaRoundPicker
              selectedName={config.color ? getColorInfo(config.color).name : "Wybierz kolor"}
              priceLabel="W zestawie"
              selectedId={config.color}
              disabled={mapperResult.sections.color.isDisabled}
              options={materialColors.map((colorKey) => ({
                id: colorKey,
                label: getColorInfo(colorKey).name,
                color: getColorInfo(colorKey).color,
                imageSrc: getMaterialColorIconSrc(colorKey),
              }))}
              onSelect={(color) => {
                setAppearanceTouched(true)
                updateConfig({ color })
              }}
            />
          </TeslaSection>

          <TeslaSection id="section-edge" title="Kolor obszycia" etap={3}>
            <TeslaRoundPicker
              selectedName={config.edgeColor ? getColorInfo(config.edgeColor).name : "Wybierz obszycie"}
              priceLabel="W zestawie"
              selectedId={config.edgeColor}
              disabled={mapperResult.sections.edgeColor.isDisabled}
              options={edgeColors.map((colorKey) => ({
                id: colorKey,
                label: getColorInfo(colorKey).name,
                color: getColorInfo(colorKey).color,
                imageSrc: getEdgeColorIconSrc(colorKey),
              }))}
              onSelect={(edgeColor) => {
                setAppearanceTouched(true)
                const nextColors = getAvailableMaterialColorsForEdge(config.structure, config.matType, edgeColor)
                const updates: Partial<ConfiguratorState> = { edgeColor }
                if (!nextColors.includes(config.color)) updates.color = nextColors[0] || "black"
                updateConfig(updates)
              }}
            />
          </TeslaSection>

          <TeslaSection id="section-structure" title="Struktura" etap={3}>
            <TeslaRoundPicker
              selectedName={cellStructureOptions.find((item) => item.id === config.structure)?.name ?? "Romby"}
              priceLabel="W zestawie"
              selectedId={config.structure}
              disabled={mapperResult.sections.structure.isDisabled}
              options={cellStructureOptions.map((structure) => ({
                id: structure.id,
                label: structure.name,
                imageSrc: structure.iconSrc,
              }))}
              onSelect={(structure) => {
                setAppearanceTouched(true)
                updateConfig({ structure: structure as ConfiguratorState["structure"] })
              }}
            />
          </TeslaSection>

          <TeslaSection id="section-accessories" title="Dodatki" etap={4}>
            <AccessoriesStep
              config={config}
              onUpdate={updateConfig}
              onNext={() => undefined}
              onPrevious={() => undefined}
              canProceedToSummary={mapperResult.isReadyForCart}
              hideNavigation
              surface="light"
              layout="rows"
            />
          </TeslaSection>

          <div id="section-summary" data-configurator-section data-section-name="Podsumowanie" data-etap={5}>
            <TeslaTrustRow />
          </div>
          {cartError ? (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {cartError}
            </p>
          ) : null}
        </div>
        <div
          data-configurator-sticky
          className={`fixed inset-x-0 bottom-0 z-40 bg-white lg:static lg:shrink-0 ${showPriceBar ? "" : "hidden"}`}
        >
          {sticky}
        </div>
        </div>
      </div>

      <TeslaPriceSheet
        open={priceOpen}
        onClose={() => setPriceOpen(false)}
        basePrice={priceBreakdown.basePrice}
        discount={priceBreakdown.discount}
        matPrice={priceBreakdown.totalPrice}
        accessoryName={selectedPodpietka?.name}
        accessoryPrice={accessoryPrice}
        mountingFee={accessoryMountingFee}
      />
      <CompareMatTypesModal isOpen={compareTypes} onClose={() => setCompareTypes(false)} />
      <CompareVariantsModal
        isOpen={compareVariants}
        onClose={() => setCompareVariants(false)}
        pricingVariants={pricingVariants}
        pricingCategoryKey={config.pricingCategoryKey}
        bodyTypeKey={config.bodyTypeKey}
        selectedVariantKey={config.variant}
        onSelectVariant={(key) => {
          setResetNotice(null)
          updateConfig({ variant: key })
        }}
      />
    </div>
  )
}
