import { pushGtag } from "@/lib/tracking/ga4/gtag"

/**
 * Existing configurator analytics (do not rename or drop):
 *
 * | Source | Name | Params | When |
 * | --- | --- | --- | --- |
 * | usePageView → Facebook | PageView | content_name "Configurator", content_category "Product", page_path, page_title | Pathname change. First load is the pixel/GTM page view. |
 * | GTM-TD2WDGKV | gtm.js / automatic page_view | page_location includes ?etap=1..5 | History change when `etap` is written. |
 * | Legacy Configurator.tsx | view_item via trackViewContent | GA4 view_item + FB ViewContent. product id/name/sku/price/brand/category/configuration | Configuration becomes priced. V2 route had dropped this call. |
 * | useCart.addToCart | add_to_cart | GA4 add_to_cart + FB AddToCart from createAddToCartData (content_name, content_ids, value, currency PLN, contents) | After a line is added. Mat and accessory each fire once. |
 *
 * `etap` query values stay the old step numbers so URL funnels stay comparable.
 * They are written when that step's required choice is made.
 */
export const CONFIGURATOR_STEP_BY_SECTION = {
  vehicle: { etap: 1, stepName: "Samochód", sectionId: "section-vehicle" },
  matType: { etap: 2, stepName: "Dywaniki i zestaw", sectionId: "section-matType" },
  variant: { etap: 2, stepName: "Dywaniki i zestaw", sectionId: "section-zestaw" },
  appearance: { etap: 3, stepName: "Wygląd", sectionId: "section-color" },
  accessories: { etap: 4, stepName: "Akcesoria", sectionId: "section-accessories" },
  summary: { etap: 5, stepName: "Podsumowanie", sectionId: "section-summary" },
} as const

export type ConfiguratorAnalyticsStep = keyof typeof CONFIGURATOR_STEP_BY_SECTION

export const SECTION_VIEW_EVENT = "configurator_section_view"
export const STEP_COMPLETE_EVENT = "configurator_step_complete"

const sectionViewStorageKey = (sectionId: string): string =>
  `configurator_section_view_${sectionId}`

export const trackConfiguratorSectionView = (input: {
  sectionId: string
  sectionName: string
  etap: number
}): void => {
  if (typeof window === "undefined") return
  const key = sectionViewStorageKey(input.sectionId)
  try {
    if (window.sessionStorage.getItem(key)) return
    window.sessionStorage.setItem(key, "1")
  } catch {
    // Private mode still emits the event for this page.
  }
  pushGtag("event", SECTION_VIEW_EVENT, {
    section_id: input.sectionId,
    section_name: input.sectionName,
    etap: input.etap,
  })
}

export const trackConfiguratorStepComplete = (
  step: ConfiguratorAnalyticsStep,
): void => {
  const mapped = CONFIGURATOR_STEP_BY_SECTION[step]
  pushGtag("event", STEP_COMPLETE_EVENT, {
    etap: mapped.etap,
    step_name: mapped.stepName,
    section_id: mapped.sectionId,
  })
}
