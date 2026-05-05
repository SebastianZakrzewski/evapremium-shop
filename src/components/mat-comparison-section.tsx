"use client"

import { useState, useEffect } from "react"
import { ImageComparisonSlider } from "@/components/ui/image-comparison-slider-horizontal"

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
      className="py-14 md:py-20 bg-black relative overflow-hidden"
      role="region"
      aria-label="Porównanie dywaników EVA z gumowymi"
    >
      {/* subtle grid bg */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle,_#ffffff_1px,_transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div
          className={`text-center mb-10 transition-all duration-1000 ease-out ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <p className="text-red-500 uppercase tracking-widest text-sm font-semibold mb-3">
            Porównanie
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-5">
            EVA vs <span className="text-gray-400">Gumowe</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Przeciągnij suwak i przekonaj się na własne oczy, dlaczego dywaniki
            EVA to wybór nowej generacji kierowców.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center max-w-7xl mx-auto">
          {/* Slider */}
          <div
            className={`transition-all duration-1000 delay-200 ease-out ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl aspect-[4/5] md:aspect-square cursor-ew-resize">
              <ImageComparisonSlider
                leftImage="/images/eva-mat-comparison.png"
                rightImage="/images/gumowe-mat-comparison.png"
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
            <div className="space-y-4 mb-8">
              {advantages.map((item, i) => (
                <div
                  key={i}
                  className="grid grid-cols-2 gap-3 text-sm"
                >
                  {/* EVA side */}
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-red-600/10 border border-red-600/20">
                    <span className="mt-0.5 flex-shrink-0 h-4 w-4 rounded-full bg-red-600 flex items-center justify-center">
                      <svg
                        className="h-2.5 w-2.5 text-white"
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
                    <span className="text-white font-medium">{item.eva}</span>
                  </div>

                  {/* Rubber side */}
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="mt-0.5 flex-shrink-0 h-4 w-4 rounded-full bg-gray-700 flex items-center justify-center">
                      <svg
                        className="h-2.5 w-2.5 text-gray-400"
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
                    <span className="text-gray-500">{item.rubber}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Column labels */}
            <div className="grid grid-cols-2 gap-3 mb-2">
              <p className="text-center text-xs font-bold text-red-500 uppercase tracking-widest">
                EVA Premium
              </p>
              <p className="text-center text-xs font-semibold text-gray-600 uppercase tracking-widest">
                Gumowy
              </p>
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
