/**
 * E2E verification of abandoned-cart logic against local Next.js + PROD Supabase.
 *
 * Scenarios:
 *  A) Heartbeat step2 with partial form → pending DB record
 *  B) Webhook pagehide step2 → Bitrix deal (exported)
 *  C) Webhook pagehide step3 → Bitrix deal (exported)
 *  D) payment_redirect → pending DB, no Bitrix deal
 *  E) pending after redirect + failed payment export path (direct export service via API webhook after expire-like force)
 *  F) convert on paid (API simulation helper via local convert endpoint if available)
 *
 * Usage: node scripts/e2e-abandoned-cart-flows.mjs
 */
import fs from 'fs'
import crypto from 'crypto'

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000'
const SUPABASE_URL = 'https://kmepxyervpeujwvgdqtm.supabase.co'
const RUN_ID = Date.now().toString(36)
const results = []

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const env = fs.readFileSync(`${root}/.env`, 'utf8')
const getEnv = (key) => env.match(new RegExp(`^${key}=(.+)$`, 'm'))?.[1]?.trim()
const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY')

if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')

const log = (msg, data) => {
  console.log(`\n→ ${msg}`)
  if (data !== undefined) console.log(JSON.stringify(data, null, 2))
}

const pass = (name, detail) => {
  results.push({ name, ok: true, detail })
  console.log(`✅ PASS: ${name}${detail ? ` — ${detail}` : ''}`)
}

const fail = (name, detail) => {
  results.push({ name, ok: false, detail })
  console.error(`❌ FAIL: ${name} — ${detail}`)
}

const assert = (name, condition, detail) => {
  if (condition) pass(name, detail)
  else fail(name, detail)
}

const supabaseRest = async (path, options = {}) => {
  const url = `${SUPABASE_URL}/rest/v1/${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: options.prefer ?? 'return=representation',
      ...options.headers,
    },
  })
  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) throw new Error(`Supabase ${path}: ${res.status} ${text}`)
  return data
}

const makeSession = (suffix) => `session-e2e-${RUN_ID}-${suffix}-Mozilla/5.-1920x1080`
const makeEmail = (suffix) => `e2e.${RUN_ID}.${suffix}@evapremium-test.local`

const basePayload = ({ sessionId, stage, email, firstName = 'E2E', lastName = 'Tester', phone = '500600700', partial = false }) => {
  const contact = partial
    ? { firstName: 'A', lastName: '', email: 'not-an-email', phone: '12' }
    : { firstName, lastName, email, phone }

  return {
    sessionId,
    stage,
    cartHasItems: true,
    contact,
    address: partial ? { street: 'x', city: '', postalCode: '1', country: 'Polska' } : {
      street: 'ul. Testowa 1',
      city: 'Warszawa',
      postalCode: '00-001',
      country: 'Polska',
    },
    car: { make: 'BMW', model: 'X5', year: 2020, bodyType: 'SUV' },
    configuration: { variant: 'full', setType: 'classic', cellShape: 'diamond', materialColor: 'black', trimColor: 'black' },
    items: [{
      productId: 'e2e-mat',
      productName: 'Dywaniki EVA E2E',
      productType: 'mat',
      quantity: 1,
      price: 259,
      currency: 'PLN',
    }],
    currency: 'PLN',
    totalAmount: 259,
    metadata: { e2eRunId: RUN_ID, stage },
    userAgent: 'e2e-abandoned-cart-flows',
  }
}

const postJson = async (path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  let json
  try { json = text ? JSON.parse(text) : null } catch { json = { raw: text } }
  return { status: res.status, json }
}

const findCartsBySession = async (sessionId) => {
  return supabaseRest(
    `abandoned_carts?session_id=eq.${encodeURIComponent(sessionId)}&select=id,status,bitrix_deal_id,total_amount,contact,metadata,created_at,last_activity_at&order=created_at.desc`
  )
}

const findCartsByEmail = async (email) => {
  return supabaseRest(
    `abandoned_carts?contact->>email=eq.${encodeURIComponent(email)}&select=id,status,bitrix_deal_id,total_amount,contact,metadata,created_at&order=created_at.desc`
  )
}

async function scenarioA_partialHeartbeatStep2() {
  log('A) Heartbeat step2 with partial form data')
  const sessionId = makeSession('a-partial')
  const payload = basePayload({ sessionId, stage: 'checkout_step2', email: makeEmail('a'), partial: true })
  const res = await postJson('/api/abandoned-carts', payload)
  log('Heartbeat response', res)
  assert('A response 200', res.status === 200, `status=${res.status}`)
  assert('A success true', res.json?.success === true, JSON.stringify(res.json))

  const carts = await findCartsBySession(sessionId)
  assert('A DB record created', carts.length >= 1, `count=${carts.length}`)
  if (carts[0]) {
    assert('A status pending', carts[0].status === 'pending', carts[0].status)
    assert('A no bitrix yet', !carts[0].bitrix_deal_id, String(carts[0].bitrix_deal_id))
  }
  return { sessionId, cart: carts[0] }
}

async function scenarioB_webhookStep2() {
  log('B) Webhook pagehide step2 → Bitrix export')
  const sessionId = makeSession('b-step2')
  const email = makeEmail('b')
  const payload = {
    ...basePayload({ sessionId, stage: 'checkout_step2', email }),
    event: 'pagehide',
  }
  const res = await postJson('/api/abandoned-carts/webhook', payload)
  log('Webhook response', res)
  assert('B response 200', res.status === 200, `status=${res.status}`)

  // Bitrix can take a moment / may fail if credentials issue — re-check DB
  await new Promise((r) => setTimeout(r, 2000))
  const carts = await findCartsBySession(sessionId)
  assert('B DB record exists', carts.length >= 1, `count=${carts.length}`)
  const cart = carts[0]
  if (res.json?.dealId || cart?.bitrix_deal_id) {
    assert('B exported with deal', cart.status === 'exported' && !!cart.bitrix_deal_id, `status=${cart.status} deal=${cart.bitrix_deal_id}`)
  } else if (res.json?.skipped) {
    fail('B Bitrix deal', `skipped: ${res.json.reason}`)
  } else if (res.json?.success === false) {
    fail('B Bitrix deal', res.json.error || 'webhook failed')
  } else {
    // pending if Bitrix failed but DB upsert worked
    assert('B at least pending snapshot', ['pending', 'exported', 'processing'].includes(cart?.status), cart?.status)
    if (cart?.status === 'pending') fail('B Bitrix deal', 'record pending without dealId')
  }
  return { sessionId, email, cart, dealId: res.json?.dealId || cart?.bitrix_deal_id }
}

async function scenarioC_webhookStep3() {
  log('C) Webhook pagehide step3 → Bitrix export')
  const sessionId = makeSession('c-step3')
  const email = makeEmail('c')
  const payload = {
    ...basePayload({ sessionId, stage: 'checkout_step3', email }),
    event: 'pagehide',
  }
  const res = await postJson('/api/abandoned-carts/webhook', payload)
  log('Webhook response', res)
  assert('C response 200', res.status === 200, `status=${res.status}`)
  await new Promise((r) => setTimeout(r, 2000))
  const carts = await findCartsBySession(sessionId)
  const cart = carts[0]
  assert('C DB record exists', !!cart, 'missing')
  if (cart) {
    assert(
      'C exported with deal',
      cart.status === 'exported' && !!cart.bitrix_deal_id,
      `status=${cart.status} deal=${cart.bitrix_deal_id} apiDeal=${res.json?.dealId}`
    )
  }
  return { sessionId, email, cart, dealId: res.json?.dealId || cart?.bitrix_deal_id }
}

async function scenarioD_paymentRedirect() {
  log('D) payment_redirect → pending without Bitrix')
  const sessionId = makeSession('d-redirect')
  const email = makeEmail('d')
  const payload = {
    ...basePayload({ sessionId, stage: 'checkout_step3', email }),
    event: 'payment_redirect',
    metadata: { paymentRedirect: true, e2eRunId: RUN_ID },
  }
  const res = await postJson('/api/abandoned-carts/webhook', payload)
  log('Webhook response', res)
  assert('D skipped payment_redirect', res.json?.skipped === true && res.json?.reason === 'payment_redirect', JSON.stringify(res.json))
  const carts = await findCartsBySession(sessionId)
  assert('D DB record exists', carts.length >= 1, `count=${carts.length}`)
  if (carts[0]) {
    assert('D status pending', carts[0].status === 'pending', carts[0].status)
    assert('D no bitrix deal', !carts[0].bitrix_deal_id, String(carts[0].bitrix_deal_id))
  }
  return { sessionId, email, cart: carts[0] }
}

async function scenarioE_forceExportAfterFailedPayment(dResult) {
  log('E) After incomplete payment — force export of pending cart via webhook pagehide (simulates fail/abandon after paywall)')
  // Simulate: user had payment_redirect pending, then never paid and later abandons / fail export path.
  // Direct path: call webhook with pagehide on same session (no pending order blocking).
  const payload = {
    ...basePayload({ sessionId: dResult.sessionId, stage: 'checkout_step3', email: dResult.email }),
    event: 'pagehide',
  }
  const res = await postJson('/api/abandoned-carts/webhook', payload)
  log('Export webhook response', res)
  await new Promise((r) => setTimeout(r, 2000))
  const carts = await findCartsBySession(dResult.sessionId)
  const cart = carts[0]
  assert(
    'E pending cart exported after abandon',
    cart?.status === 'exported' && !!cart?.bitrix_deal_id,
    `status=${cart?.status} deal=${cart?.bitrix_deal_id} api=${JSON.stringify(res.json)}`
  )
  return { ...dResult, cart, dealId: res.json?.dealId || cart?.bitrix_deal_id }
}

async function scenarioF_promoteOnPaid(exported) {
  log('F) Paid order promotes abandoned deal — insert order + call local convert helper')
  if (!exported?.dealId || !exported?.email || !exported?.cart?.id) {
    fail('F preconditions', 'missing exported deal from prior scenario')
    return null
  }

  const orderId = crypto.randomUUID()
  const orderNumber = `ORD-2026-E2E${RUN_ID.slice(-5)}`
  const now = new Date().toISOString()
  const total = Number(exported.cart.total_amount) || 259

  const [order] = await supabaseRest('orders', {
    method: 'POST',
    prefer: 'return=representation',
    body: JSON.stringify({
      id: orderId,
      order_number: orderNumber,
      status: 'confirmed',
      payment_status: 'paid',
      payment_method: 'paynow',
      customer: {
        email: exported.email,
        name: 'E2E Tester',
        phone: '500600700',
      },
      shipping_address: {
        street: 'ul. Testowa 1',
        city: 'Warszawa',
        postalCode: '00-001',
        country: 'Polska',
      },
      billing_address: {
        street: 'ul. Testowa 1',
        city: 'Warszawa',
        postalCode: '00-001',
        country: 'Polska',
      },
      subtotal: total,
      shipping_cost: 0,
      tax: 0,
      discount: 0,
      total,
      notes: `E2E abandoned promote ${RUN_ID}`,
      created_at: now,
      updated_at: now,
    }),
  })

  assert('F order inserted', !!order?.id, orderId)

  // Trigger conversion through a dedicated one-shot API if present; otherwise mark converted + note manual Bitrix check
  const convertRes = await postJson('/api/abandoned-carts/e2e-convert-on-paid', {
    email: exported.email,
    orderId,
    orderNumber,
  })

  if (convertRes.status === 404) {
    // Fallback: update DB status to converted and call Bitrix update via webhook-like local script endpoint absence
    log('F convert endpoint missing — applying DB convert + documenting Bitrix promotion expectation')
    await supabaseRest(`abandoned_carts?id=eq.${exported.cart.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'converted',
        metadata: {
          ...(exported.cart.metadata || {}),
          converted_reason: 'order_paid',
          converted_order_id: orderId,
          converted_order_number: orderNumber,
          converted_at: now,
          e2e_note: 'DB converted; Bitrix promotion requires convertAbandonedCartsOnPaid runtime',
        },
      }),
    })
    const carts = await findCartsByEmail(exported.email)
    const cart = carts.find((c) => c.id === exported.cart.id)
    assert('F DB converted (fallback)', cart?.status === 'converted', cart?.status)
    fail('F Bitrix promote to UC_DMBNNJ', 'no /api/abandoned-carts/e2e-convert-on-paid — create endpoint or run tsx convert')
    return { orderId, orderNumber, dealId: exported.dealId, cart }
  }

  log('Convert response', convertRes)
  assert('F convert API ok', convertRes.status === 200 && convertRes.json?.success, JSON.stringify(convertRes.json))
  const carts = await findCartsByEmail(exported.email)
  const cart = carts.find((c) => c.id === exported.cart.id)
  assert('F DB converted', cart?.status === 'converted', cart?.status)
  assert(
    'F promoted deal ids returned',
    Array.isArray(convertRes.json?.promotedDealIds) && convertRes.json.promotedDealIds.length > 0,
    JSON.stringify(convertRes.json)
  )

  // Verify Bitrix stage/category after promotion (new paid deal id)
  const paidDealId = convertRes.json?.promotedDealIds?.[0] || exported.dealId
  if (paidDealId) {
    const { spawnSync } = await import('child_process')
    const check = spawnSync(
      process.execPath,
      ['--use-system-ca', 'scripts/e2e-check-bitrix-deal.mjs', String(paidDealId)],
      { encoding: 'utf8', cwd: process.cwd() }
    )
    let dealInfo = null
    try { dealInfo = JSON.parse(check.stdout || '{}') } catch {}
    log('F Bitrix deal after promote', dealInfo)
    assert(
      'F Bitrix category is paid pipeline (0)',
      String(dealInfo?.category) === '0' || dealInfo?.category === 0,
      `category=${dealInfo?.category}`
    )
    assert(
      'F Bitrix stage is UC_DMBNNJ',
      dealInfo?.stage === 'UC_DMBNNJ',
      `stage=${dealInfo?.stage}`
    )
  }

  return { orderId, orderNumber, dealId: paidDealId, cart, convert: convertRes.json }
}

async function scenarioG_fullPaidOrderHappyPath() {
  log('G) Full happy path: create order pending → mark paid via OrderService path if available')
  const email = makeEmail('g-happy')
  const orderId = crypto.randomUUID()
  const orderNumber = `ORD-2026-HAPPY${RUN_ID.slice(-5)}`
  const now = new Date().toISOString()
  const total = 5

  // First create an abandoned pending (as if user filled checkout) then paid without exported deal
  const sessionId = makeSession('g-happy')
  await postJson('/api/abandoned-carts', basePayload({ sessionId, stage: 'checkout_step3', email }))

  const [order] = await supabaseRest('orders', {
    method: 'POST',
    prefer: 'return=representation',
    body: JSON.stringify({
      id: orderId,
      order_number: orderNumber,
      status: 'pending',
      payment_status: 'pending',
      payment_method: 'paynow',
      customer: { email, name: 'E2E Happy', phone: '500600700' },
      shipping_address: { street: 'ul. Testowa 1', city: 'Warszawa', postalCode: '00-001', country: 'Polska' },
      billing_address: { street: 'ul. Testowa 1', city: 'Warszawa', postalCode: '00-001', country: 'Polska' },
      subtotal: total,
      shipping_cost: 0,
      tax: 0,
      discount: 0,
      total,
      notes: `E2E happy path ${RUN_ID}`,
      created_at: now,
      updated_at: now,
    }),
  })
  assert('G order created pending', order?.payment_status === 'pending', order?.payment_status)

  const payRes = await postJson('/api/abandoned-carts/e2e-mark-order-paid', { orderId })
  if (payRes.status === 404) {
    // Direct DB update + convert API if exists
    await supabaseRest(`orders?id=eq.${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ payment_status: 'paid', status: 'confirmed', updated_at: new Date().toISOString() }),
    })
    const convertRes = await postJson('/api/abandoned-carts/e2e-convert-on-paid', { email, orderId, orderNumber })
    if (convertRes.status === 404) {
      fail('G mark paid via OrderService', 'missing e2e helpers — paid status set in DB only')
      const refreshed = await supabaseRest(`orders?id=eq.${orderId}&select=id,order_number,payment_status,status`)
      assert('G order paid in DB', refreshed[0]?.payment_status === 'paid', refreshed[0]?.payment_status)
      return { orderId, orderNumber, email }
    }
    assert('G convert after paid', convertRes.json?.success === true, JSON.stringify(convertRes.json))
  } else {
    assert('G mark paid API ok', payRes.status === 200 && payRes.json?.success, JSON.stringify(payRes.json))
  }

  const carts = await findCartsByEmail(email)
  const open = carts.filter((c) => ['pending', 'processing', 'exported'].includes(c.status))
  assert('G no open abandoned carts left', open.length === 0, `open=${open.length} statuses=${carts.map((c) => c.status).join(',')}`)
  return { orderId, orderNumber, email, carts }
}

async function main() {
  console.log(`\n=== E2E abandoned-cart flows RUN_ID=${RUN_ID} BASE=${BASE} ===`)

  // Health check
  try {
    const health = await fetch(`${BASE}/api/abandoned-carts`, { method: 'OPTIONS' }).catch(() => null)
    const ping = await postJson('/api/abandoned-carts', {
      sessionId: 'tooshort',
      stage: 'checkout_step2',
      cartHasItems: true,
    })
    assert('Local API reachable', ping.status === 400 || ping.status === 200, `status=${ping.status}`)
  } catch (e) {
    fail('Local API reachable', e.message)
    printSummary()
    process.exit(1)
  }

  const a = await scenarioA_partialHeartbeatStep2()
  const b = await scenarioB_webhookStep2()
  const c = await scenarioC_webhookStep3()
  const d = await scenarioD_paymentRedirect()
  const e = await scenarioE_forceExportAfterFailedPayment(d)
  const f = await scenarioF_promoteOnPaid(e)
  const g = await scenarioG_fullPaidOrderHappyPath()

  printSummary({ a, b, c, d, e, f, g })
  const failed = results.filter((r) => !r.ok).length
  process.exit(failed ? 1 : 0)
}

function printSummary(ctx) {
  console.log('\n=== SUMMARY ===')
  for (const r of results) {
    console.log(`${r.ok ? '✅' : '❌'} ${r.name}${r.detail ? ` | ${r.detail}` : ''}`)
  }
  const failed = results.filter((r) => !r.ok).length
  console.log(`\n${results.length - failed}/${results.length} passed`)
  if (ctx) {
    console.log('\nArtifacts:')
    console.log(JSON.stringify({
      runId: RUN_ID,
      step2PartialSession: ctx.a?.sessionId,
      step2Deal: ctx.b?.dealId,
      step3Deal: ctx.c?.dealId,
      redirectSession: ctx.d?.sessionId,
      exportedAfterFailDeal: ctx.e?.dealId,
      promoted: ctx.f,
      happy: ctx.g,
    }, null, 2))
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
