import type { ProductEntryLock } from "@/features/car-configurator/utils/productEntryContext"
import type { ConfiguratorState } from "@/features/car-configurator/utils/configuratorState"

export const resolveVehiclePreviewContext = (
  config: ConfiguratorState,
  productEntry: Pick<
    ProductEntryLock,
    "isLocked" | "bodyTypeParam" | "generationParam" | "brandParam" | "modelParam"
  >,
) => {
  const bodyType = config.bodyType || productEntry.bodyTypeParam || ""
  const generation = config.generation || productEntry.generationParam || ""
  const brand = config.brand || productEntry.brandParam || ""
  const model = config.model || productEntry.modelParam || ""

  // Podgląd realizacji od razu po wyborze generacji (modelKey) —
  // bez czekania na rocznik / nadwozie.
  const isVehiclePreviewReady = !!(
    brand &&
    model &&
    (config.modelKey || generation || productEntry.isLocked)
  )

  return {
    bodyType,
    generation,
    brand,
    model,
    isVehiclePreviewReady,
  }
}
