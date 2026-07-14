"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useCart } from "@/features/shopping-cart/hooks/useCart"
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
import { GalleryLightbox } from "@/components/ui/gallery-lightbox"
import { ConfiguratorV2Layout } from "./ConfiguratorV2Layout"
import { ConfiguratorV2SpecsBar } from "./ConfiguratorV2SpecsBar"
import { ConfiguratorV2PreviewPanel } from "./ConfiguratorV2PreviewPanel"
import { ConfiguratorV2MobilePreview } from "./ConfiguratorV2MobilePreview"
import { useConfiguratorV2Preview } from "./hooks/useConfiguratorV2Preview"
import { useMatPreviewPreload } from "./hooks/useMatPreviewPreload"
import { VehicleContextSection } from "./sections/VehicleContextSection"
import { MatTypeSection } from "./sections/MatTypeSection"
import { VariantSection } from "./sections/VariantSection"
import { StructureSection } from "./sections/StructureSection"
import { ColorSection } from "./sections/ColorSection"
import { EdgeColorSection } from "./sections/EdgeColorSection"
import { AccessoriesSection } from "./sections/AccessoriesSection"
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

  const matProductImage = useMemo(
    () => matProductImages?.[0]?.image_url ?? null,
    [matProductImages],
  )

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

  const preview = useConfiguratorV2Preview(config, matProductImage)

  useMatPreviewPreload({
    matType: config.matType,
    pricingCategoryKey: config.pricingCategoryKey,
    structure: config.structure,
    color: config.color,
    edgeColor: config.edgeColor,
    variant: config.variant,
    extraPaths: matProductImage ? [matProductImage] : [],
  })

  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false)
  const [isCompareMatTypesOpen, setIsCompareMatTypesOpen] = useState(false)
  const [isCompareVariantsOpen, setIsCompareVariantsOpen] = useState(false)
  const [isFeaturesModalOpen, setIsFeaturesModalOpen] = useState(false)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)

  const handleAddToCart = useCallback(async () => {
    if (!mapperResult.isReadyForCart) return
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
      }

      window.dispatchEvent(new CustomEvent("openCartModal"))
    } catch (error) {
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
    isReadyForCart: mapperResult.isReadyForCart,
    isAddingToCart: isAddingToCart || cartLoading,
    onAddToCart: handleAddToCart,
    onPriceClick: () => setIsPriceModalOpen(true),
  }

  return (
    <ConfiguratorV2Layout
      specsBar={
        <ConfiguratorV2SpecsBar
          title={pageTitle}
          metrics={mapperResult.metrics}
          contextLine={mapperResult.contextLine}
        />
      }
      mobilePreview={
        <ConfiguratorV2MobilePreview
          imageSrc={preview.imageSrc}
          alt={preview.alt}
          onOpenZoom={() => setIsPreviewModalOpen(true)}
        />
      }
      previewPanel={
        <ConfiguratorV2PreviewPanel
          imageSrc={preview.imageSrc}
          alt={preview.alt}
          onOpenZoom={() => setIsPreviewModalOpen(true)}
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
          />
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsFeaturesModalOpen(true)}
              className="text-sm text-red-400 hover:text-red-300 underline-offset-2 hover:underline"
            >
              Dowiedz się więcej o dywanikach EVA
            </button>
          </div>
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
          <GalleryLightbox
            isOpen={isPreviewModalOpen}
            items={[{ src: preview.imageSrc, alt: preview.alt }]}
            currentIndex={0}
            onIndexChange={() => {}}
            onClose={() => setIsPreviewModalOpen(false)}
          />
        </>
      }
    />
  )
}
