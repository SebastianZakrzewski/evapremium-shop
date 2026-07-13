"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchResolvedPricing } from "../api/client"
import type { PricingResolveInput } from "../model/schemas"

export const useResolvedPricing = (
  input: Partial<PricingResolveInput>,
) => {
  const enabled = Boolean(
    input.recordKey &&
      input.year &&
      input.bodyTypeKey,
  )

  return useQuery({
    queryKey: [
      "resolved-pricing",
      input.recordKey,
      input.year,
      input.bodyTypeKey,
      input.matType,
      input.variantKey,
    ],
    queryFn: () => fetchResolvedPricing(input as PricingResolveInput),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}
