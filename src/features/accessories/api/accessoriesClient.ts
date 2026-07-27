import type { Accessory, AccessoryCategory } from '@/lib/types'

type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: string
}

const parseResponse = async <T>(response: Response): Promise<T> => {
  const json = (await response.json()) as ApiResponse<T>

  if (!response.ok || !json.success || json.data === undefined) {
    throw new Error(json.error || `Request failed with status ${response.status}`)
  }

  return json.data
}

export const fetchAccessories = async (): Promise<Accessory[]> => {
  const response = await fetch('/api/accessories')
  return parseResponse<Accessory[]>(response)
}

export const fetchAccessoryCategories = async (): Promise<AccessoryCategory[]> => {
  const response = await fetch('/api/accessories/categories')
  return parseResponse<AccessoryCategory[]>(response)
}

export const fetchAccessoriesByCategory = async (categorySlug: string): Promise<Accessory[]> => {
  const response = await fetch(`/api/accessories?category=${encodeURIComponent(categorySlug)}`)
  return parseResponse<Accessory[]>(response)
}

export const fetchAccessoryBySlug = async (slug: string): Promise<Accessory | null> => {
  const response = await fetch(`/api/accessories/slug/${encodeURIComponent(slug)}`)

  if (response.status === 404) {
    return null
  }

  return parseResponse<Accessory>(response)
}

export const fetchAccessoryById = async (id: string): Promise<Accessory | null> => {
  const response = await fetch(`/api/accessories/${encodeURIComponent(id)}`)

  if (response.status === 404) {
    return null
  }

  return parseResponse<Accessory>(response)
}
