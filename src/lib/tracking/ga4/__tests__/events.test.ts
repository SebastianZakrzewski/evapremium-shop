import { beforeEach, describe, expect, it } from 'vitest'
import type {
  AddPaymentInfoData,
  AddShippingInfoData,
  AddToCartData,
  InitiateCheckoutData,
  PurchaseData,
  ViewContentData,
} from '../../types'
import {
  resetGa4StateForTests,
  trackGaAddPaymentInfo,
  trackGaAddShippingInfo,
  trackGaAddToCart,
  trackGaBeginCheckout,
  trackGaGenerateLead,
  trackGaPurchase,
  trackGaViewContent,
} from '../events'

const readQueue = (): unknown[][] =>
  (window.dataLayer ?? []).map((entry) => Array.from(entry as ArrayLike<unknown>))

const readNamedEvents = (eventName: string): Record<string, unknown>[] =>
  (window.dataLayer ?? []).filter(
    (entry): entry is Record<string, unknown> =>
      typeof entry === 'object' &&
      entry !== null &&
      !('length' in entry) &&
      (entry as { event?: unknown }).event === eventName
  )

const viewContent = (): ViewContentData => ({
  content_name: 'Dywaniki',
  content_ids: ['mat-1'],
  content_type: 'product',
  content_category: 'car_mats',
  value: 499,
  currency: 'PLN',
  product: {
    id: 'mat-1',
    name: 'Dywaniki EVA',
    price: 499,
    brand: 'Audi',
    sku: 'EVA-1',
  },
})

const cartItem = (): AddToCartData => ({
  content_name: 'Dywaniki',
  content_ids: ['mat-1'],
  content_type: 'product',
  content_category: 'car_mats',
  value: 998,
  currency: 'EUR',
  num_items: 2,
  contents: [
    {
      id: 'mat-1',
      quantity: 2,
      item_price: 499,
      item_name: 'Dywaniki EVA',
      item_brand: 'Audi',
      item_category: 'car_mats',
      item_variant: 'EVA-1',
    },
  ],
})

const checkout = (): InitiateCheckoutData => ({
  content_name: 'Checkout',
  content_category: 'checkout',
  value: 998,
  currency: 'PLN',
  num_items: 2,
  contents: cartItem().contents,
})

const shippingInfo = (): AddShippingInfoData => ({
  ...checkout(),
  shipping_tier: 'Standardowa dostawa',
})

const paymentInfo = (): AddPaymentInfoData => ({
  content_name: 'Payment Info Added',
  content_category: 'checkout',
  value: 998,
  currency: 'EUR',
  payment_method: 'paynow',
  contents: cartItem().contents,
})

const purchase = (): PurchaseData => ({
  content_name: 'Purchase Completed',
  content_ids: ['ORD-1'],
  value: 998,
  currency: 'PLN',
  transaction_id: 'txn-1',
  contents: cartItem().contents,
})

describe('GA4 ecommerce events', () => {
  beforeEach(() => {
    window.dataLayer = [{ event: 'gtm.js' }]
    delete window.gtag
    localStorage.clear()
    resetGa4StateForTests()
  })

  it('appends events without resetting an existing dataLayer', () => {
    trackGaViewContent(viewContent())

    expect(window.dataLayer?.[0]).toEqual({ event: 'gtm.js' })
    expect(readQueue()[1]?.[0]).toBe('event')
    expect(readQueue()[1]?.[1]).toBe('view_item')
    expect(readQueue()[1]?.[2]).toMatchObject({
      currency: 'PLN',
      value: 499,
      items: [{ item_id: 'mat-1', item_name: 'Dywaniki EVA', price: 499, quantity: 1 }],
    })
  })

  it('sends add_to_cart and begin_checkout in PLN', () => {
    trackGaAddToCart(cartItem())
    trackGaBeginCheckout(checkout())

    const events = readQueue().slice(1)
    expect(events.map((entry) => entry[1])).toEqual(['add_to_cart', 'begin_checkout'])
    expect(events[0]?.[2]).toMatchObject({ currency: 'PLN', value: 998 })
    expect(events[1]?.[2]).toMatchObject({ currency: 'PLN', value: 998 })
  })

  it('sends add_shipping_info and add_payment_info with the begin_checkout item payload', () => {
    trackGaAddShippingInfo(shippingInfo())
    trackGaAddPaymentInfo(paymentInfo())

    const events = readQueue().slice(1)
    expect(events.map((entry) => entry[1])).toEqual(['add_shipping_info', 'add_payment_info'])
    expect(events[0]?.[2]).toEqual({
      currency: 'PLN',
      value: 998,
      shipping_tier: 'Standardowa dostawa',
      items: [
        {
          item_id: 'mat-1',
          item_name: 'Dywaniki EVA',
          price: 499,
          quantity: 2,
          item_brand: 'Audi',
          item_category: 'car_mats',
          item_variant: 'EVA-1',
        },
      ],
    })
    expect(events[1]?.[2]).toEqual({
      currency: 'PLN',
      value: 998,
      payment_type: 'paynow',
      items: [
        {
          item_id: 'mat-1',
          item_name: 'Dywaniki EVA',
          price: 499,
          quantity: 2,
          item_brand: 'Audi',
          item_category: 'car_mats',
          item_variant: 'EVA-1',
        },
      ],
    })
  })

  it('sends purchase once per transaction id, including after refresh', () => {
    trackGaPurchase(purchase())
    trackGaPurchase(purchase())

    expect(readQueue().filter((entry) => entry[1] === 'purchase')).toHaveLength(1)
    expect(readQueue().find((entry) => entry[1] === 'purchase')?.[2]).toMatchObject({
      transaction_id: 'txn-1',
      currency: 'PLN',
      value: 998,
    })

    const namedPurchases = readNamedEvents('purchase')
    expect(namedPurchases).toHaveLength(1)
    expect(namedPurchases[0]).toEqual({
      event: 'purchase',
      transaction_id: 'txn-1',
      currency: 'PLN',
      value: 998,
      items: [
        {
          item_id: 'mat-1',
          item_name: 'Dywaniki EVA',
          price: 499,
          quantity: 2,
          item_brand: 'Audi',
          item_category: 'car_mats',
          item_variant: 'EVA-1',
        },
      ],
    })

    resetGa4StateForTests()
    delete window.gtag
    trackGaPurchase(purchase())

    expect(readQueue().filter((entry) => entry[1] === 'purchase')).toHaveLength(1)
    expect(readNamedEvents('purchase')).toHaveLength(1)
    expect(readQueue().filter((entry) => entry[1] === 'conversion')).toHaveLength(1)
  })

  it('sends one Google Ads Zakup conversion with the purchase value and transaction id', () => {
    trackGaPurchase(purchase())
    trackGaPurchase(purchase())

    const conversions = readQueue().filter((entry) => entry[1] === 'conversion')
    expect(conversions).toHaveLength(1)
    expect(conversions[0]?.[2]).toEqual({
      send_to: 'AW-18303682173/GGzWCPqk_MscEP2M8JdE',
      value: 998,
      currency: 'PLN',
      transaction_id: 'txn-1',
    })
  })

  it('does not push purchase when the transaction id is blank', () => {
    trackGaPurchase({ ...purchase(), transaction_id: '   ' })

    expect(readQueue().filter((entry) => entry[1] === 'purchase')).toHaveLength(0)
    expect(readNamedEvents('purchase')).toHaveLength(0)
    expect(readQueue().filter((entry) => entry[1] === 'conversion')).toHaveLength(0)
  })

  it('sends generate_lead', () => {
    trackGaGenerateLead('contact_form')

    expect(readQueue()[1]).toMatchObject([
      'event',
      'generate_lead',
      { currency: 'PLN', lead_source: 'contact_form' },
    ])
  })
})
