"use client"

import { useState, useEffect } from "react"
import { CheckCircle, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"

type ProcessStep = {
  id: number
  title: string
  day: string
  image?: string
  overlayTitle?: string
  overlayDescription?: string
}

const processSteps: ProcessStep[] = [
  {
    id: 1,
    title: "Przyjęcie zamówienia",
    day: "Dzień 1",
    image: "/realizacja/przyjecie_zamowienia.png",
    overlayTitle: "Start produkcji",
    overlayDescription:
      "Każde zamówienie jest weryfikowane i przygotowywane do realizacji na miarę Twojego auta.",
  },
  {
    id: 2,
    title: "Weryfikacja modelu",
    day: "Dzień 2",
    image: "/realizacja/weryfikacja_modelu.png",
    overlayTitle: "Dopasowanie wzoru",
    overlayDescription:
      "Sprawdzamy model samochodu i dopasowujemy szablon z dokładnością do milimetra.",
  },
  {
    id: 3,
    title: "Cięcie dywaników",
    day: "Dzień 3",
    image: "/realizacja/ciecie_dywanika.png",
    overlayTitle: "Precyzyjne cięcie",
    overlayDescription:
      "Materiał EVA jest cięty według indywidualnego wzoru dla Twojego pojazdu.",
  },
  {
    id: 4,
    title: "Szycie",
    day: "Dzień 6",
    image: "/realizacja/szycie.png",
    overlayTitle: "Precyzja wykonania",
    overlayDescription:
      "Każdy szew jest kontrolowany, aby zapewnić maksymalną trwałość i estetykę.",
  },
  {
    id: 5,
    title: "Formowanie 3D",
    day: "Dzień 9",
    image: "/realizacja/formowanie_3d.png",
    overlayTitle: "Formowanie 3D",
    overlayDescription:
      "Dywaniki nabierają kształtu dopasowanego do podłogi Twojego samochodu.",
  },
  {
    id: 6,
    title: "Kontrola jakości",
    day: "Dzień 12",
    image: "/realizacja/kontrola_jakosci.png",
    overlayTitle: "Kontrola jakości",
    overlayDescription:
      "Każdy zestaw przechodzi szczegółową kontrolę przed wysyłką do klienta.",
  },
  {
    id: 7,
    title: "Wysyłka",
    day: "Dzień 14",
    image: "/realizacja/wysylka.png",
    overlayTitle: "Gotowe do wysyłki",
    overlayDescription:
      "Twój zestaw dywaników jest pakowany i wysyłany prosto pod Twoje drzwi.",
  },
]

const TOTAL_STEPS = processSteps.length

export default function CustomFitSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeStep, setActiveStep] = useState(1)
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1)

  const activeStepData =
    processSteps.find((step) => step.id === activeStep) ?? processSteps[0]

  const handleStepClick = (stepId: number) => {
    if (stepId === activeStep) return
    setSlideDirection(stepId > activeStep ? 1 : -1)
    setActiveStep(stepId)
  }

  const handlePrevStep = () => {
    setSlideDirection(-1)
    setActiveStep((current) => (current === 1 ? TOTAL_STEPS : current - 1))
  }

  const handleNextStep = () => {
    setSlideDirection(1)
    setActiveStep((current) => (current === TOTAL_STEPS ? 1 : current + 1))
  }

  const handleStepKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    stepId: number
  ) => {
    if (event.key !== "Enter" && event.key !== " ") return
    event.preventDefault()
    handleStepClick(stepId)
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

    const section = document.getElementById("custom-fit-section")
    if (section) {
      observer.observe(section)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="custom-fit-section"
      className="py-10 md:py-14 bg-black relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-bl from-red-900/5 via-black to-black pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div
          className={`text-center mb-8 md:mb-12 transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <h2
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight break-words px-2 transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            style={{ transitionDelay: isVisible ? "200ms" : "0ms" }}
          >
            Szyte na miarę do{" "}
            <span className="text-red-500">Twojego auta</span>
          </h2>
          <p
            className={`text-sm sm:text-base md:text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed px-2 transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            style={{ transitionDelay: isVisible ? "400ms" : "0ms" }}
          >
            Każdy dywanik jest precyzyjnie dopasowany do konkretnego modelu
            samochodu z dokładnością do milimetra. Nasz proces produkcyjny
            gwarantuje idealne pokrycie podłogi i perfekcyjne dopasowanie.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
          <div
            className={`order-2 lg:order-1 transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}
          >
            <div className="space-y-8">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Proces realizacji
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Od momentu zamówienia do wysyłki, Twój zestaw przechodzi
                  przez 7-etapowy proces produkcji, zapewniający najwyższą
                  jakość wykonania.
                </p>
              </div>

              <div className="space-y-3" role="tablist" aria-label="Etapy realizacji">
                {processSteps.map((step, index) => {
                  const isActive = activeStep === step.id

                  return (
                    <div
                      key={step.id}
                      role="tab"
                      tabIndex={0}
                      aria-selected={isActive}
                      aria-label={`Etap ${step.id}: ${step.title}, ${step.day}`}
                      className={`
                        group flex items-center p-4 rounded-2xl border cursor-pointer
                        transition-all duration-500
                        ${isActive ? "bg-white/10 border-red-500/40 shadow-lg shadow-red-900/20" : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"}
                        ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}
                      `}
                      style={{ transitionDelay: `${800 + index * 300}ms` }}
                      onClick={() => handleStepClick(step.id)}
                      onKeyDown={(event) => handleStepKeyDown(event, step.id)}
                    >
                      <div
                        className={`
                          text-lg font-bold mr-6 w-8 text-right transition-colors duration-300 font-mono
                          ${isActive ? "text-red-500" : "text-gray-400 group-hover:text-gray-300"}
                        `}
                      >
                        0{step.id}
                      </div>
                      <div className="flex-1">
                        <h4
                          className={`font-semibold transition-colors duration-300 ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-300"}`}
                        >
                          {step.title}
                        </h4>
                      </div>
                      <div
                        className={`
                          text-xs uppercase tracking-wider font-medium transition-colors duration-300
                          ${isActive ? "text-red-400" : "text-gray-500 group-hover:text-gray-400"}
                        `}
                      >
                        {step.day}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="pt-6">
                <button
                  onClick={() => {
                    const element = document.getElementById("products")
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth", block: "start" })
                    }
                  }}
                  className="
                    bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600
                    text-white font-bold uppercase tracking-wide py-4 px-8 rounded-full
                    shadow-xl shadow-red-900/30 hover:shadow-2xl hover:shadow-red-600/20
                    transition-all duration-300 transform hover:scale-105 active:scale-95
                    flex items-center gap-2 min-h-[44px]
                  "
                >
                  Zamów do swojego auta
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div
            className={`order-1 lg:order-2 transition-all duration-1000 ease-out delay-200 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}
          >
            <div className="relative group">
              <div className="relative bg-white/5 backdrop-blur-md rounded-3xl p-2 border border-white/10 shadow-2xl shadow-black/50 overflow-hidden group-hover:border-red-500/20 transition-all duration-500">
                <div
                  className="relative rounded-2xl overflow-hidden aspect-[4/5] lg:aspect-[3/4] bg-[#111]"
                  role="tabpanel"
                  aria-label={`Etap ${activeStepData.id}: ${activeStepData.title}`}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={activeStep}
                      initial={{ opacity: 0, x: slideDirection * 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: slideDirection * -40 }}
                      transition={{ duration: 0.45, ease: "easeInOut" }}
                      className="absolute inset-0"
                    >
                      {activeStepData.image ? (
                        <Image
                          src={activeStepData.image}
                          alt={`${activeStepData.title} - ${activeStepData.day}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority={activeStepData.id === 1}
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 via-black to-neutral-950 p-8 text-center">
                          <span className="text-5xl font-bold font-mono text-red-500/30 mb-4">
                            0{activeStepData.id}
                          </span>
                          <p className="text-white text-xl font-semibold mb-2">
                            {activeStepData.title}
                          </p>
                          <p className="text-gray-500 text-sm uppercase tracking-wider">
                            {activeStepData.day}
                          </p>
                          <p className="text-gray-600 text-sm mt-6 max-w-xs">
                            Zdjęcie tego etapu wkrótce
                          </p>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`overlay-${activeStep}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="absolute bottom-0 left-0 p-8 pointer-events-none"
                    >
                      <div className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-wider text-sm mb-2">
                        <CheckCircle className="w-4 h-4" />
                        {activeStepData.overlayTitle}
                      </div>
                      <p className="text-white text-lg font-medium leading-relaxed">
                        {activeStepData.overlayDescription}
                      </p>
                    </motion.div>
                  </AnimatePresence>

                  <button
                    type="button"
                    onClick={handlePrevStep}
                    aria-label="Poprzedni etap"
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm border border-white/10 hover:bg-red-600/80 hover:border-red-500/50 transition-all duration-300"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    aria-label="Następny etap"
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm border border-white/10 hover:bg-red-600/80 hover:border-red-500/50 transition-all duration-300"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>

                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                    {processSteps.map((step) => (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => handleStepClick(step.id)}
                        aria-label={`Przejdź do etapu ${step.id}: ${step.title}`}
                        className={`
                          h-1.5 rounded-full transition-all duration-300
                          ${activeStep === step.id ? "w-6 bg-red-500" : "w-1.5 bg-white/30 hover:bg-white/50"}
                        `}
                      />
                    ))}
                  </div>
                </div>

                <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                  <div className="absolute inset-0 transform -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
