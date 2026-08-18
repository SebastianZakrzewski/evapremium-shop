import { foldShopText, slugShopText } from "./shopSetMapping"

export type ShopModelRef = {
  brandKey: string
  brandName: string
  modelKey: string
  modelName: string
  modelFamilyName?: string | null
  yearRange?: string | null
}

export type TemplateJoinInput = {
  recordKey: string
  brandName: string
  modelName: string
  generation: string
}

export type ShopModelIndex = {
  models: ShopModelRef[]
  byBrandModelYear: Map<string, number[]>
  byBrandModel: Map<string, number[]>
  byNameYear: Map<string, number[]>
  byFamilyYear: Map<string, number[]>
}

export const parseYearsFromRange = (
  text: string,
): [number | null, number | null] => {
  const nums = [...(text || "").matchAll(/(?:19|20)\d{2}/g)].map((match) =>
    Number(match[0]),
  )
  if (nums.length === 0) return [null, null]
  return [nums[0], nums[nums.length - 1]]
}

export const yearsOverlap = (left: string, right: string): boolean => {
  const [a0, a1] = parseYearsFromRange(left)
  const [b0, b1] = parseYearsFromRange(right)
  if (a0 == null || a1 == null || b0 == null || b1 == null) {
    return foldShopText(left) === foldShopText(right) && Boolean(left)
  }
  return !(a1 < b0 || b1 < a0)
}

export const parseRecordKeyParts = (
  recordKey: string,
): { brandKey: string; modelKey: string; yearRange: string } => {
  const parts = (recordKey || "").split("|")
  return {
    brandKey: parts[1] || "",
    modelKey: parts[2] || "",
    yearRange: parts[3] || "",
  }
}

const BRAND_ALIAS_GROUPS: string[][] = [
  ["alfa", "alfa_romeo"],
  ["aston", "aston_martin"],
  ["mercedes", "mercedes_benz"],
  ["land", "land_rover"],
  ["great_wall", "greatwall"],
  ["ssangyong", "ssang_yong"],
  ["rolls", "rolls_royce"],
]

export const brandAliasSlugs = (
  brandKey: string,
  brandName: string,
): string[] => {
  const slugs = new Set<string>(
    [slugShopText(brandKey), slugShopText(brandName)].filter(Boolean),
  )
  const nameSlug = slugShopText(brandName)
  const firstToken = nameSlug.split("_")[0]
  if (firstToken) slugs.add(firstToken)
  for (const group of BRAND_ALIAS_GROUPS) {
    if (group.some((alias) => slugs.has(alias))) {
      group.forEach((alias) => slugs.add(alias))
    }
  }
  return [...slugs]
}

export const modelKeysCompatible = (left: string, right: string): boolean => {
  const a = slugShopText(left)
  const b = slugShopText(right)
  if (!a || !b) return false
  if (a === b) return true
  if (a.endsWith(`_${b}`) || b.endsWith(`_${a}`)) return true
  const core = (value: string) =>
    value.replace(/_\d+_gen$/, "").replace(/_gen$/, "")
  if (core(a) === core(b)) return true
  const fingerprint = (value: string) =>
    value
      .replace(/polift|przedlift|sportback|liftback/g, "")
      .replace(/_gen/g, "")
      .replace(/_/g, "")
      .replace(/\d+$/g, "")
  const fa = fingerprint(a)
  const fb = fingerprint(b)
  return fa.length >= 4 && fa === fb
}

const tupleKey = (...parts: string[]): string => parts.join("\u0001")

const namesCompatible = (left: string, right: string): boolean => {
  const a = foldShopText(left)
  const b = foldShopText(right)
  if (!a || !b) return false
  if (a === b) return true
  return a.includes(b) || b.includes(a)
}

export const indexShopModels = (models: ShopModelRef[]): ShopModelIndex => {
  const byBrandModelYear = new Map<string, number[]>()
  const byBrandModel = new Map<string, number[]>()
  const byNameYear = new Map<string, number[]>()
  const byFamilyYear = new Map<string, number[]>()

  const push = (map: Map<string, number[]>, key: string, idx: number) => {
    const list = map.get(key)
    if (list) list.push(idx)
    else map.set(key, [idx])
  }

  models.forEach((model, idx) => {
    push(
      byBrandModelYear,
      tupleKey(
        slugShopText(model.brandKey),
        slugShopText(model.modelKey),
        foldShopText(model.yearRange || ""),
      ),
      idx,
    )
    push(
      byBrandModel,
      tupleKey(slugShopText(model.brandKey), slugShopText(model.modelKey)),
      idx,
    )
    push(
      byNameYear,
      tupleKey(
        slugShopText(model.brandName),
        slugShopText(model.modelName),
        foldShopText(model.yearRange || ""),
      ),
      idx,
    )
    push(
      byFamilyYear,
      tupleKey(
        slugShopText(model.brandName),
        slugShopText(model.modelFamilyName || ""),
        foldShopText(model.yearRange || ""),
      ),
      idx,
    )
  })

  return {
    models,
    byBrandModelYear,
    byBrandModel,
    byNameYear,
    byFamilyYear,
  }
}

const choose = (
  index: ShopModelIndex,
  ids: number[] | undefined,
  template: TemplateJoinInput,
): ShopModelRef | null => {
  if (!ids?.length) return null
  if (ids.length === 1) return index.models[ids[0]]

  const scored = ids.map((id) => {
    const item = index.models[id]
    let score = 0
    if (foldShopText(item.yearRange || "") === foldShopText(template.generation)) {
      score += 5
    } else if (yearsOverlap(item.yearRange || "", template.generation)) {
      score += 2
    }
    if (slugShopText(item.modelName) === slugShopText(template.modelName)) score += 3
    if (modelKeysCompatible(item.modelKey, parseRecordKeyParts(template.recordKey).modelKey)) {
      score += 3
    }
    if (namesCompatible(item.modelName, template.modelName)) score += 2
    return { score, id }
  })
  scored.sort((a, b) => b.score - a.score)
  return index.models[scored[0].id]
}

export const matchShopModel = (
  index: ShopModelIndex,
  template: TemplateJoinInput,
): ShopModelRef | null => {
  const { brandKey, modelKey } = parseRecordKeyParts(template.recordKey)
  const brandSlugs = brandAliasSlugs(brandKey, template.brandName)
  const modelSlug = slugShopText(modelKey)
  const generationFold = foldShopText(template.generation)
  const modelNameSlug = slugShopText(template.modelName)

  for (const slug of brandSlugs) {
    const exact = choose(
      index,
      index.byBrandModelYear.get(tupleKey(slug, modelSlug, generationFold)),
      template,
    )
    if (exact) return exact
  }

  for (const slug of brandSlugs) {
    const byName = choose(
      index,
      index.byNameYear.get(tupleKey(slug, modelNameSlug, generationFold)),
      template,
    )
    if (byName) return byName
  }

  for (const slug of brandSlugs) {
    const byModel = choose(
      index,
      index.byBrandModel.get(tupleKey(slug, modelSlug)),
      template,
    )
    if (byModel) return byModel
  }

  const familyIds: number[] = []
  for (const [key, ids] of index.byFamilyYear.entries()) {
    const [familyBrand, familyName, familyYear] = key.split("\u0001")
    if (!brandSlugs.includes(familyBrand)) continue
    if (familyName && modelNameSlug.includes(familyName)) {
      if (
        yearsOverlap(familyYear, template.generation) ||
        foldShopText(familyYear) === generationFold
      ) {
        familyIds.push(...ids)
      }
    }
  }
  const familyHit = choose(index, familyIds, template)
  if (familyHit) return familyHit

  const looseIds: number[] = []
  index.models.forEach((model, idx) => {
    const shopBrands = brandAliasSlugs(model.brandKey, model.brandName || "")
    if (!brandSlugs.some((slug) => shopBrands.includes(slug))) return
    const yearOk =
      yearsOverlap(model.yearRange || "", template.generation) ||
      foldShopText(model.yearRange || "") === generationFold
    if (!yearOk) return
    if (
      modelKeysCompatible(model.modelKey, modelKey) ||
      namesCompatible(model.modelName, template.modelName) ||
      namesCompatible(model.modelFamilyName || "", template.modelName)
    ) {
      looseIds.push(idx)
    }
  })
  return choose(index, looseIds, template)
}
