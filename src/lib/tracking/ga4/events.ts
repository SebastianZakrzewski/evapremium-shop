import type {
  AddPaymentInfoData,
  AddShippingInfoData,
  AddToCartData,
  ContentItem,
  InitiateCheckoutData,
  PurchaseData,
  ViewContentData,
} from '../types'
import { GOOGLE_ADS_PURCHASE_SEND_TO } from './consentScript'
import { pushGtag } from './gtag'

export type Ga4Item = {
  item_id: string
  item_name: string
  price: number
  quantity: number
  item_brand?: string
  item_category?: string
  item_variant?: string
}

const sentPurchaseIds = new Set<string>()

const purchaseStorageKey = (transactionId: string): string =>
  `ga4_purchase_${transactionId}`

const toGa4Item = (item: ContentItem): Ga4Item => ({
  item_id: item.id,
  item_name: item.item_name,
  price: item.item_price,
  quantity: item.quantity,
  ...(item.item_brand ? { item_brand: item.item_brand } : {}),
  ...(item.item_category ? { item_category: item.item_category } : {}),
  ...(item.item_variant ? { item_variant: item.item_variant } : {}),
})

const readStoredPurchase = (transactionId: string): boolean => {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    return window.localStorage.getItem(purchaseStorageKey(transactionId)) !== null
  } catch {
    return false
  }
}

const rememberPurchase = (transactionId: string): void => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(purchaseStorageKey(transactionId), Date.now().toString())
  } catch {
    // Private mode can reject storage. The in-memory set still blocks this page.
  }
}

export const resetGa4StateForTests = (): void => {
  sentPurchaseIds.clear()
}

export const trackGaViewItem = (item: Ga4Item): void => {
  pushGtag('event', 'view_item', {
    currency: 'PLN',
    value: item.price * item.quantity,
    items: [item],
  })
}

export const trackGaViewContent = (data: ViewContentData): void => {
  const main: Ga4Item = {
    item_id: data.product.id,
    item_name: data.product.name,
    price: data.product.price ?? data.value,
    quantity: data.product.quantity ?? 1,
    ...(data.product.brand ? { item_brand: data.product.brand } : {}),
    item_category: data.content_category,
    ...(data.product.variant || data.product.sku
      ? { item_variant: data.product.variant ?? data.product.sku }
      : {}),
  }
  const extras = (data.contents ?? []).map(toGa4Item)
  const items = [main, ...extras]
  pushGtag("event", "view_item", {
    currency: "PLN",
    value: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    items,
  })
}

export const trackGaAddToCart = (data: AddToCartData): void => {
  pushGtag('event', 'add_to_cart', {
    currency: 'PLN',
    value: data.value,
    items: data.contents.map(toGa4Item),
  })
}

export const trackGaBeginCheckout = (data: InitiateCheckoutData): void => {
  pushGtag('event', 'begin_checkout', {
    currency: 'PLN',
    value: data.value,
    items: data.contents.map(toGa4Item),
  })
}

export const trackGaAddShippingInfo = (data: AddShippingInfoData): void => {
  pushGtag('event', 'add_shipping_info', {
    currency: 'PLN',
    value: data.value,
    shipping_tier: data.shipping_tier,
    items: data.contents.map(toGa4Item),
  })
}

export const trackGaAddPaymentInfo = (data: AddPaymentInfoData): void => {
  pushGtag('event', 'add_payment_info', {
    currency: 'PLN',
    value: data.value,
    payment_type: data.payment_method,
    items: data.contents.map(toGa4Item),
  })
}

type Ga4PurchasePayload = {
  transaction_id: string
  currency: 'PLN'
  value: number
  items: Ga4Item[]
}

const pushNamedPurchase = (payload: Ga4PurchasePayload): void => {
  if (typeof window === 'undefined') {
    return
  }

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event: 'purchase',
    transaction_id: payload.transaction_id,
    currency: payload.currency,
    value: payload.value,
    items: payload.items,
  })
}

export const trackGaPurchase = (data: PurchaseData): void => {
  const transactionId = data.transaction_id.trim()

  if (!transactionId || sentPurchaseIds.has(transactionId) || readStoredPurchase(transactionId)) {
    if (transactionId) {
      sentPurchaseIds.add(transactionId)
    }
    return
  }

  const payload: Ga4PurchasePayload = {
    transaction_id: transactionId,
    currency: 'PLN',
    value: data.value,
    items: data.contents.map(toGa4Item),
  }

  sentPurchaseIds.add(transactionId)
  pushGtag('event', 'purchase', payload)
  pushNamedPurchase(payload)
  pushGtag('event', 'conversion', {
    send_to: GOOGLE_ADS_PURCHASE_SEND_TO,
    value: payload.value,
    currency: payload.currency,
    transaction_id: payload.transaction_id,
  })
  rememberPurchase(transactionId)
}

export const trackGaGenerateLead = (leadSource: string): void => {
  pushGtag('event', 'generate_lead', {
    currency: 'PLN',
    lead_source: leadSource,
  })
}
