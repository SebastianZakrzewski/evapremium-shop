export type CarContextEnrichment = {
  generation: string | null
  bodyType: string | null
}

export type CarContextGetters = {
  getYearsForModel: (modelName: string) => number[]
  getBodyTypesForYear: (modelName: string, year: number) => string[]
  findGenerationByYear: (modelName: string, year: number) => string | null
}

/**
 * Opcjonalne metadane wejścia (bez roku — rok wybiera klient w konfiguratorze).
 * Typ nadwozia zwracany tylko gdy jednoznaczny dla najnowszego rocznika.
 */
export const enrichCarContextFromModel = (
  modelName: string,
  getters: CarContextGetters
): CarContextEnrichment => {
  if (!modelName) {
    return { generation: null, bodyType: null }
  }

  const years = getters.getYearsForModel(modelName)
  if (years.length === 0) {
    return { generation: null, bodyType: null }
  }

  const referenceYear = years[0]
  const generation = getters.findGenerationByYear(modelName, referenceYear)
  const bodyTypes = getters.getBodyTypesForYear(modelName, referenceYear)

  return {
    generation,
    bodyType: bodyTypes.length === 1 ? bodyTypes[0] : null,
  }
}
