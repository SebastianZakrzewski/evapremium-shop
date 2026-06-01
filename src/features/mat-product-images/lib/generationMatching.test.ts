import { describe, it, expect } from 'vitest'
import { getGenerationSearchVariants } from './generationMatching'

describe('getGenerationSearchVariants', () => {
  it('returns range and plus variants for year ranges', () => {
    expect(getGenerationSearchVariants('2021-2026')).toEqual(['2021-2026', '2021+'])
  })

  it('adds open-ended variant for closed year ranges', () => {
    expect(getGenerationSearchVariants('2012-2020')).toEqual(['2012-2020', '2012+'])
  })

  it('adds range variant for open-ended generations', () => {
    expect(getGenerationSearchVariants('2024+')).toContain('2024+')
    expect(getGenerationSearchVariants('2024+')).toContain('2024-2024')
  })
})
