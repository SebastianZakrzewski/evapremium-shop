"use client"

import { useState, useEffect } from "react"
import { ImageComparisonSlider } from "@/components/ui/image-comparison-slider-horizontal"
import ShopSectionHeading from "@/components/ui/shop-section-heading"

const advantages = [
  {
    eva: "Lekka i elastyczna pianka EVA",
    rubber: "Ciężka, sztywna guma",
  },
  {
    eva: "Dokładnie dopasowana do modelu auta",
    rubber: "Standardowe wymiary — nie pasuje idealnie",
  },
  {
    eva: "Łatwa do czyszczenia — spłucz wodą",
    rubber: "Brud wpada w ryflowania i zalega",
  },
  {
    eva: "Nie śmierdzi nawet w upały",
    rubber: "Intensywny zapach gumy latem",
  },
]

export default function MatComparisonSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.1 }
    )

    const section = document.getElementById("mat-comparison-section")
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="mat-comparison-section"
      className="py-8 md:py-10 bg-black relative overflow-hidden"
      role="region"
      aria-label="Porównanie dywaników EVA z gumowymi"
    >
      {/* subtle grid bg */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle,_#ffffff_1px,_transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <ShopSectionHeading
          className={`mb-6 transition-all duration-1000 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
          kicker="Porównanie"
          title="EVA vs gumowe"
          description="Przeciągnij suwak i przekonaj się na własne oczy, dlaczego dywaniki EVA to wybór nowej generacji kierowców."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center max-w-6xl mx-auto">
          {/* Slider */}
          <div
            className={`transition-all duration-1000 delay-200 ease-out ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl aspect-[4/5] md:aspect-square cursor-ew-resize">
              <ImageComparisonSlider
                leftImage="/images/eva-mat-comparison.webp"
                rightImage="/images/gumowe-mat-comparison.webp"
                altLeft="Dywanik EVA — czarny z czerwonym obrzeżem, siatka heksagonalna"
                altRight="Dywanik gumowy — z piaskiem i brudem w rowkach"
                leftLabel="EVA Premium"
                rightLabel="Gumowy"
                initialPosition={55}
                className="w-full h-full"
              />
            </div>

            <p className="text-center text-gray-600 text-xs mt-3 select-none">
              ← Przeciągnij suwak, aby porównać →
            </p>
          </div>

          {/* Advantages list */}
          <div
            className={`transition-all duration-1000 delay-400 ease-out ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}
          >
            <div className="grid grid-cols-2 gap-3 mb-3">
              <p className="text-center text-[11px] font-bold text-red-500 uppercase tracking-[0.16em] pb-2 border-b border-red-500/40">
                EVA Premium
              </p>
              <p className="text-center text-[11px] font-semibold text-gray-400 uppercase tracking-[0.16em] pb-2 border-b border-white/15">
                Gumowy
              </p>
            </div>

            <div className="space-y-2.5 mb-8">
              {advantages.map((item, i) => (
                <div key={i} className="grid grid-cols-2 gap-3 items-stretch">
                  <div className="flex items-center gap-2.5 min-h-[4.25rem] px-3.5 py-3 rounded-2xl bg-red-600/10 border border-red-500/30">
                    <span className="flex-shrink-0 h-5 w-5 rounded-full bg-red-600 flex items-center justify-center">
                      <svg
                        className="h-3 w-3 text-white"
                        fill="none"
                        viewBox="0 0 12 12"
                        aria-hidden="true"
                      >
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="text-white text-[13px] sm:text-sm font-medium leading-snug text-balance">
                      {item.eva}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 min-h-[4.25rem] px-3.5 py-3 rounded-2xl bg-white/[0.04] border border-white/10">
                    <span className="flex-shrink-0 h-5 w-5 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center">
                      <svg
                        className="h-3 w-3 text-gray-300"
                        fill="none"
                        viewBox="0 0 12 12"
                        aria-hidden="true"
                      >
                        <path
                          d="M3 3l6 6M9 3l-6 6"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    <span className="text-gray-300 text-[13px] sm:text-sm leading-snug text-balance">
                      {item.rubber}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <a
                href="/konfigurator"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                tabIndex={0}
                aria-label="Zamów dywaniki EVA dopasowane do Twojego samochodu"
              >
                Zamów dywaniki EVA
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
