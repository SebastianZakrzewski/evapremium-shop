import '@testing-library/jest-dom/vitest'
import type { ReactNode } from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Order } from '@/lib/types/order-new'
import { resetGa4StateForTests } from '@/lib/tracking/ga4/events'
import { readSandboxTracking, resetSandboxTrackingForTests } from '@/lib/sandbox/trackingInspector'
import { PaymentSuccess } from '../PaymentSuccess'

const orderApi = vi.hoisted(() => ({
  getOrder: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useSearchParams: () =>
    new URLSearchParams('orderId=order-1&paymentId=PAY-519&paymentStatus=PENDING'),
}))

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

vi.mock('@/features/orders/hooks/useOrder', () => ({
  useOrder: () => ({
    getOrder: orderApi.getOrder,
  }),
}))

vi.mock('@/lib/config/payment-provider', () => ({
  isPaynowCheckoutEnabled: () => true,
}))

const ORDER_NUMBER = 'ORD-2026-000519'
const PURCHASE_CACHE_KEY = `purchase_${ORDER_NUMBER}`
const GA4_CACHE_KEY = 'ga4_purchase_PAY-519'
const ADS_SEND_TO = 'AW-18303682173/GGzWCPqk_MscEP2M8JdE'

const buildOrder = (paymentStatus: Order['paymentStatus'], withItems = true): Order => ({
  id: 'order-1',
  orderNumber: ORDER_NUMBER,
  status: paymentStatus === 'paid' ? 'confirmed' : 'pending',
  paymentStatus,
  paymentMethod: 'paynow',
  customer: {
    name: 'Jan Kowalski',
    email: 'jan@example.com',
    phone: '500600700',
  },
  shippingAddress: {
    street: 'Prosta 1',
    city: 'Warszawa',
    postalCode: '00-001',
    country: 'PL',
  },
  subtotal: 499,
  shippingCost: 0,
  tax: 0,
  discount: 0,
  total: 499,
  items: withItems
    ? [
        {
          id: 'item-1',
          quantity: 1,
          unitPrice: 499,
          subtotal: 499,
          productType: 'mat',
          productId: null,
          productName: 'Dywaniki EVA',
          orderId: 'order-1',
          createdAt: new Date('2026-11-05T12:00:00.000Z'),
          updatedAt: new Date('2026-11-05T12:00:00.000Z'),
        },
      ]
    : [],
  createdAt: new Date('2026-11-05T12:00:00.000Z'),
  updatedAt: new Date('2026-11-05T12:00:00.000Z'),
})

const gtagCalls = (eventName: string): unknown[][] =>
  (window.dataLayer ?? [])
    .filter((entry): entry is ArrayLike<unknown> => typeof entry === 'object' && entry !== null && 'length' in entry)
    .map((entry) => Array.from(entry))
    .filter((entry) => entry[1] === eventName)

const namedEvents = (eventName: string): Record<string, unknown>[] =>
  (window.dataLayer ?? []).filter(
    (entry): entry is Record<string, unknown> =>
      typeof entry === 'object' &&
      entry !== null &&
      !('length' in entry) &&
      (entry as { event?: unknown }).event === eventName
  )

const expectPurchaseTrackedOnce = () => {
  const purchases = gtagCalls('purchase')
  expect(purchases).toHaveLength(1)
  expect(purchases[0]?.[2]).toMatchObject({
    transaction_id: 'PAY-519',
    currency: 'PLN',
    value: 499,
  })

  expect(namedEvents('purchase')).toEqual([
    expect.objectContaining({
      event: 'purchase',
      transaction_id: 'PAY-519',
      currency: 'PLN',
      value: 499,
    }),
  ])

  const conversions = gtagCalls('conversion')
  expect(conversions).toHaveLength(1)
  expect(conversions[0]?.[2]).toEqual({
    send_to: ADS_SEND_TO,
    value: 499,
    currency: 'PLN',
    transaction_id: 'PAY-519',
  })
  expect(localStorage.getItem(PURCHASE_CACHE_KEY)).toBeTruthy()
  expect(localStorage.getItem(GA4_CACHE_KEY)).toBeTruthy()
}

const expectNoPurchase = () => {
  expect(gtagCalls('purchase')).toHaveLength(0)
  expect(namedEvents('purchase')).toHaveLength(0)
  expect(gtagCalls('conversion')).toHaveLength(0)
  expect(localStorage.getItem(PURCHASE_CACHE_KEY)).toBeNull()
  expect(localStorage.getItem(GA4_CACHE_KEY)).toBeNull()
}

describe('PaymentSuccess purchase tracking', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
    localStorage.clear()
    sessionStorage.clear()
    window.dataLayer = []
    delete window.gtag
    resetGa4StateForTests()
    resetSandboxTrackingForTests()
    vi.unstubAllEnvs()
    orderApi.getOrder.mockReset()
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('tracks purchase once when the first load is already paid', async () => {
    orderApi.getOrder.mockResolvedValue(buildOrder('paid'))

    render(<PaymentSuccess />)

    expect(await screen.findByRole('heading', { name: 'Dziękujemy za zamówienie' })).toBeInTheDocument()
    expectPurchaseTrackedOnce()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('skips purchase tracking on a later load when the order was already tracked', async () => {
    orderApi.getOrder.mockResolvedValue(buildOrder('paid'))

    const first = render(<PaymentSuccess />)
    expect(await screen.findByRole('heading', { name: 'Dziękujemy za zamówienie' })).toBeInTheDocument()
    expectPurchaseTrackedOnce()
    first.unmount()

    window.dataLayer = []
    delete window.gtag
    resetGa4StateForTests()
    localStorage.removeItem(GA4_CACHE_KEY)

    render(<PaymentSuccess />)
    expect(await screen.findByRole('heading', { name: 'Dziękujemy za zamówienie' })).toBeInTheDocument()
    await waitFor(() => {
      expect(orderApi.getOrder).toHaveBeenCalledTimes(2)
    })

    expect(gtagCalls('purchase')).toHaveLength(0)
    expect(namedEvents('purchase')).toHaveLength(0)
    expect(gtagCalls('conversion')).toHaveLength(0)
  })

  it('tracks purchase once when a pending success page later learns the order is paid', async () => {
    orderApi.getOrder
      .mockResolvedValueOnce(buildOrder('pending'))
      .mockResolvedValueOnce(buildOrder('paid'))
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        payment: { status: 'pending', providerStatus: 'CONFIRMED' },
      }),
    })

    render(<PaymentSuccess />)

    expect(await screen.findByRole('heading', { name: 'Dziękujemy za zamówienie' })).toBeInTheDocument()
    expectPurchaseTrackedOnce()
    expect(orderApi.getOrder).toHaveBeenCalledTimes(2)
    expect(fetchMock).toHaveBeenCalledWith('/api/payments/paynow/status?orderId=order-1')
  })

  it('tracks purchase once when recheck finds a paid order after the first poll stayed pending', async () => {
    orderApi.getOrder
      .mockResolvedValueOnce(buildOrder('pending'))
      .mockResolvedValueOnce(buildOrder('paid'))
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        payment: { status: 'pending', providerStatus: 'PENDING' },
      }),
    })

    render(<PaymentSuccess />)

    expect(await screen.findByRole('heading', { name: 'Płatność jest przetwarzana' })).toBeInTheDocument()
    expectNoPurchase()

    fireEvent.click(screen.getByRole('button', { name: 'Sprawdź ponownie' }))

    expect(await screen.findByRole('heading', { name: 'Dziękujemy za zamówienie' })).toBeInTheDocument()
    expectPurchaseTrackedOnce()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('does not track while the order stays pending', async () => {
    orderApi.getOrder.mockResolvedValue(buildOrder('pending'))
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        payment: { status: 'pending', providerStatus: 'PENDING' },
      }),
    })

    render(<PaymentSuccess />)

    expect(await screen.findByRole('heading', { name: 'Płatność jest przetwarzana' })).toBeInTheDocument()
    expectNoPurchase()
  })

  it('does not track when Paynow is confirmed but the order is still unpaid', async () => {
    orderApi.getOrder.mockResolvedValue(buildOrder('pending'))
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        payment: { status: 'paid', providerStatus: 'CONFIRMED' },
      }),
    })

    render(<PaymentSuccess />)

    expect(await screen.findByRole('heading', { name: 'Płatność jest przetwarzana' })).toBeInTheDocument()
    await waitFor(() => {
      expect(orderApi.getOrder).toHaveBeenCalledTimes(2)
    })
    expectNoPurchase()
  })

  it('does not track a paid order that has no items', async () => {
    orderApi.getOrder.mockResolvedValue(buildOrder('paid', false))

    render(<PaymentSuccess />)

    expect(await screen.findByRole('heading', { name: 'Dziękujemy za zamówienie' })).toBeInTheDocument()
    expectNoPurchase()
  })

  it('records pending-to-paid purchase in the sandbox inspector and does not call gtag', async () => {
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'preview')
    orderApi.getOrder
      .mockResolvedValueOnce(buildOrder('pending'))
      .mockResolvedValueOnce(buildOrder('paid'))
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        payment: { status: 'pending', providerStatus: 'CONFIRMED' },
      }),
    })

    render(<PaymentSuccess />)

    expect(await screen.findByRole('heading', { name: 'Dziękujemy za zamówienie' })).toBeInTheDocument()
    expect(gtagCalls('purchase')).toHaveLength(0)
    expect(gtagCalls('conversion')).toHaveLength(0)
    expect(namedEvents('purchase')).toHaveLength(0)
    expect(readSandboxTracking().filter((entry) => entry.event === 'purchase')).toHaveLength(1)
    expect(readSandboxTracking().filter((entry) => entry.event === 'conversion')).toHaveLength(1)
    expect(localStorage.getItem(PURCHASE_CACHE_KEY)).toBeTruthy()
  })
})
