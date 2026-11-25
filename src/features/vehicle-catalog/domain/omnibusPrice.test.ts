import { describe, expect, it } from "vitest"
import { lowestPriceBeforeReduction } from "./omnibusPrice"

describe("lowestPriceBeforeReduction", () => {
  it("does not treat the struck-through base as the prior price when nothing was recorded", () => {
    expect(
      lowestPriceBeforeReduction({
        sellingPricePln: 440,
        referencePricePln: 550,
        observations: [],
        reductionStartedAt: null,
      }),
    ).toEqual({
      amountPln: 440,
      proven: false,
      referenceWasApplied: false,
    })
  })

  it("uses the lowest listed price in the 30 days before the reduction", () => {
    expect(
      lowestPriceBeforeReduction({
        sellingPricePln: 440,
        referencePricePln: 550,
        reductionStartedAt: "2026-07-01T00:00:00.000Z",
        observations: [
          { pricePln: 467, effectiveAt: "2026-06-10T00:00:00.000Z", kind: "listed_selling" },
          { pricePln: 440, effectiveAt: "2026-06-20T00:00:00.000Z", kind: "listed_selling" },
          { pricePln: 550, effectiveAt: "2026-06-20T00:00:00.000Z", kind: "reference" },
          { pricePln: 400, effectiveAt: "2026-05-01T00:00:00.000Z", kind: "listed_selling" },
        ],
      }),
    ).toEqual({
      amountPln: 440,
      proven: true,
      referenceWasApplied: false,
    })
  })

  it("uses the lowest price since sales started when that is shorter than 30 days", () => {
    expect(
      lowestPriceBeforeReduction({
        sellingPricePln: 231.2,
        referencePricePln: 289,
        reductionStartedAt: "2026-07-20T00:00:00.000Z",
        observations: [
          { pricePln: 250, effectiveAt: "2026-07-05T00:00:00.000Z" },
          { pricePln: 231.2, effectiveAt: "2026-07-12T00:00:00.000Z" },
        ],
      }),
    ).toEqual({
      amountPln: 231.2,
      proven: true,
      referenceWasApplied: false,
    })
  })
})
