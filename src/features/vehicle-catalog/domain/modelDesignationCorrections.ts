import type { MatTemplateDbRow } from "../server/repository"

const BMW_X5_M_G05_ALIAS = "X5 M(G05) 4 gen"
const BMW_X5_M_F95 = "X5 M (F95) 3 gen"

export const MODEL_DESIGNATION_CORRECTIONS: Readonly<Record<string, string>> = {
  [BMW_X5_M_G05_ALIAS]: BMW_X5_M_F95,
}

export const canonicalizeModelDesignation = (value: string): string =>
  MODEL_DESIGNATION_CORRECTIONS[value.trim()] ?? value

const isAliasDesignation = (value: string): boolean =>
  Object.prototype.hasOwnProperty.call(
    MODEL_DESIGNATION_CORRECTIONS,
    value.trim(),
  )

const rowMatchesDesignation = (row: MatTemplateDbRow, designation: string): boolean => {
  const token = designation.trim().toLowerCase()
  return (
    row.model_name.trim().toLowerCase() === token ||
    row.model_family_name.trim().toLowerCase() === token ||
    row.model_key.trim().toLowerCase() === token ||
    row.model_family_key.trim().toLowerCase() === token
  )
}

export const applyModelDesignationCorrection = (
  row: MatTemplateDbRow,
): MatTemplateDbRow => {
  const modelName = canonicalizeModelDesignation(row.model_name)
  const modelFamilyName = canonicalizeModelDesignation(row.model_family_name)
  const modelKey = canonicalizeModelDesignation(row.model_key)
  const modelFamilyKey = canonicalizeModelDesignation(row.model_family_key)

  if (
    modelName === row.model_name &&
    modelFamilyName === row.model_family_name &&
    modelKey === row.model_key &&
    modelFamilyKey === row.model_family_key
  ) {
    return row
  }

  return {
    ...row,
    model_name: modelName,
    model_key: modelKey,
    model_family_name: modelFamilyName,
    model_family_key: modelFamilyKey,
  }
}

export const resolveCatalogTemplateRows = (
  rows: MatTemplateDbRow[],
): MatTemplateDbRow[] => {
  const withoutSupersededAliases = rows.filter((row) => {
    if (!isAliasDesignation(row.model_name) && !isAliasDesignation(row.model_family_name)) {
      return true
    }

    const canonical =
      MODEL_DESIGNATION_CORRECTIONS[row.model_name.trim()] ??
      MODEL_DESIGNATION_CORRECTIONS[row.model_family_name.trim()]
    if (!canonical) return true

    return !rows.some((candidate) => rowMatchesDesignation(candidate, canonical))
  })

  return withoutSupersededAliases.map(applyModelDesignationCorrection)
}
