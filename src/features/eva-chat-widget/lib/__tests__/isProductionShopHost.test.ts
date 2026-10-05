import { describe, expect, it } from 'vitest'
import { isProductionShopHost } from '../isProductionShopHost'

describe('isProductionShopHost', () => {
  it('treats the live shop domains as production', () => {
    expect(isProductionShopHost('evapremium.pl')).toBe(true)
    expect(isProductionShopHost('www.evapremium.pl')).toBe(true)
    expect(isProductionShopHost('WWW.EVAPREMIUM.PL')).toBe(true)
  })

  it('keeps the launcher on local and preview hosts', () => {
    expect(isProductionShopHost('localhost')).toBe(false)
    expect(isProductionShopHost('eva-website-git-main.vercel.app')).toBe(false)
    expect(isProductionShopHost('formularz.evapremium.pl')).toBe(false)
  })
})
