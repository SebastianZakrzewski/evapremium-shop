import type { Accessory } from "@/entities/product"

export const MAT_FINISH_PRODUCT_TYPE = "wykonczenie"
export const MAT_FINISH_CATEGORY_SLUG = "wykonczenie-dywanika"

export const isShopAccessory = (accessory: { productType?: string | null }) =>
  accessory.productType === "organizer" || accessory.productType === "podpietka"

export const selectedMatFinishes = (
  accessories: Accessory[],
  selectedIds: string[] | undefined,
): Accessory[] => {
  const ids = new Set(selectedIds ?? [])
  return accessories.filter(
    (accessory) =>
      accessory.productType === MAT_FINISH_PRODUCT_TYPE && ids.has(accessory.id),
  )
}

export const matFinishTotal = (finishes: Pick<Accessory, "price">[]) =>
  finishes.reduce((sum, finish) => sum + finish.price, 0)

export const matFinishCartLines = (finishes: Accessory[]) =>
  finishes.map((finish) => ({
    productType: "accessory" as const,
    productId: finish.id,
    quantity: 1,
    unitPrice: finish.price,
    productName: finish.name,
    productSku: finish.sku,
    productImage: finish.images?.[0] ?? finish.imageSrc ?? "",
  }))
