"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import ShopSectionHeading from "@/components/ui/shop-section-heading";

const features = [
  {
    id: "ochrona",
    title: "Doskonała ochrona",
    description: "Ranty do 7 cm zatrzymują wodę i błoto na dywaniku i chronią wykładzinę przed zabrudzeniem.",
    position: { top: "25%", left: "80%" },
    image: "/images/zalety/cechy/ranty.jpg"
  },
  {
    id: "jezor",
    title: "3D Jęzor",
    description: "Podstopnica 3D osłania wykładzinę przy pedałach i daje pełną ochronę w miejscu najbardziej narażonym na zużycie.",
    position: { top: "14%", left: "20%" },
    image: "/images/zalety/cechy/podstopnica-3d-1024.jpg"
  },
  {
    id: "mocowania",
    title: "Mocowania",
    description: "Mocowania pasują do podłogi Twojego auta. Dywanik wpinasz w fabryczne zaczepy.",
    position: { top: "60%", left: "65%" },
    image: "/images/zalety/cechy/mocowania.jpg"
  },
  {
    id: "czyszczenie",
    title: "Łatwość czyszczenia",
    description: "Komórki zatrzymują płyny i błoto, więc nic nie rozlewa się po aucie.",
    position: { top: "45%", left: "35%" },
    image: "/images/zalety/cechy/komorki.jpg"
  },
  {
    id: "rzep",
    title: "Rzep na każdym rogu",
    description: "Rzep na każdym rogu trzyma dywanik w miejscu, więc nie przesuwa się pod stopami.",
    position: { top: "75%", left: "25%" },
    image: "/images/zalety/cechy/rzepy.jpg"
  },
  {
    id: "grubosc",
    title: "Grubość 10mm",
    description: "Dywanik ma 10 mm grubości. Solidna pianka EVA amortyzuje i chroni wykładzinę.",
    position: { top: "85%", left: "75%" },
    image: "/images/zalety/cechy/grubosc.jpg"
  },
];

const CONTENT_TRANSITION_MS = 180
const TEXT_TRANSITION_MS = 120

export default function InteractiveFeaturesSection() {
  const [activeFeature, setActiveFeature] = useState<string>(features[0].id)
  const [displayedImageFeature, setDisplayedImageFeature] = useState(features[0])
  const [displayedTextFeature, setDisplayedTextFeature] = useState(features[0])
  const [outgoingFeature, setOutgoingFeature] = useState<typeof features[0] | null>(null)
  const [isImageTransitioning, setIsImageTransitioning] = useState(false)
  const [isTextVisible, setIsTextVisible] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [hasEntranceCompleted, setHasEntranceCompleted] = useState(false)
  const detailsRef = useRef<HTMLDivElement>(null)
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const textTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleFeatureClick = (id: string) => {
    if (id === activeFeature) return

    const newFeature = features.find((feature) => feature.id === id) || features[0]

    setActiveFeature(id)
    setOutgoingFeature(displayedImageFeature)
    setDisplayedImageFeature(newFeature)
    setIsImageTransitioning(false)
    setIsTextVisible(false)

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current)
    }

    if (textTimeoutRef.current) {
      clearTimeout(textTimeoutRef.current)
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsImageTransitioning(true)
      })
    })

    transitionTimeoutRef.current = setTimeout(() => {
      setOutgoingFeature(null)
      setIsImageTransitioning(false)
      transitionTimeoutRef.current = null
    }, CONTENT_TRANSITION_MS)

    textTimeoutRef.current = setTimeout(() => {
      setDisplayedTextFeature(newFeature)
      setIsTextVisible(true)
      textTimeoutRef.current = null
    }, TEXT_TRANSITION_MS)

    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setTimeout(() => {
        if (!detailsRef.current) return

        const yOffset = -100
        const y = detailsRef.current.getBoundingClientRect().top + window.scrollY + yOffset
        window.scrollTo({ top: y, behavior: "smooth" })
      }, CONTENT_TRANSITION_MS + 40)
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const section = document.getElementById("interactive-features")
    if (section) {
      observer.observe(section)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible || hasEntranceCompleted) return

    const entranceTimeout = setTimeout(() => {
      setHasEntranceCompleted(true)
    }, 1200)

    return () => clearTimeout(entranceTimeout)
  }, [isVisible, hasEntranceCompleted])

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
      }

      if (textTimeoutRef.current) {
        clearTimeout(textTimeoutRef.current)
      }
    }
  }, [])

  return (
    <section 
      id="interactive-features" 
      className="py-7 md:py-9 bg-[#FFFFFF] relative overflow-hidden"
    >
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <ShopSectionHeading
          className={`mb-5 md:mb-6 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          kicker="Cechy"
          title="Poznaj innowacyjne cechy"
          description="Kliknij na etykiety na zdjęciu, aby dowiedzieć się więcej o rozwiązaniach, które zastosowaliśmy w naszych dywanikach EVA."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 items-start max-w-6xl mx-auto">
          
          {/* Prawa strona: Zdjęcie szczegółowe + Opis */}
          <div ref={detailsRef} className={`order-2 lg:order-2 transition-all duration-1000 ease-out sticky top-24 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="relative group">
              {/* Kontener na zdjęcie */}
              <div className="relative bg-white/5 backdrop-blur-md rounded-3xl p-2 border border-white/10 shadow-2xl shadow-black/50 overflow-hidden group-hover:border-red-500/20 transition-all duration-500">
                <div className="relative rounded-2xl overflow-hidden bg-[#FFFFFF] flex min-h-[220px] sm:min-h-[280px]">
                  {outgoingFeature && (
                    <Image
                      src={outgoingFeature.image}
                      alt={outgoingFeature.title}
                      width={1000}
                      height={1000}
                      className={cn(
                        "absolute inset-0 w-full h-auto transition-opacity duration-200 ease-out",
                        isImageTransitioning ? "opacity-0" : "opacity-100"
                      )}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  )}
                  <Image
                    src={displayedImageFeature.image}
                    alt={displayedImageFeature.title}
                    width={1000}
                    height={1000}
                    className={cn(
                      "relative w-full h-auto transition-opacity duration-200 ease-out",
                      outgoingFeature && !isImageTransitioning ? "opacity-0" : "opacity-100"
                    )}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                
                {/* Shine Effect */}
                <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                  <div className="absolute inset-0 transform -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
              </div>
              
              {/* Opis pod zdjęciem */}
              <div
                className={cn(
                  "mt-5 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 transition-all duration-150 ease-out",
                  isTextVisible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
                )}
              >
                <h3 className="text-white mb-2">
                  {displayedTextFeature.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {displayedTextFeature.description}
                </p>
              </div>
            </div>
          </div>

          {/* Lewa strona: Interaktywny dywanik */}
          <div className={`order-1 lg:order-1 transition-all duration-1000 ease-out delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="relative w-full aspect-square max-w-[480px] mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 bg-[#FFFFFF]">
              <Image
                src="/images/interactive-mat-clean.png"
                alt="Dywaniki EVA - cechy"
                fill
                className="object-cover opacity-90"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              
              {/* Interaktywne obszary na etykietach */}
              {features.map((feature, index) => {
                const isActive = activeFeature === feature.id;
                return (
                  <button
                    key={feature.id}
                    onClick={() => handleFeatureClick(feature.id)}
                    className={cn(
                      "absolute -translate-x-1/2 -translate-y-1/2 px-4 py-2 rounded-full font-bold text-xs sm:text-sm whitespace-nowrap z-20 shadow-xl border-2 transition-colors duration-150 ease-out",
                      isActive
                        ? "bg-red-600 text-white border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.6)]"
                        : "bg-white/90 text-black border-transparent hover:bg-white"
                    )}
                    style={{
                      top: feature.position.top,
                      left: feature.position.left,
                      transitionDelay:
                        isVisible && !hasEntranceCompleted && !isActive
                          ? `${400 + index * 150}ms`
                          : "0ms",
                    }}
                    aria-label={`Zobacz cechę: ${feature.title}`}
                  >
                    {feature.title}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
