import { normalizeBodyTypeKey } from '@/shared'

export type ModelCardIdentity = {
  brand: string
  model: string
  generation: string
  bodyType: string
}

export type ModelCardQuery = {
  brand: string
  model: string
  generation: string
  bodyType: string
}

export type ModelCardMatch = {
  name: string
  modelFamilyKey?: string
  generation?: string | null
  generationDisplay?: string | null
  bodyType?: string | null
  bodyTypeDisplay?: string | null
}

export const EVA_MODEL_CARD_URL =
  'https://www.evapremium.pl/modele?brand={brand_key}&model={model_family_key}&generation={generation}&bodyType={body_type_key}'

export const modelCardSlug = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const readQueryValue = (value: string | null): string => {
  const trimmed = value?.trim() ?? ''
  if (!trimmed || trimmed.includes('{') || trimmed.includes('}')) {
    return ''
  }
  return trimmed
}

export const readModelCardQuery = (params: { get(name: string): string | null }): ModelCardQuery => ({
  brand: readQueryValue(params.get('brand')),
  model: readQueryValue(params.get('model')),
  generation: readQueryValue(params.get('generation')),
  bodyType: readQueryValue(params.get('bodyType')),
})

export const isPinnedModelCard = (query: ModelCardQuery): boolean =>
  Boolean(query.brand && query.model && query.generation && query.bodyType)

export const shouldPinShopChrome = (pathname: string, query: ModelCardQuery): boolean =>
  pathname === '/modele' && isPinnedModelCard(query)

export const buildModelCardPath = (card: ModelCardIdentity, basePath = '/modele'): string => {
  const params = new URLSearchParams()
  const entries: Array<[string, string]> = [
    ['brand', card.brand],
    ['model', card.model],
    ['generation', card.generation],
    ['bodyType', card.bodyType],
  ]

  entries.forEach(([key, value]) => {
    const slug = modelCardSlug(value)
    if (slug) {
      params.set(key, slug)
    }
  })

  const search = params.toString()
  return search ? `${basePath}?${search}` : basePath
}

const slugEquals = (value: string, query: string): boolean => modelCardSlug(value) === modelCardSlug(query)

const matchesAny = (values: Array<string | null | undefined>, query: string): boolean =>
  values.some((value) => Boolean(value) && slugEquals(value as string, query))

export const matchesModelCardQuery = (card: ModelCardMatch, query: ModelCardQuery): boolean => {
  if (query.model && !matchesAny([card.modelFamilyKey, card.name], query.model)) {
    return false
  }

  if (query.generation && !matchesAny([card.generation, card.generationDisplay], query.generation)) {
    return false
  }

  if (query.bodyType) {
    const bodyMatch =
      matchesAny([card.bodyType, card.bodyTypeDisplay], query.bodyType) ||
      normalizeBodyTypeKey(card.bodyType ?? '') === normalizeBodyTypeKey(query.bodyType)
    if (!bodyMatch) {
      return false
    }
  }

  return true
}
