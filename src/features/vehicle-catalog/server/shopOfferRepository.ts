import type { ShopTemplateOffer } from "../domain/shopTemplateOffer"
import { copyTrunkMatPricesToBothDualTypes } from "../domain/shopTemplateOffer"
import offers from "@/data/shop-template-offers.json"

const shopOffers = offers as Record<string, ShopTemplateOffer>

const offersByPrefix = new Map<string, ShopTemplateOffer>()
for (const [recordKey, offer] of Object.entries(shopOffers)) {
  const prefix = recordKey.split("|").slice(0, 4).join("|")
  if (prefix && !offersByPrefix.has(prefix)) {
    offersByPrefix.set(prefix, offer)
  }
}

export const getShopTemplateOffer = (
  recordKey: string,
): ShopTemplateOffer | null => {
  const offer =
    shopOffers[recordKey] ??
    offersByPrefix.get(recordKey.split("|").slice(0, 4).join("|"))
  if (!offer) return null
  return copyTrunkMatPricesToBothDualTypes(offer)
}
