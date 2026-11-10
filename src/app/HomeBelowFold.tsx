"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"

const ProductGallerySection = dynamic(
  () => import("@/features/products/components/ProductGallerySection"),
  { ssr: false },
)
const ProductVideoCarouselSection = dynamic(
  () => import("@/features/products/components/ProductVideoCarouselSection"),
  { ssr: false },
)
const InteractiveFeaturesSection = dynamic(
  () => import("@/components/interactive-features-section"),
  { ssr: false },
)
const MatComparisonSection = dynamic(
  () => import("@/components/mat-comparison-section"),
  { ssr: false },
)
const ProductSelection = dynamic(
  () => import("@/features/products/components/ProductSelection"),
  { ssr: false },
)
const RoznorodnaKolorystykaSection = dynamic(
  () => import("@/components/roznorodna-kolorystyka-section"),
  { ssr: false },
)
const GlebokaStrukturaKomorekSection = dynamic(
  () => import("@/components/gleboka-struktura-komorek-section"),
  { ssr: false },
)
const CustomerReviews = dynamic(() => import("@/components/CustomerReviews"), { ssr: false })
const FAQSection = dynamic(() => import("@/components/FAQSection"), { ssr: false })

export const HomeBelowFold = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container || typeof IntersectionObserver === "undefined") {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return
        }
        setIsVisible(true)
        observer.disconnect()
      },
      { rootMargin: "200px" },
    )
    observer.observe(container)

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} style={isVisible ? undefined : { minHeight: "32rem" }}>
      {isVisible ? (
        <>
          <ProductGallerySection />
          <ProductVideoCarouselSection />
          <InteractiveFeaturesSection />
          <MatComparisonSection />
          <ProductSelection />
          <RoznorodnaKolorystykaSection />
          <GlebokaStrukturaKomorekSection />
          <CustomerReviews />
          <FAQSection />
        </>
      ) : null}
    </div>
  )
}
