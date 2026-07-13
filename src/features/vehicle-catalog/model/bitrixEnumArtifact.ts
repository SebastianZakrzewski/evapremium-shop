export type BitrixVariantEnumArtifact = {
  meta: {
    field: string
    fetched_at: string
    enum_count: number
    unresolved_count: number
  }
  enums: Array<{ id: number; value: string }>
  variant_labels_pl: Record<string, string>
  by_segment: Record<string, Record<string, number>>
  unresolved: Array<{
    segment: string
    variant_key: string
    polish_label: string
  }>
}
