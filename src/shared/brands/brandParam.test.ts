import { describe, it, expect } from 'vitest'
import {
  parseBrandFromUrl,
  resolveBrandFromUrlParam,
  brandNameToNavigationSlug,
} from './brandParam'

describe('parseBrandFromUrl', () => {
  it('decodes percent-encoded spaces', () => {
    expect(parseBrandFromUrl('dacia%20renault')).toBe('dacia renault')
  })

  it('decodes double-encoded values', () => {
    expect(parseBrandFromUrl('dacia%2520renault')).toBe('dacia renault')
  })
})

describe('resolveBrandFromUrlParam', () => {
  it('maps dacia renault to Dacia with Dacia Renault db name', () => {
    const resolved = resolveBrandFromUrlParam('dacia renault')
    expect(resolved?.apiName).toBe('Dacia')
    expect(resolved?.dbName).toBe('Dacia Renault')
    expect(resolved?.slug).toBe('dacia')
  })

  it('maps dacia-renault slug to same brand', () => {
    const resolved = resolveBrandFromUrlParam('dacia-renault')
    expect(resolved?.dbName).toBe('Dacia Renault')
  })
})

describe('brandNameToNavigationSlug', () => {
  it('returns canonical slug for multi-word brand names', () => {
    expect(brandNameToNavigationSlug('Dacia Renault')).toBe('dacia')
  })
})
