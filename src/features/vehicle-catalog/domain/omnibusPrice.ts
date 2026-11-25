const DAY_MS = 24 * 60 * 60 * 1000

export type ListedPriceObservation = {
  pricePln: number
  effectiveAt: string | Date
  /** listed_selling was offered or charged. reference is only the struck-through base. */
  kind?: "listed_selling" | "reference"
}

export type OmnibusPrice = {
  amountPln: number
  /** True when the amount is the lowest listed or charged price in the 30 days before the reduction, or since sales started if that period is shorter. */
  proven: boolean
  /** True when the struck-through reference price itself was listed or charged in that window. */
  referenceWasApplied: boolean
}

const roundMoney = (value: number): number => Math.round(value * 100) / 100

const asTime = (value: string | Date): number =>
  (value instanceof Date ? value : new Date(value)).getTime()

/**
 * Lowest price applied before a reduction.
 * Without a recorded reduction date, or without any earlier listed/charged price,
 * the only honest amount is the current selling price and `proven` stays false.
 */
export const lowestPriceBeforeReduction = ({
  sellingPricePln,
  referencePricePln,
  observations,
  reductionStartedAt,
}: {
  sellingPricePln: number
  referencePricePln: number
  observations: ListedPriceObservation[]
  reductionStartedAt: string | Date | null
}): OmnibusPrice => {
  const selling = roundMoney(sellingPricePln)
  const reference = roundMoney(referencePricePln)
  const unproven: OmnibusPrice = {
    amountPln: selling,
    proven: false,
    referenceWasApplied: false,
  }

  const listed = observations
    .filter((item) => item.kind !== "reference")
    .map((item) => ({ price: roundMoney(item.pricePln), at: asTime(item.effectiveAt) }))
    .filter((item) => Number.isFinite(item.at))
    .sort((left, right) => left.at - right.at)

  if (reductionStartedAt == null || listed.length === 0) return unproven

  const reductionAt = asTime(reductionStartedAt)
  if (!Number.isFinite(reductionAt)) return unproven

  const before = listed.filter((item) => item.at < reductionAt)
  if (before.length === 0) return unproven

  const windowStart = reductionAt - 30 * DAY_MS
  const effectiveStart = Math.max(windowStart, before[0].at)
  const inWindow = before.filter((item) => item.at >= effectiveStart)
  const sample = inWindow.length > 0 ? inWindow : before
  const amount = sample.reduce((min, item) => Math.min(min, item.price), sample[0].price)

  return {
    amountPln: roundMoney(amount),
    proven: inWindow.length > 0,
    referenceWasApplied: sample.some((item) => Math.abs(item.price - reference) < 0.05),
  }
}
