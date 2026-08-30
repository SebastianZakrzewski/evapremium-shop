import { describe, expect, it } from 'vitest'
import { pageTypeFromPath, productIdFromShopParams } from './pageContext'

describe('pageTypeFromPath', () => {
  it('maps home, cart, checkout and generic product paths', () => {
    expect(pageTypeFromPath('/')).toBe('home')
    expect(pageTypeFromPath('')).toBe('home')
    expect(pageTypeFromPath('/cart')).toBe('cart')
    expect(pageTypeFromPath('/koszyk')).toBe('cart')
    expect(pageTypeFromPath('/checkout')).toBe('checkout')
    expect(pageTypeFromPath('/product/abc')).toBe('product')
    expect(pageTypeFromPath('/p/abc')).toBe('product')
    expect(pageTypeFromPath('/o-nas')).toBe('other')
  })

  it('maps shop catalog and configurator routes to product', () => {
    expect(pageTypeFromPath('/dywaniki')).toBe('product')
    expect(pageTypeFromPath('/dywaniki/bmw')).toBe('product')
    expect(pageTypeFromPath('/akcesoria/podpietki')).toBe('product')
    expect(pageTypeFromPath('/konfigurator')).toBe('product')
    expect(pageTypeFromPath('/konfigurator-v2')).toBe('product')
  })
})

describe('productIdFromShopParams', () => {
  it('prefers productId from query string', () => {
    const searchParams = new URLSearchParams('productId=mat-12&id=ignored')

    expect(productIdFromShopParams('/dywaniki', {}, searchParams)).toBe('mat-12')
  })

  it('reads product id from /product and /p paths', () => {
    const empty = new URLSearchParams()

    expect(productIdFromShopParams('/product/sku-9', {}, empty)).toBe('sku-9')
    expect(productIdFromShopParams('/p/sku-9', { id: 'other' }, empty)).toBe('sku-9')
  })

  it('falls back to Next.js route params', () => {
    const empty = new URLSearchParams()

    expect(
      productIdFromShopParams('/akcesoria/organizer', { slug: 'organizer-xl' }, empty),
    ).toBe('organizer-xl')
  })
})
