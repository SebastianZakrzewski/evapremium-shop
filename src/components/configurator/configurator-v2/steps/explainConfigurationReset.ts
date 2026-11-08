import type { ConfiguratorState } from "@/features/car-configurator/utils/configuratorState"

const keptChoices = (config: ConfiguratorState): string => {
  const kept: string[] = []
  if (config.structure) kept.push("strukturę komórek")
  if (config.color.trim()) kept.push("kolor materiału")
  if (config.edgeColor.trim()) kept.push("kolor obszycia")
  return kept.length > 0 ? ` Zachowano: ${kept.join(", ")}.` : ""
}

export const explainConfigurationReset = (
  previous: ConfiguratorState,
  next: ConfiguratorState,
): string | null => {
  const sameLabel = (left: string, right: string) =>
    left.trim().toLowerCase() === right.trim().toLowerCase()
  if (!sameLabel(previous.brand, next.brand) || !sameLabel(previous.model, next.model)) {
    return null
  }

  const variantCleared = previous.variant.trim() !== "" && next.variant.trim() === ""
  const matTypeChanged = previous.matType !== next.matType
  if (!variantCleared) return null

  const kept = keptChoices(next)
  if (matTypeChanged) {
    return `Typ dywanika i wariant zestawu zostały zresetowane, ponieważ nie pasują do zmienionego wyboru.${kept}`
  }
  return `Wariant zestawu został zresetowany, ponieważ nie pasuje do zmienionego wyboru.${kept}`
}
