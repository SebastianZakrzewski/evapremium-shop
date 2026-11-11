/**
 * Re-send Google Ads click conversions for paid orders from the last 90 days
 * whose upload is failed or still pending, and that have marketing consent and a gclid.
 *
 * Dry-run by default. Nothing is uploaded unless you pass --send.
 *
 *   npx tsx scripts/backfill-ads-conversions.ts
 *   npx tsx scripts/backfill-ads-conversions.ts --send
 *
 * Loads the same env as production (Supabase service role, SERVER_TRACKING_ENABLED,
 * ADS_SERVER_UPLOAD_ENABLED, Google OAuth, customer id, conversion action).
 * Does not send GA4 again. Does not upload orders without marketing consent.
 */
import { createClient } from '@supabase/supabase-js'
import { selectAdsBackfillCandidates, type AdsBackfillOrder } from '../src/lib/tracking/server/backfillAds'
import { readServerTrackingEnv, serverTrackingBlockReason } from '../src/lib/tracking/server/gate'
import { OrderRepository } from '../src/lib/repositories/OrderRepository'
import { trackPaidPaynowPurchase } from '../src/lib/tracking/server/sendPurchase'
import type { PurchaseTrackingRecord } from '../src/lib/tracking/attribution/types'

const LOOKBACK_DAYS = 90
const PAGE = 500

type OrderRow = {
  id: string
  order_number: string
  payment_status: string
  total: number | string
  created_at: string
  updated_at: string
  purchase_tracking: PurchaseTrackingRecord | null
}

const requireEnv = (name: string): string => {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing ${name}`)
  return value
}

const loadPaidOrders = async (): Promise<{
  orders: AdsBackfillOrder[]
  paidAtById: Map<string, string>
  updatedAtById: Map<string, string>
}> => {
  const supabase = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const cutoff = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const rows: OrderRow[] = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .schema('evapremium_shop')
      .from('orders')
      .select('id, order_number, payment_status, total, created_at, updated_at, purchase_tracking')
      .eq('payment_status', 'paid')
      .gte('created_at', cutoff)
      .order('created_at', { ascending: true })
      .range(from, from + PAGE - 1)
    if (error) throw new Error(`Failed to list orders: ${error.message}`)
    const page = (data ?? []) as OrderRow[]
    rows.push(...page)
    if (page.length < PAGE) break
  }

  const paidAtById = new Map<string, string>()
  const ids = rows.map((row) => row.id)
  for (let index = 0; index < ids.length; index += PAGE) {
    const slice = ids.slice(index, index + PAGE)
    if (slice.length === 0) continue
    const { data, error } = await supabase
      .schema('evapremium_shop')
      .from('payments')
      .select('order_id, paid_at, status')
      .in('order_id', slice)
      .eq('status', 'paid')
    if (error) throw new Error(`Failed to list payments: ${error.message}`)
    for (const payment of (data ?? []) as Array<{ order_id: string; paid_at: string | null }>) {
      if (payment.paid_at) paidAtById.set(payment.order_id, payment.paid_at)
    }
  }

  return {
    paidAtById,
    updatedAtById: new Map(rows.map((row) => [row.id, row.updated_at])),
    orders: rows.map((row) => ({
      id: row.id,
      orderNumber: row.order_number,
      paymentStatus: row.payment_status,
      total: Number(row.total || 0),
      createdAt: new Date(row.created_at),
      purchaseTracking: row.purchase_tracking,
    })),
  }
}

const main = async (): Promise<void> => {
  const send = process.argv.includes('--send')
  const env = readServerTrackingEnv()
  const { orders, paidAtById, updatedAtById } = await loadPaidOrders()
  const candidates = selectAdsBackfillCandidates(orders)

  console.log(
    JSON.stringify({
      mode: send ? 'send' : 'dry-run',
      lookbackDays: LOOKBACK_DAYS,
      candidates: candidates.length,
    })
  )
  for (const candidate of candidates) {
    const paidAt = paidAtById.get(candidate.orderId) ?? updatedAtById.get(candidate.orderId)
    console.log(
      JSON.stringify({
        orderNumber: candidate.orderNumber,
        totalPln: candidate.total,
        adsStatus: candidate.adsStatus,
        gclidPrefix: candidate.gclidPrefix,
        transactionId: candidate.orderNumber,
        paidAt: paidAt ?? null,
      })
    )
  }

  if (!send) {
    console.log('Dry run only. Re-run with --send to upload these orders.')
    return
  }

  const blocked = serverTrackingBlockReason(env)
  if (blocked) throw new Error(`Refusing to send: server tracking is ${blocked}`)
  if (env.adsServerUploadEnabled !== 'true') {
    throw new Error('Refusing to send: ADS_SERVER_UPLOAD_ENABLED is not true')
  }

  const repository = new OrderRepository()
  let failed = 0
  for (const candidate of candidates) {
    const paidAt = paidAtById.get(candidate.orderId) ?? updatedAtById.get(candidate.orderId)
    const result = await trackPaidPaynowPurchase(
      {
        orderId: candidate.orderId,
        paidAt,
        paymentEnvironment: env.paynowEnvironment ?? 'production',
        channels: { ga4: false, ads: true },
      },
      {
        env,
        fetchImpl: fetch,
        loadOrder: (orderId) => repository.findById(orderId),
        saveTracking: (orderId, tracking) => repository.updatePurchaseTracking(orderId, tracking),
      }
    )
    const status = result?.ads?.status ?? 'unchanged'
    if (status === 'failed') failed += 1
    console.log(
      JSON.stringify({
        orderNumber: candidate.orderNumber,
        result: status,
        reason: result?.ads?.reason ?? null,
        requestId: result?.ads?.requestId ?? null,
      })
    )
  }
  if (failed > 0) {
    throw new Error(`${failed} upload${failed === 1 ? '' : 's'} failed`)
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'backfill failed'
  console.error(message)
  process.exitCode = 1
})
