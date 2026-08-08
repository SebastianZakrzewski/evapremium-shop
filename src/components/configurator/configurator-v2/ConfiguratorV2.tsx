"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useCart } from "@/features/shopping-cart/hooks/useCart"
import { openCartModal } from "@/features/shopping-cart/utils/openCartModal"
import { useAccessories } from "@/features/accessories/hooks/useAccessories"
import { useBrands } from "@/features/brands/hooks/useBrands"
import { useMatProductImages } from "@/features/mat-product-images"
import { useConfiguratorState } from "@/features/car-configurator/hooks/useConfiguratorState"
import { getProductEntryLock } from "@/features/car-configurator/utils/productEntryContext"
import { useResolvedPricing } from "@/features/vehicle-catalog/hooks/useResolvedPricing"
import { mapConfiguratorV2Sections } from "@/features/car-configurator/adapters/configuratorV2SectionMapper"
import { resolvePersistedMatSetVariantLabel } from "@/shared/mat-set-labels"
import { normalizeBrandName } from "@/shared/brands"
import { getMatImagePath } from "@/lib/image-mapping"
import { getMatTypeForDynamicPreview } from "@/components/configurator/configurator-simple/rugPreviewConfig"
import { ConfiguratorLoader } from "@/components/configurator/configurator-simple/ConfiguratorLoader"
import { ConfiguratorV2Layout } from "./ConfiguratorV2Layout"
import { ConfiguratorV2SpecsBar } from "./ConfiguratorV2SpecsBar"
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
import { scrollConfiguratorV2ToElementWhenReady } from "./utils/scrollConfiguratorV2ToElement"
import { ConfiguratorV2StickyBar } from "./sticky/ConfiguratorV2StickyBar"
import { PriceBreakdownModal } from "./sticky/PriceBreakdownModal"
import { CompareMatTypesModal } from "./modals/CompareMatTypesModal"
import { CompareVariantsModal } from "./modals/CompareVariantsModal"
import { MatFeaturesModal } from "./modals/MatFeaturesModal"
import type { ConfiguratorState } from "@/features/car-configurator/utils/configuratorState"

const V2_STORAGE_KEY = "configurator-v2-state"

export default function ConfiguratorV2() {
  const searchParams = useSearchParams()
  const { addToCart, isLoading: cartLoading } = useCart()
  const { accessories } = useAccessories()
  const { brands, isLoading: brandsLoading } = useBrands()
  const { config, updateConfig } = useConfiguratorState({
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

  const pricingQuery = useResolvedPricing({
    recordKey: config.recordKey || undefined,
    year: config.year ? Number(config.year) : undefined,
    bodyTypeKey: config.bodyTypeKey || undefined,
    matType: config.matType,
    variantKey: config.variant || undefined,
  })

  const pricingVariants = pricingQuery.data?.variants ?? []
  const skipMatTypeStep =
    pricingQuery.data?.availableMatTypes?.length === 1 &&
    pricingQuery.data.availableMatTypes[0] === "single"

  useEffect(() => {
    const pricing = pricingQuery.data
    if (!pricing) return
    const updates: Partial<ConfiguratorState> = {}
    if (pricing.matType === "single" && config.matType !== "single") {
      updates.matType = "single"
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

  const preview = useConfiguratorV2Preview(
    config,
    matProductImages,
    productEntry,
  )

  const entryPreviewImage = productEntry.previewImageParam

  const matProductImagePaths = useMemo(() => {
    const paths = matProductImages.map((image) => image.image_url)
    if (entryPreviewImage && !paths.includes(entryPreviewImage)) {
      paths.unshift(entryPreviewImage)
    }
    return paths
  }, [entryPreviewImage, matProductImages])

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
  const [isFeaturesModalOpen, setIsFeaturesModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [cartActionError, setCartActionError] = useState<string | null>(null)

  const summaryPriceBreakdown = useMemo(
    () => ({
      basePrice: priceBreakdown.basePrice,
      discount: priceBreakdown.discount,
      shippingCost: 0,
      totalPrice: priceBreakdown.totalPrice,
    }),
    [priceBreakdown],
  )

  const scrollToSection = useCallback((sectionId: string) => {
    scrollConfiguratorV2ToElementWhenReady(sectionId)
  }, [])

  const handleGoToSummary = useCallback(() => {
    if (!mapperResult.isReadyForCart) return
    setShowSummary(true)
  }, [mapperResult.isReadyForCart])

  useEffect(() => {
    if (!showSummary) return
    const cancelScroll = scrollConfiguratorV2ToElementWhenReady("summary-order-heading", {
      alignToContentStart: true,
      offset: 12,
    })
    return cancelScroll
  }, [showSummary])

  const handleBackFromSummary = useCallback(() => {
    setShowSummary(false)
    scrollToSection("section-accessories")
  }, [scrollToSection])

  const handleBackToEdgeColors = useCallback(() => {
    scrollToSection("section-edgeColor")
  }, [scrollToSection])

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

      await addToCart({
        productType: "mat",
        productId,
        quantity: 1,
        unitPrice: priceBreakdown.totalPrice,
        productName: `Dywaniki ${config.brand} ${config.model}`,
        productSku: `MAT-${config.brand.toUpperCase()}-${config.model.toUpperCase()}`,
        productImage: productImagePath,
        configuration: {
          carDetails: {
            brand: config.brand,
            brandKey: config.brandKey,
            model: config.model,
            modelFamilyKey: config.modelFamilyKey,
            modelKey: config.modelKey,
            generation: config.generation,
            year: config.year,
            bodyType: config.bodyType,
            bodyTypeKey: config.bodyTypeKey,
            recordKey: config.recordKey,
            templateId: config.templateId,
          },
          pricing: {
            pricingCategoryKey: config.pricingCategoryKey,
            catalogVersionCode: config.catalogVersionCode,
            basePrice: priceBreakdown.basePrice,
            priceAfterDiscount: priceBreakdown.priceAfterDiscount,
            totalPrice: priceBreakdown.totalPrice,
          },
          setType: config.matType,
          setVariant: config.variant,
          setVariantLabel,
          cellType: config.structure,
          materialColor: config.color,
          edgeColor: config.edgeColor,
        },
      })

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
            unitPrice: selectedPodpietka.price,
            productName: `${selectedPodpietka.name}${config.podpietkaColor ? ` - ${config.podpietkaColor}` : ""}`,
            productSku: selectedPodpietka.sku,
            productImage: podpietkaImage,
            configuration: {
              color: config.podpietkaColor || undefined,
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
    ? `${config.brand} ${config.model}`
    : "Zaprojektuj dywaniki"

  if (brandsLoading && !config.brand) {
    return <ConfiguratorLoader />
  }

  const stickyBarProps = {
    priceBreakdown,
    accessoryPrice: selectedPodpietka?.price ?? 0,
    isConfigComplete: mapperResult.isReadyForCart,
    showSummaryCta: !showSummary,
    onGoToSummary: handleGoToSummary,
    onPriceClick: () => setIsPriceModalOpen(true),
  }

  return (
    <ConfiguratorV2Layout
      mobilePreviewHasGallery={preview.showGallery}
      hideMobileStickyBar={showSummary}
      specsBar={
        <ConfiguratorV2SpecsBar
          title={pageTitle}
          metrics={mapperResult.metrics}
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
        />
      }
      optionPanel={
        <>
          <VehicleContextSection
            config={config}
            productEntry={productEntry}
            readiness={mapperResult.sections.vehicle}
            onUpdate={updateConfig}
          />
          <MatTypeSection
            config={config}
            skipMatTypeStep={skipMatTypeStep}
            readiness={mapperResult.sections.matType}
            onUpdate={updateConfig}
            onCompareClick={() => setIsCompareMatTypesOpen(true)}
          />
          <VariantSection
            config={config}
            pricingVariants={pricingVariants}
            pricingCategoryKey={config.pricingCategoryKey}
            bodyTypeKey={config.bodyTypeKey}
            readiness={mapperResult.sections.variant}
            onUpdate={updateConfig}
            onCompareClick={() => setIsCompareVariantsOpen(true)}
          />
          <StructureSection
            config={config}
            readiness={mapperResult.sections.structure}
            onUpdate={updateConfig}
          />
          <ColorSection
            config={config}
            readiness={mapperResult.sections.color}
            onUpdate={updateConfig}
          />
          <EdgeColorSection
            config={config}
            readiness={mapperResult.sections.edgeColor}
            onUpdate={updateConfig}
          />
          <AccessoriesSection
            config={config}
            readiness={mapperResult.sections.accessories}
            onUpdate={updateConfig}
            onNext={handleGoToSummary}
            onPrevious={handleBackToEdgeColors}
            canProceedToSummary={mapperResult.isReadyForCart}
          />
          {showSummary && (
            <SummarySection
              config={config}
              priceBreakdown={summaryPriceBreakdown}
              onPrevious={handleBackFromSummary}
              onAddToCart={handleAddToCart}
              isAddingToCart={isAddingToCart || cartLoading}
              cartActionError={cartActionError}
            />
          )}
          {!showSummary && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsFeaturesModalOpen(true)}
              className="text-sm text-red-400 hover:text-red-300 underline-offset-2 hover:underline"
            >
              Dowiedz się więcej o dywanikach EVA
            </button>
          </div>
          )}
        </>
      }
      stickyBarDesktop={
        <ConfiguratorV2StickyBar {...stickyBarProps} variant="column" />
      }
      stickyBarMobile={
        <ConfiguratorV2StickyBar {...stickyBarProps} variant="fixed" />
      }
      modals={
        <>
          <PriceBreakdownModal
            isOpen={isPriceModalOpen}
            onClose={() => setIsPriceModalOpen(false)}
            priceBreakdown={priceBreakdown}
            accessoryPrice={selectedPodpietka?.price ?? 0}
            accessoryName={selectedPodpietka?.name}
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
          <MatFeaturesModal
            isOpen={isFeaturesModalOpen}
            onClose={() => setIsFeaturesModalOpen(false)}
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
