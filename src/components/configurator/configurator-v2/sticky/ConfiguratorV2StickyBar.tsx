"use client"

import Link from "next/link"
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react"
import { formatPricePln, formatPriceValue } from "@/lib/utils/formatPrice"
import { CONFIGURATOR_STAGES, configuratorProgressLabel } from "../steps/configuratorStages"

export type PriceBreakdown = {
  basePrice: number
  discount: number
  priceAfterDiscount: number
  totalPrice: number
}

type ConfiguratorV2StickyBarProps = {
  priceBreakdown: PriceBreakdown
  accessoryPrice?: number
  isConfigComplete: boolean
  showBack: boolean
  onBack: () => void
  showForward: boolean
  forwardDisabled: boolean
  forwardDisabledReason?: string | null
  onForward: () => void
  onPriceClick?: () => void
  currentStage?: number
  stageCount?: number
  /** header: pasek górny desktopu; fixed: dół mobile; column: zgodność testów */
  variant?: "column" | "fixed" | "header"
}

const forwardButtonClassName =
  "inline-flex h-8 min-h-8 min-w-8 flex-1 items-center justify-center rounded-full bg-red-600 px-3 text-xs font-medium text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"

const headerForwardButtonClassName =
  "inline-flex h-12 min-w-[9.5rem] items-center justify-center gap-2 rounded-full bg-red-600 px-6 text-[15px] font-semibold text-white shadow-lg shadow-black/40 transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-70"

const backButtonClassName =
  "inline-flex h-8 min-h-8 min-w-8 flex-1 items-center justify-center rounded-full border border-white/15 bg-transparent px-3 text-xs font-medium text-white transition-colors hover:bg-white/10"

const headerBackButtonClassName =
  "inline-flex min-h-11 min-w-11 flex-1 items-center justify-center rounded-full border border-white/15 bg-transparent px-4 text-[13px] font-medium text-white transition-colors hover:bg-white/10 lg:flex-none"

export const ConfiguratorV2StickyBar = ({
  priceBreakdown,
  accessoryPrice = 0,
  isConfigComplete,
  showBack,
  onBack,
  showForward,
  forwardDisabled,
  forwardDisabledReason = null,
  onForward,
  onPriceClick,
  currentStage = 1,
  stageCount = CONFIGURATOR_STAGES.length,
  variant = "fixed",
}: ConfiguratorV2StickyBarProps) => {
  const totalWithAccessories = priceBreakdown.totalPrice + accessoryPrice
  const hasPrice = priceBreakdown.totalPrice > 0
  const isHeader = variant === "header"
  const reasonId = `configurator-forward-hint-${variant}`
  const reason = showForward && forwardDisabled ? forwardDisabledReason : null
  const progressLabel = configuratorProgressLabel(currentStage, stageCount)

  const progress = (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={stageCount}
      aria-valuenow={currentStage}
      aria-label={progressLabel}
      className={`flex min-w-0 items-center ${isHeader ? "gap-2" : "gap-1.5"}`}
    >
      <span
        className={`shrink-0 font-medium leading-none text-white/80 ${
          isHeader ? "text-[11px]" : "text-[10px]"
        }`}
        aria-hidden
      >
        {progressLabel}
      </span>
      <span className="flex min-w-0 flex-1 gap-1" aria-hidden>
        {Array.from({ length: stageCount }, (_, index) => {
          const step = index + 1
          const reached = step <= currentStage
          return (
            <span
              key={step}
              data-progress-segment={step}
              data-reached={reached ? "true" : "false"}
              className={`${isHeader ? "h-1 min-w-[1.25rem]" : "h-0.5 min-w-2"} flex-1 rounded-full ${
                reached ? "bg-red-600" : "bg-white/25"
              }`}
            />
          )
        })}
      </span>
    </div>
  )

  const priceBlock = (
    <button
      type="button"
      onClick={onPriceClick}
      disabled={!hasPrice}
      className={`flex min-w-0 flex-col text-left disabled:opacity-50 ${
        isHeader ? "items-end" : "items-start"
      }`}
      aria-label="Rozbij cenę"
    >
      {hasPrice ? (
        <>
          <span className="flex items-center gap-1.5">
            <span className="text-sm font-medium tabular-nums tracking-tight text-green-400 lg:text-xl">
              {formatPricePln(totalWithAccessories)}
            </span>
            {onPriceClick && (
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-white/35" aria-hidden />
            )}
          </span>
          {priceBreakdown.discount > 0 && (
            <span className="text-[11px] leading-tight text-white/45">
              Rabat: -{formatPriceValue(priceBreakdown.discount)} zł
            </span>
          )}
          {!isConfigComplete && (
            <span className="mt-0.5 hidden text-[10px] leading-tight text-white/45 sm:block">
              Uzupełnij konfigurację
            </span>
          )}
        </>
      ) : (
        <span className="text-xs leading-tight text-white/50 lg:text-sm">
          Wybierz wariant aby zobaczyć cenę
        </span>
      )}
    </button>
  )

  const navigation = (
    <div className={`flex min-w-0 items-center gap-2 ${isHeader ? "" : "w-full"}`}>
      {showBack && (
        <button
          type="button"
          onClick={onBack}
          className={isHeader ? headerBackButtonClassName : backButtonClassName}
        >
          Wstecz
        </button>
      )}
      {showForward && (
        <button
          type="button"
          onClick={onForward}
          disabled={forwardDisabled}
          className={isHeader ? headerForwardButtonClassName : forwardButtonClassName}
          aria-describedby={reason ? reasonId : undefined}
        >
          Dalej
          {isHeader && <ChevronRight className="h-4 w-4" aria-hidden />}
        </button>
      )}
    </div>
  )

  if (isHeader) {
    return (
      <div
        className="relative flex w-full flex-col gap-2 bg-black px-4 py-3 xl:px-6"
        data-variant={variant}
      >
        {progress}
        <div className="flex w-full items-center justify-between gap-4">
          <Link
            href="/modele"
            aria-label="Zmień model"
            className="inline-flex min-h-11 items-center gap-2 text-[13px] font-medium text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            <span>Zmień model</span>
          </Link>
          <div className="flex min-w-0 flex-col items-end gap-1">
            <div className="flex min-w-0 items-center justify-end gap-3">
              {priceBlock}
              {navigation}
            </div>
            {reason && (
              <p id={reasonId} className="max-w-sm text-right text-[12px] leading-snug text-white/80">
                {reason}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative w-full border-t border-white/[0.08] bg-black/80 backdrop-blur-2xl"
      data-variant={variant}
    >
      <div className="flex flex-col gap-1 px-3 py-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
        <div className="flex min-w-0 items-center gap-3">
          {hasPrice && <div className="shrink-0">{priceBlock}</div>}
          <div className="min-w-0 flex-1">{progress}</div>
        </div>
        {!hasPrice && !reason && priceBlock}
        {reason && (
          <p id={reasonId} className="text-[13px] font-medium leading-tight text-white/90">
            {reason}
          </p>
        )}
        {(showBack || showForward) && navigation}
      </div>
    </div>
  )
}
