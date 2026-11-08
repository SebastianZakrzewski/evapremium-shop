"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCart } from "@/features/shopping-cart/hooks/useCart"
import { openCartModal } from "@/features/shopping-cart/utils/openCartModal"
import { useAccessories } from "@/features/accessories/hooks/useAccessories"
import { useBrands } from "@/features/brands/hooks/useBrands"
import { useMatProductImages } from "@/features/mat-product-images"
import {
  isMatRealizationMatType,
  useMatRealizationPhotos,
} from "@/features/mat-realization-photos"
import { useMatModelPreviews } from "@/features/mat-model-previews"
import { useConfiguratorState } from "@/features/car-configurator/hooks/useConfiguratorState"
import { getProductEntryLock } from "@/features/car-configurator/utils/productEntryContext"
import { useResolvedPricing } from "@/features/vehicle-catalog/hooks/useResolvedPricing"
import {
  reconcileVariantWithOfferedKeys,
  VARIANT_UNAVAILABLE_NOTICE,
} from "@/features/vehicle-catalog/domain/reconcileVariantWithOfferedKeys"
import { mapConfiguratorV2Sections } from "@/features/car-configurator/adapters/configuratorV2SectionMapper"
import {
  getPodpietkaMountingFee,
  getPodpietkaTotalPrice,
} from "@/features/car-configurator/domain/podpietkaMounting"
import { resolvePersistedMatSetVariantLabel } from "@/shared/mat-set-labels"
import { formatBrandDisplayName } from "@/shared/vehicle/displayLabels"
import { normalizeBrandName } from "@/shared/brands"
import { getMatImagePath } from "@/lib/image-mapping"
import { getMatTypeForDynamicPreview } from "@/components/configurator/configurator-simple/rugPreviewConfig"
import { ConfiguratorLoader } from "@/components/configurator/configurator-simple/ConfiguratorLoader"
import { ConfiguratorV2Layout } from "./ConfiguratorV2Layout"
import { ConfiguratorV2SpecsBar } from "./ConfiguratorV2SpecsBar"
import { ConfiguratorV2OptionSearch } from "./option-search/ConfiguratorV2OptionSearch"
import { ConfiguratorV2OptionsProvider } from "./option-search/ConfiguratorV2OptionsProvider"
import { countMatchingSections } from "./option-search/sectionMatchesOptionQuery"
import { buildConfiguratorSearchIndex } from "./option-search/buildConfiguratorSearchIndex"
import { ConfiguratorV2PreviewWithGallery } from "./ConfiguratorV2PreviewWithGallery"
import { ConfiguratorV2MatPreviewLightbox } from "./ConfiguratorV2MatPreviewLightbox"
import { useConfiguratorV2Preview } from "./hooks/useConfiguratorV2Preview"
import { useMatPreviewPreload } from "./hooks/useMatPreviewPreload"
import { VehicleContextSection } from "./sections/VehicleContextSection"
import { MatTypeSection } from "./sections/MatTypeSection"
import { VariantSection } from "./sections/VariantSection"
import { StructureSection } from "./sections/StructureSection"
import { ColorSection } from "./sections/ColorSection"
import { EdgeColorSection } from "./sections/EdgeColorSection"
import { AccessoriesSection } from "./sections/AccessoriesSection"
import { SummarySection } from "./sections/SummarySection"
import { ConfiguratorV2StickyBar } from "./sticky/ConfiguratorV2StickyBar"
import { ConfiguratorStageStepper } from "./steps/ConfiguratorStageStepper"
import { buildMatCartPayload } from "./steps/buildMatCartPayload"
import { explainConfigurationReset } from "./steps/explainConfigurationReset"
import { focusStageHeading } from "./steps/focusStageHeading"
import {
  CONFIGURATOR_STAGE_PARAM,
  CONFIGURATOR_STAGES,
  buildStageSnapshots,
  forwardDisabledReason,
  isSectionVisibleForStage,
  parseEtapParam,
  resolveConfiguratorStage,
  stageRequirementsFromSections,
  withEtapParam,
  type ConfiguratorStageId,
} from "./steps/configuratorStages"
import { PriceBreakdownModal } from "./sticky/PriceBreakdownModal"
import { CompareMatTypesModal } from "./modals/CompareMatTypesModal"
import { CompareVariantsModal } from "./modals/CompareVariantsModal"
import type { ConfiguratorState } from "@/features/car-configurator/utils/configuratorState"

const V2_STORAGE_KEY = "configurator-v2-state"

const STAGE_SECTION_IDS = [
  "section-vehicle",
  "section-matType",
  "section-variant",
  "section-structure",
  "section-color",
  "section-edgeColor",
  "section-accessories",
  "section-summary",
]

export default function ConfiguratorV2() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { addToCart, isLoading: cartLoading } = useCart()
  const { accessories } = useAccessories()
  const { brands, isLoading: brandsLoading } = useBrands()
  const { config, updateConfig, hydrated } = useConfiguratorState({
    searchParams,
    brands,
    storageKey: V2_STORAGE_KEY,
  })

  const productEntry = useMemo(
    () => getProductEntryLock(searchParams),
    [searchParams],
  )

  const generation = config.generation || undefined
  const brandForImage = useMemo(() => {
    const brandSlug = searchParams.get("brand") || config.brand.toLowerCase()
    return normalizeBrandName(brandSlug) || brandSlug
  }, [config.brand, searchParams])

  const { images: matProductImages } = useMatProductImages({
    brand: brandForImage,
    model: config.model,
    year: config.year ? parseInt(config.year) : undefined,
    generation,
    bodyType: config.bodyType || undefined,
    enabled: !!(brandForImage && config.model && config.year && config.bodyType),
  })

  const realizationMatType = isMatRealizationMatType(config.matType)
    ? config.matType
    : undefined

  const isRealizationPhotosReady = !!(
    config.brand &&
    config.model &&
    config.year &&
    config.bodyType &&
    (config.modelKey || config.recordKey) &&
    realizationMatType
  )

  const { photos: realizationPhotos } = useMatRealizationPhotos({
    recordKey: config.recordKey || undefined,
    brandKey: config.brandKey || undefined,
    modelKey: config.modelKey || config.model || undefined,
    matType: realizationMatType,
    enabled: isRealizationPhotosReady,
  })

  const isModelPreviewsReady = !!(
    config.modelKey ||
    config.recordKey ||
    (config.brand && config.model)
  )

  const { previews: modelPreviews } = useMatModelPreviews({
    recordKey: config.recordKey || undefined,
    brandKey: config.brandKey || undefined,
    modelKey: config.modelKey || config.model || undefined,
    bodyTypeKey: config.bodyTypeKey || config.bodyType || undefined,
    enabled: isModelPreviewsReady,
  })

  const pricingQuery = useResolvedPricing({
    recordKey: config.recordKey || undefined,
    year: config.year ? Number(config.year) : undefined,
    bodyTypeKey: config.bodyTypeKey || undefined,
    matType: config.matType,
    variantKey: config.variant || undefined,
  })

  const [variantNotice, setVariantNotice] = useState<string | null>(null)
  const [requestedOpen, setRequestedOpen] = useState<{ id: string; token: number } | null>(null)

  const pricingVariants = useMemo(
    () => pricingQuery.data?.variants ?? [],
    [pricingQuery.data],
  )
  const availableMatTypes = useMemo(
    () => pricingQuery.data?.availableMatTypes ?? [],
    [pricingQuery.data],
  )
  const skipMatTypeStep = availableMatTypes.length === 1

  useEffect(() => {
    const pricing = pricingQuery.data
    if (!pricing) return
    const updates: Partial<ConfiguratorState> = {}
    const nextMatType = pricing.availableMatTypes?.[0]
    if (
      pricing.availableMatTypes?.length === 1 &&
      nextMatType &&
      config.matType !== nextMatType
    ) {
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
    const reconciled = reconcileVariantWithOfferedKeys(
      config.variant,
      pricingQuery.data.variants.map((variant) => variant.key),
    )
    if (!config.variant) return
    if (!reconciled.cleared) {
      setVariantNotice(null)
      return
    }
    updateConfig({ variant: "" })
    setVariantNotice(VARIANT_UNAVAILABLE_NOTICE)
    setRequestedOpen((current) => ({
      id: "section-variant",
      token: (current?.token ?? 0) + 1,
    }))
  }, [
    config.variant,
    pricingQuery.data,
    pricingQuery.isFetching,
    pricingQuery.isSuccess,
    updateConfig,
  ])

  const priceBreakdown = useMemo(() => {
    const selectedVariant = pricingQuery.data?.selectedVariant
    if (!config.variant || !selectedVariant) {
      return {
        basePrice: 0,
        discount: 0,
        priceAfterDiscount: 0,
        totalPrice: 0,
      }
    }
    return {
      basePrice: selectedVariant.basePrice,
      discount: selectedVariant.discount,
      priceAfterDiscount: selectedVariant.priceAfterDiscount,
      totalPrice: selectedVariant.priceAfterDiscount,
    }
  }, [config.variant, pricingQuery.data?.selectedVariant])

  const selectedPodpietka = useMemo(() => {
    if (!config.selectedPodpietka) return null
    return accessories.find((acc) => acc.id === config.selectedPodpietka) ?? null
  }, [accessories, config.selectedPodpietka])

  const accessoryPrice = useMemo(() => {
    if (!selectedPodpietka) return 0
    return getPodpietkaTotalPrice(
      selectedPodpietka.price,
      config.podpietkaMounting,
    )
  }, [selectedPodpietka, config.podpietkaMounting])

  const accessoryMountingFee = useMemo(
    () => getPodpietkaMountingFee(config.podpietkaMounting),
    [config.podpietkaMounting],
  )

  const mapperResult = useMemo(
    () =>
      mapConfiguratorV2Sections({
        config,
        skipMatTypeStep,
        totalPrice: priceBreakdown.totalPrice,
        variantPricingLabel: pricingQuery.data?.selectedVariant?.label,
      }),
    [
      config,
      skipMatTypeStep,
      priceBreakdown.totalPrice,
      pricingQuery.data?.selectedVariant?.label,
    ],
  )

  const entryPreviewImage = productEntry.previewImageParam

  const primaryModelPreviewUrl = useMemo(() => {
    if (modelPreviews.length === 0) return null
    const primary =
      modelPreviews.find((preview) => preview.is_primary) ?? modelPreviews[0]
    return primary?.image_url ?? null
  }, [modelPreviews])

  const vehiclePreviewImage =
    entryPreviewImage?.trim() || primaryModelPreviewUrl

  const matProductImagePaths = useMemo(() => {
    const paths = [
      ...matProductImages.map((image) => image.image_url),
      ...modelPreviews.map((previewItem) => previewItem.image_url),
      ...realizationPhotos.map((photo) => photo.image_url),
    ]
    if (entryPreviewImage && !paths.includes(entryPreviewImage)) {
      paths.unshift(entryPreviewImage)
    }
    return paths
  }, [entryPreviewImage, matProductImages, modelPreviews, realizationPhotos])

  useMatPreviewPreload({
    matType: config.matType,
    pricingCategoryKey: config.pricingCategoryKey,
    structure: config.structure,
    color: config.color,
    edgeColor: config.edgeColor,
    variant: config.variant,
    extraPaths: matProductImagePaths,
  })

  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false)
  const [isCompareMatTypesOpen, setIsCompareMatTypesOpen] = useState(false)
  const [isCompareVariantsOpen, setIsCompareVariantsOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [cartActionError, setCartActionError] = useState<string | null>(null)
  const [resetNotice, setResetNotice] = useState<string | null>(null)
  const [optionQuery, setOptionQuery] = useState("")
  const [stage, setStage] = useState<ConfiguratorStageId>(
    () => parseEtapParam(searchParams.get(CONFIGURATOR_STAGE_PARAM)) ?? 1,
  )
  const stageRef = useRef(stage)
  stageRef.current = stage
  const writtenEtap = useRef<ConfiguratorStageId | null>(
    parseEtapParam(searchParams.get(CONFIGURATOR_STAGE_PARAM)),
  )
  const stageReady = useRef(false)
  const vehicleKeyRef = useRef<string | null>(null)
  const pendingFocus = useRef(false)
  const [stageSettled, setStageSettled] = useState(false)
  const previousConfig = useRef(config)
  const sawHydratedConfig = useRef(false)

  const stageInput = useMemo(
    () => stageRequirementsFromSections(mapperResult.sections),
    [mapperResult.sections],
  )
  const urlEtapNow = parseEtapParam(searchParams.get(CONFIGURATOR_STAGE_PARAM))
  const vehicleKey = `${searchParams.get("brand") ?? ""}::${searchParams.get("model") ?? ""}`
    .trim()
    .toLowerCase()
  const stageForView = resolveConfiguratorStage(
    !hydrated || !stageSettled ? (urlEtapNow ?? stage) : stage,
    stageInput,
  )
  const preview = useConfiguratorV2Preview(
    config,
    matProductImages,
    productEntry,
    realizationPhotos,
    modelPreviews,
    stageForView >= 2,
  )
  const stageSnapshots = useMemo(
    () => buildStageSnapshots(stageForView, stageInput),
    [stageForView, stageInput],
  )
  const disabledReason = forwardDisabledReason(stageForView, config, stageInput)
  const searchActive = optionQuery.trim().length > 0

  const writeEtap = useCallback(
    (next: ConfiguratorStageId, history: "push" | "replace") => {
      writtenEtap.current = next
      const href = `${pathname}?${withEtapParam(searchParams.toString(), next)}`
      if (history === "push") router.push(href, { scroll: false })
      else router.replace(href, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  const moveToStage = useCallback(
    (requested: number, history: "push" | "replace") => {
      const next = resolveConfiguratorStage(requested, stageInput)
      pendingFocus.current = true
      setStage(next)
      writeEtap(next, history)
    },
    [stageInput, writeEtap],
  )

  useEffect(() => {
    if (!hydrated) {
      previousConfig.current = config
      return
    }
    if (!sawHydratedConfig.current) {
      sawHydratedConfig.current = true
      previousConfig.current = config
      return
    }
    const message = explainConfigurationReset(previousConfig.current, config)
    previousConfig.current = config
    if (message) setResetNotice(message)
  }, [config, hydrated])

  const handleVehicleIdentityChange = useCallback(() => {
    const urlEtap = parseEtapParam(searchParams.get(CONFIGURATOR_STAGE_PARAM))
    if (stageRef.current === 1 && (urlEtap === null || urlEtap === 1)) return
    setStage(1)
    writeEtap(1, "replace")
  }, [searchParams, writeEtap])

  useEffect(() => {
    if (!hydrated) return
    const urlEtap = parseEtapParam(searchParams.get(CONFIGURATOR_STAGE_PARAM))
    const vehicleChanged = vehicleKeyRef.current !== null && vehicleKeyRef.current !== vehicleKey
    vehicleKeyRef.current = vehicleKey
    const externalNavigation = stageReady.current && urlEtap !== writtenEtap.current
    const requested = vehicleChanged
      ? 1
      : !stageReady.current
        ? (urlEtap ?? stageRef.current)
        : externalNavigation
          ? (urlEtap ?? 1)
          : stageRef.current
    stageReady.current = true
    const next = resolveConfiguratorStage(requested, stageInput)
    const currentQuery = searchParams.toString()
    const nextQuery = withEtapParam(currentQuery, next)
    writtenEtap.current = next
    if (next !== stageRef.current) setStage(next)
    if (!stageSettled) setStageSettled(true)
    if (nextQuery !== currentQuery) writeEtap(next, "replace")
  }, [hydrated, searchParams, stageInput, stageSettled, vehicleKey, writeEtap])

  useEffect(() => {
    if (!pendingFocus.current) return
    pendingFocus.current = false
    const heading = document.getElementById("configurator-stage-heading")
    if (heading instanceof HTMLElement) focusStageHeading(heading)
  }, [stage])

  const summaryPriceBreakdown = useMemo(
    () => ({
      basePrice: priceBreakdown.basePrice,
      discount: priceBreakdown.discount,
      shippingCost: 0,
      totalPrice: priceBreakdown.totalPrice,
    }),
    [priceBreakdown],
  )

  const handleAddToCart = useCallback(async () => {
    if (!mapperResult.isReadyForCart) {
      setCartActionError(
        "Uzupełnij konfigurację pojazdu (rok i typ nadwozia), aby dodać produkt do koszyka.",
      )
      return
    }

    setCartActionError(null)
    setIsAddingToCart(true)
    try {
      const productId = crypto.randomUUID()
      const matTypeForImage = getMatTypeForDynamicPreview(
        config.matType,
        config.pricingCategoryKey,
      )
      const productImagePath = getMatImagePath(
        matTypeForImage,
        config.structure,
        config.color,
        config.edgeColor,
      )

      const setVariantLabel = resolvePersistedMatSetVariantLabel({
        setType: config.matType,
        setVariant: config.variant,
        pricingCategoryKey: config.pricingCategoryKey,
        bodyTypeKey: config.bodyTypeKey,
        pricingLabel: pricingQuery.data?.selectedVariant?.label,
      })

      await addToCart(
        buildMatCartPayload({
          config,
          price: {
            basePrice: priceBreakdown.basePrice,
            priceAfterDiscount: priceBreakdown.priceAfterDiscount,
            totalPrice: priceBreakdown.totalPrice,
          },
          productId,
          productImage: productImagePath,
          setVariantLabel,
        }),
      )

      if (config.selectedPodpietka && selectedPodpietka) {
        const podpietkaImage =
          selectedPodpietka.images?.[0] ??
          selectedPodpietka.imageSrc ??
          ""
        try {
          await addToCart({
            productType: "accessory",
            productId: selectedPodpietka.id,
            quantity: 1,
            unitPrice: getPodpietkaTotalPrice(
              selectedPodpietka.price,
              config.podpietkaMounting,
            ),
            productName: `${selectedPodpietka.name}${config.podpietkaColor ? ` - ${config.podpietkaColor}` : ""}`,
            productSku: selectedPodpietka.sku,
            productImage: podpietkaImage,
            configuration: {
              color: config.podpietkaColor || undefined,
              mounting: config.podpietkaMounting,
            },
          })
        } catch (accessoryError) {
          console.error("Error adding accessory to cart:", accessoryError)
          const accessoryMessage =
            accessoryError instanceof Error
              ? accessoryError.message
              : "Nie udało się dodać akcesorium"
          setCartActionError(
            `Dywaniki dodano do koszyka, ale akcesorium nie zostało dodane: ${accessoryMessage}`,
          )
        }
      }

      openCartModal()
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Nie udało się dodać produktu do koszyka"
      setCartActionError(message)
      console.error("Error adding to cart:", error)
    } finally {
      setIsAddingToCart(false)
    }
  }, [
    mapperResult.isReadyForCart,
    config,
    priceBreakdown,
    pricingQuery.data?.selectedVariant?.label,
    addToCart,
    selectedPodpietka,
  ])

  const pageTitle = config.brand && config.model
    ? `${formatBrandDisplayName(config.brand)} ${config.model}`
    : "Zaprojektuj dywaniki"

  const sectionTitles = useMemo(() => {
    const titles = [
      productEntry.isLocked ? "Twój samochód" : "Wybór samochodu",
      "Typ dywanika",
      "Wariant zestawu",
      "Struktura komórek",
      "Kolor materiału",
      "Kolor obszycia",
      "Akcesoria",
    ]
    titles.push("Podsumowanie zamówienia")
    return titles
  }, [productEntry.isLocked])

  const searchTermsById = useMemo(
    () =>
      buildConfiguratorSearchIndex({
        brand: config.brand,
        model: config.model,
        year: config.year,
        gearbox: config.gearbox,
        bodyType: config.bodyType,
        matType: config.matType,
        structure: config.structure,
        availableMatTypes,
        pricingVariants,
        pricingCategoryKey: config.pricingCategoryKey,
        bodyTypeKey: config.bodyTypeKey,
      }),
    [
      availableMatTypes,
      config.bodyType,
      config.bodyTypeKey,
      config.brand,
      config.gearbox,
      config.matType,
      config.model,
      config.pricingCategoryKey,
      config.structure,
      config.year,
      pricingVariants,
    ],
  )

  const optionMatchCount = useMemo(
    () =>
      countMatchingSections(
        sectionTitles.map((title, index) => {
          const id = [
            "section-vehicle",
            "section-matType",
            "section-variant",
            "section-structure",
            "section-color",
            "section-edgeColor",
            "section-accessories",
            "section-summary",
          ][index]
          return { title, terms: id ? searchTermsById[id] ?? [] : [] }
        }),
        optionQuery,
      ),
    [optionQuery, searchTermsById, sectionTitles],
  )

  const currentStageName =
    stageSnapshots.find((item) => item.id === stageForView)?.name ?? "Samochód"
  const showSection = (section: Parameters<typeof isSectionVisibleForStage>[0]["section"]) =>
    isSectionVisibleForStage({
      section,
      stage: stageForView,
      searchActive,
      input: stageInput,
    })

  if ((brandsLoading && !config.brand) || !hydrated) {
    return <ConfiguratorLoader />
  }

  const stickyBarProps = {
    priceBreakdown,
    accessoryPrice,
    isConfigComplete: mapperResult.isReadyForCart,
    showBack: stageForView > 1,
    onBack: () => moveToStage(stageForView - 1, "push"),
    showForward: stageForView < CONFIGURATOR_STAGES.length,
    stageCount: CONFIGURATOR_STAGES.length,
    forwardDisabled: disabledReason != null,
    forwardDisabledReason: disabledReason,
    onForward: () => moveToStage(stageForView + 1, "push"),
    onPriceClick: () => setIsPriceModalOpen(true),
    currentStage: stageForView,
  }

  return (
    <ConfiguratorV2Layout
      topBar={<ConfiguratorV2StickyBar {...stickyBarProps} variant="header" />}
      stageNav={
        <ConfiguratorStageStepper
          stages={stageSnapshots}
          onOpen={(next) => moveToStage(next, "push")}
        />
      }
      specsBar={
        <ConfiguratorV2SpecsBar
          title={pageTitle}
          year={config.year || undefined}
          contextLine={mapperResult.contextLine}
        />
      }
      mobilePreview={
        <ConfiguratorV2PreviewWithGallery
          layout="mobile"
          imageSrc={preview.imageSrc}
          alt={preview.alt}
          usesMatPreviewCanvas={preview.usesMatPreviewCanvas}
          onOpenZoom={() => setIsPreviewModalOpen(true)}
          showGallery={preview.showGallery}
          showEmptyInCarSlot={preview.showEmptyInCarSlot}
          galleryItems={preview.galleryItems}
          activeGalleryId={preview.activeGalleryId}
          onSelectGalleryItem={preview.selectGalleryItem}
          realizationCaption={preview.realizationCaption}
        />
      }
      previewPanel={
        <ConfiguratorV2PreviewWithGallery
          layout="desktop"
          imageSrc={preview.imageSrc}
          alt={preview.alt}
          usesMatPreviewCanvas={preview.usesMatPreviewCanvas}
          onOpenZoom={() => setIsPreviewModalOpen(true)}
          showGallery={preview.showGallery}
          showEmptyInCarSlot={preview.showEmptyInCarSlot}
          galleryItems={preview.galleryItems}
          activeGalleryId={preview.activeGalleryId}
          onSelectGalleryItem={preview.selectGalleryItem}
          realizationCaption={preview.realizationCaption}
        />
      }
      optionPanel={
        <>
          <div className="hidden lg:block">
            <ConfiguratorV2OptionSearch
              query={optionQuery}
              matchCount={optionMatchCount}
              onQueryChange={setOptionQuery}
            />
          </div>
          <h2
            id="configurator-stage-heading"
            tabIndex={-1}
            className="mb-1 text-sm font-semibold tracking-tight text-neutral-950 outline-none max-[380px]:sr-only"
          >
            {currentStageName}
          </h2>
          {resetNotice && (
            <p role="status" className="mb-3 text-[13px] leading-snug text-neutral-800">
              {resetNotice}
            </p>
          )}
          <ConfiguratorV2OptionsProvider
            query={optionQuery}
            initiallyOpenSectionIds={STAGE_SECTION_IDS}
            searchTermsById={searchTermsById}
            requestedOpen={requestedOpen}
          >
          {showSection("vehicle") && (
          <VehicleContextSection
            config={config}
            productEntry={productEntry}
            readiness={mapperResult.sections.vehicle}
            onUpdate={updateConfig}
            onVehicleChange={handleVehicleIdentityChange}
          />
          )}
          {showSection("matType") && (
          <MatTypeSection
            config={config}
            skipMatTypeStep={skipMatTypeStep}
            availableMatTypes={availableMatTypes}
            readiness={mapperResult.sections.matType}
            onUpdate={updateConfig}
            onCompareClick={() => setIsCompareMatTypesOpen(true)}
          />
          )}
          {showSection("variant") && (
          <VariantSection
            config={config}
            pricingVariants={pricingVariants}
            pricingCategoryKey={config.pricingCategoryKey}
            bodyTypeKey={config.bodyTypeKey}
            readiness={mapperResult.sections.variant}
            onUpdate={updateConfig}
            onCompareClick={() => setIsCompareVariantsOpen(true)}
            unavailableNotice={resetNotice ? null : variantNotice}
          />
          )}
          {showSection("structure") && (
          <StructureSection
            config={config}
            readiness={mapperResult.sections.structure}
            onUpdate={updateConfig}
          />
          )}
          {showSection("color") && (
          <ColorSection
            config={config}
            readiness={mapperResult.sections.color}
            onUpdate={updateConfig}
          />
          )}
          {showSection("edgeColor") && (
          <EdgeColorSection
            config={config}
            readiness={mapperResult.sections.edgeColor}
            onUpdate={updateConfig}
          />
          )}
          {showSection("accessories") && (
          <AccessoriesSection
            config={config}
            readiness={mapperResult.sections.accessories}
            onUpdate={updateConfig}
            onNext={() => undefined}
            onPrevious={() => moveToStage(3, "push")}
            canProceedToSummary={mapperResult.isReadyForCart}
          />
          )}
          {showSection("summary") && (
            <SummarySection
              config={config}
              priceBreakdown={summaryPriceBreakdown}
              onPrevious={() => moveToStage(4, "push")}
              onAddToCart={handleAddToCart}
              isAddingToCart={isAddingToCart || cartLoading}
              cartActionError={cartActionError}
              vehiclePreviewImage={vehiclePreviewImage}
              stickyMobileActions={false}
            />
          )}
          </ConfiguratorV2OptionsProvider>
        </>
      }
      fullScreen={stageForView === 5}
      stickyBarMobile={
        <ConfiguratorV2StickyBar {...stickyBarProps} variant="fixed" />
      }
      modals={
        <>
          <PriceBreakdownModal
            isOpen={isPriceModalOpen}
            onClose={() => setIsPriceModalOpen(false)}
            priceBreakdown={priceBreakdown}
            accessoryPrice={accessoryPrice}
            accessoryName={selectedPodpietka?.name}
            accessoryMountingFee={accessoryMountingFee}
          />
          <CompareMatTypesModal
            isOpen={isCompareMatTypesOpen}
            onClose={() => setIsCompareMatTypesOpen(false)}
          />
          <CompareVariantsModal
            isOpen={isCompareVariantsOpen}
            onClose={() => setIsCompareVariantsOpen(false)}
            pricingVariants={pricingVariants}
            pricingCategoryKey={config.pricingCategoryKey}
            bodyTypeKey={config.bodyTypeKey}
            selectedVariantKey={config.variant}
            onSelectVariant={(key) => updateConfig({ variant: key })}
          />
          <ConfiguratorV2MatPreviewLightbox
            isOpen={isPreviewModalOpen}
            imageSrc={preview.imageSrc}
            alt={preview.alt}
            onClose={() => setIsPreviewModalOpen(false)}
            galleryImages={preview.lightboxImages}
            initialIndex={preview.lightboxIndex}
            onGalleryIndexChange={(index) => {
              const item = preview.galleryItems[index]
              if (item) preview.selectGalleryItem(item.id)
            }}
          />
        </>
      }
    />
  )
}
