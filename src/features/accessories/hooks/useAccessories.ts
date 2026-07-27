import { useState, useEffect, useCallback } from 'react'
import { Accessory, AccessoryCategory, AccessoryFilters } from '@/lib/types'
import {
  fetchAccessories,
  fetchAccessoryById,
  fetchAccessoryBySlug,
  fetchAccessoryCategories,
  fetchAccessoriesByCategory,
} from '@/features/accessories/api/accessoriesClient'
import { debugLog } from '@/lib/config/features'

export interface UseAccessoriesReturn {
  accessories: Accessory[]
  categories: AccessoryCategory[]
  isLoading: boolean
  error: string | null
  getAccessoriesByCategory: (categorySlug: string) => Promise<Accessory[]>
  getAccessoryBySlug: (slug: string) => Promise<Accessory | null>
  getAllCategories: () => Promise<AccessoryCategory[]>
  refetch: () => void
}

export function useAccessories(_filters?: AccessoryFilters): UseAccessoriesReturn {
  const [accessories, setAccessories] = useState<Accessory[]>([])
  const [categories, setCategories] = useState<AccessoryCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAllAccessories = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      debugLog('useAccessories: Fetching all accessories')

      const fetchedAccessories = await fetchAccessories()
      setAccessories(fetchedAccessories)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch accessories'
      setError(errorMessage)
      console.error('useAccessories: Error fetching accessories:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getAllCategories = useCallback(async (): Promise<AccessoryCategory[]> => {
    try {
      setIsLoading(true)
      setError(null)

      const fetchedCategories = await fetchAccessoryCategories()
      setCategories(fetchedCategories)
      return fetchedCategories
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories'
      setError(errorMessage)
      console.error('useAccessories: Error fetching categories:', err)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getAccessoriesByCategory = useCallback(async (categorySlug: string): Promise<Accessory[]> => {
    try {
      setIsLoading(true)
      setError(null)

      return await fetchAccessoriesByCategory(categorySlug)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch accessories by category'
      setError(errorMessage)
      console.error('useAccessories: Error fetching accessories by category:', err)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getAccessoryBySlug = useCallback(async (slug: string): Promise<Accessory | null> => {
    try {
      setIsLoading(true)
      setError(null)

      return await fetchAccessoryBySlug(slug)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch accessory by slug'
      setError(errorMessage)
      console.error('useAccessories: Error fetching accessory by slug:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAllAccessories()
    getAllCategories()
  }, [fetchAllAccessories, getAllCategories])

  const refetch = useCallback(() => {
    fetchAllAccessories()
  }, [fetchAllAccessories])

  return {
    accessories,
    categories,
    isLoading,
    error,
    getAccessoriesByCategory,
    getAccessoryBySlug,
    getAllCategories,
    refetch,
  }
}

export { fetchAccessoryById }
