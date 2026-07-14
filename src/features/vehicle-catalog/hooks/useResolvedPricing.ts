"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchResolvedPricing } from "../api/client"
import { resolveSelectedPricingVariant } from "../domain/resolveSelectedPricingVariant"
import type { PricingResolveInput } from "../model/schemas"

export const useResolvedPricing = (
  input: Partial<PricingResolveInput>,
) => {
  const enabled = Boolean(
    input.recordKey &&
      input.year &&
      input.bodyTypeKey,
  )

  const query = useQuery({
    queryKey: [
      "resolved-pricing",
      input.recordKey,
      input.year,
      input.bodyTypeKey,
      input.matType,
    ],
    queryFn: () =>
      fetchResolvedPricing({
        recordKey: input.recordKey as string,
        year: input.year as number,
        bodyTypeKey: input.bodyTypeKey as string,
        matType: input.matType,
      }),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  const data = useMemo(() => {
    if (!query.data) return undefined

    return {
      ...query.data,
      selectedVariant: resolveSelectedPricingVariant(
        query.data.variants,
        input.variantKey,
      ),
    }
  }, [query.data, input.variantKey])

  return {
    ...query,
    data,
  }
}
