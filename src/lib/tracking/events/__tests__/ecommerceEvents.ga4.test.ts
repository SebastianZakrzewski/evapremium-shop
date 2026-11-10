import { beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  AddPaymentInfoData,
  AddShippingInfoData,
  AddToCartData,
  InitiateCheckoutData,
  PurchaseData,
  ViewContentData,
} from '../../types'

const gaMocks = vi.hoisted(() => ({
  trackGaAddPaymentInfo: vi.fn(),
  trackGaAddShippingInfo: vi.fn(),
  trackGaAddToCart: vi.fn(),
  trackGaBeginCheckout: vi.fn(),
  trackGaPurchase: vi.fn(),
  trackGaViewContent: vi.fn(),
}))

vi.mock('../../ga4/events', () => gaMocks)

vi.mock('../../consent/isMarketingTrackingAllowed', () => ({
  isMarketingTrackingAllowed: () => false,
}))

import {
  trackAddPaymentInfo,
  trackAddShippingInfo,
  trackAddToCart,
  trackInitiateCheckout,
  trackPurchase,
  trackViewContent,
} from '../ecommerceEvents'

const viewContent = (): ViewContentData => ({
  content_name: 'Dywaniki',
  content_ids: ['mat-1'],
  content_type: 'product',
  content_category: 'car_mats',
  value: 499,
  currency: 'PLN',
  product: { id: 'mat-1', name: 'Dywaniki EVA', price: 499 },
})

const addToCart = (): AddToCartData => ({
  content_name: 'Dywaniki',
  content_ids: ['mat-1'],
  content_type: 'product',
  content_category: 'car_mats',
  value: 499,
  currency: 'PLN',
  num_items: 1,
  contents: [
    { id: 'mat-1', quantity: 1, item_price: 499, item_name: 'Dywaniki EVA' },
  ],
})

const checkout = (): InitiateCheckoutData => ({
  content_name: 'Checkout',
  content_category: 'checkout',
  value: 499,
  currency: 'PLN',
  num_items: 1,
  contents: addToCart().contents,
})

const shippingInfo = (): AddShippingInfoData => ({
  ...checkout(),
  shipping_tier: 'Standardowa dostawa',
})

const paymentInfo = (): AddPaymentInfoData => ({
  content_name: 'Payment Info Added',
  content_category: 'checkout',
  value: 499,
  currency: 'PLN',
  payment_method: 'paynow',
  contents: addToCart().contents,
})

const purchase = (): PurchaseData => ({
  content_name: 'Purchase Completed',
  content_ids: ['ORD-1'],
  value: 499,
  currency: 'PLN',
  transaction_id: 'txn-1',
  contents: addToCart().contents,
})

describe('ecommerce events forward to GA4 without marketing consent', () => {
  beforeEach(() => {
    gaMocks.trackGaAddPaymentInfo.mockClear()
    gaMocks.trackGaAddShippingInfo.mockClear()
    gaMocks.trackGaAddToCart.mockClear()
    gaMocks.trackGaBeginCheckout.mockClear()
    gaMocks.trackGaPurchase.mockClear()
    gaMocks.trackGaViewContent.mockClear()
  })

  it('forwards view_item, add_to_cart, begin_checkout and purchase', () => {
    trackViewContent(viewContent())
    trackAddToCart(addToCart())
    trackInitiateCheckout(checkout())
    trackPurchase(purchase())

    expect(gaMocks.trackGaViewContent).toHaveBeenCalledWith(viewContent())
    expect(gaMocks.trackGaAddToCart).toHaveBeenCalledWith(addToCart())
    expect(gaMocks.trackGaBeginCheckout).toHaveBeenCalledWith(checkout())
    expect(gaMocks.trackGaPurchase).toHaveBeenCalledWith(purchase())
  })

  it('forwards add_shipping_info and add_payment_info without marketing consent', () => {
    trackAddShippingInfo(shippingInfo())
    trackAddPaymentInfo(paymentInfo())

    expect(gaMocks.trackGaAddShippingInfo).toHaveBeenCalledWith(shippingInfo())
    expect(gaMocks.trackGaAddPaymentInfo).toHaveBeenCalledWith(paymentInfo())
  })
})
