import type { ConfiguratorState } from "@/features/car-configurator/utils/configuratorState"
import {
  isMatCartConfiguration,
  type CartItem,
} from "@/lib/types/cart-new"

const same = (left: string | undefined, right: string | undefined): boolean =>
  (left ?? "").trim().toLowerCase() === (right ?? "").trim().toLowerCase()

/** Same mat configuration already in the cart, regardless of the generated product id. */
export const findMatchingMatInCart = (
  items: readonly CartItem[],
  config: ConfiguratorState,
): CartItem | null => {
  for (const item of items) {
    if (item.productType !== "mat") continue
    if (!isMatCartConfiguration(item.configuration)) continue
    const details = item.configuration.carDetails
    const configuration = item.configuration
    const matches =
      same(details.brand, config.brand) &&
      same(details.model, config.model) &&
      same(details.year, config.year) &&
      same(details.bodyTypeKey, config.bodyTypeKey) &&
      same(configuration.setType, config.matType) &&
      same(configuration.setVariant, config.variant) &&
      same(configuration.cellType, config.structure) &&
      same(configuration.materialColor, config.color) &&
      same(configuration.edgeColor, config.edgeColor)
    if (matches) return item
  }
  return null
}

export const accessoryAlreadyInCart = (
  items: readonly CartItem[],
  accessoryId: string,
  color: string | undefined,
  mounting: string | undefined,
): boolean =>
  items.some((item) => {
    if (item.productType !== "accessory" || item.productId !== accessoryId) {
      return false
    }
    const configuration = item.configuration
    if (!configuration || !("mounting" in configuration)) return false
    return (
      same(configuration.color, color) && same(configuration.mounting, mounting)
    )
  })
