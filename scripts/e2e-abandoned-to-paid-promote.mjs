/**
 * Focused E2E: payment_redirect abandoned cart → mark order paid → Bitrix paid stage.
 * Usage: node --use-system-ca scripts/e2e-abandoned-to-paid-promote.mjs
 */
import fs from 'fs'
import crypto from 'crypto'

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000'
const SUPABASE_URL = 'https://kmepxyervpeujwvgdqtm.supabase.co'
const RUN_ID = Date.now().toString(36)
const PAID_STAGE = 'UC_DMBNNJ'
const PAID_CATEGORY = '0'

const env = fs.readFileSync('.env', 'utf8')
const getEnv = (key) => env.match(new RegExp(`^${key}=(.+)$`, 'm'))?.[1]?.trim()
const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY')
const bitrixBase =
  getEnv('BITRIX24_WEBHOOK_URL') ||
  getEnv('BITRIX24_WEBHOOK') ||
  getEnv('NEXT_PUBLIC_BITRIX24_WEBHOOK_URL')

if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
if (!bitrixBase) throw new Error('Missing Bitrix webhook URL')

const results = []
const pass = (name, detail) => {
  results.push({ ok: true, name, detail })
  console.log(`✅ ${name}${detail ? ` — ${detail}` : ''}`)
}
const fail = (name, detail) => {
  results.push({ ok: false, name, detail })
  console.error(`❌ ${name} — ${detail}`)
}
const assert = (name, condition, detail) => {
  if (condition) pass(name, detail)
  else fail(name, detail)
}

const postJson = async (path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  let json
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = { raw: text }
  }
  return { status: res.status, json }
}

const supabaseRest = async (path, options = {}) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
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

const getBitrixDeal = async (dealId) => {
  const endpoint = `${bitrixBase.replace(/\/$/, '')}/crm.deal.get.json?ID=${dealId}`
  const res = await fetch(endpoint)
  const json = await res.json()
  return {
    id: json.result?.ID,
    title: json.result?.TITLE,
    stage: json.result?.STAGE_ID,
    category: json.result?.CATEGORY_ID,
    origin: json.result?.ORIGIN_ID,
    opportunity: json.result?.OPPORTUNITY,
  }
}

const sessionId = `session-promote-${RUN_ID}-Mozilla/5.-1920x1080`
const email = `e2e.promote.${RUN_ID}@evapremium-test.local`

const payload = {
  sessionId,
  stage: 'checkout_step3',
  cartHasItems: true,
  event: 'payment_redirect',
  contact: {
    firstName: 'E2E',
    lastName: 'Promote',
    email,
    phone: '500600700',
  },
  address: {
    street: 'ul. Testowa 1',
    city: 'Warszawa',
    postalCode: '00-001',
    country: 'Polska',
  },
  car: { make: 'BMW', model: 'X5', year: 2020, bodyType: 'SUV' },
  configuration: {
    variant: 'full',
    setType: 'classic',
    cellShape: 'diamond',
    materialColor: 'black',
    trimColor: 'black',
  },
  items: [
    {
      productId: 'e2e-mat',
      productName: 'Dywaniki EVA E2E Promote',
      productType: 'mat',
      quantity: 1,
      price: 259,
      currency: 'PLN',
    },
  ],
  currency: 'PLN',
  totalAmount: 259,
  metadata: { paymentRedirect: true, e2eRunId: RUN_ID },
}

console.log(`\n=== Abandoned → Paid promote RUN_ID=${RUN_ID} ===\n`)

// 1) Create abandoned Bitrix deal via payment_redirect
const exportRes = await postJson('/api/abandoned-carts/webhook', payload)
console.log('payment_redirect response', exportRes)
assert(
  '1. payment_redirect exported',
  exportRes.status === 200 && exportRes.json?.success === true && !!exportRes.json?.dealId,
  JSON.stringify(exportRes.json)
)

const abandonedDealId = String(exportRes.json?.dealId || '')
const cartId = exportRes.json?.recordId

await new Promise((r) => setTimeout(r, 1500))
const before = await getBitrixDeal(abandonedDealId)
console.log('Bitrix before paid', before)
assert('2. abandoned deal exists', !!before.id, JSON.stringify(before))
assert(
  '3. abandoned stage (not paid yet)',
  before.stage !== PAID_STAGE,
  `stage=${before.stage} category=${before.category}`
)

// 2) Insert pending order, then mark paid through OrderService
const orderId = crypto.randomUUID()
const orderNumber = `ORD-2026-PROM${RUN_ID.slice(-5)}`
const now = new Date().toISOString()

const [order] = await supabaseRest('orders', {
  method: 'POST',
  prefer: 'return=representation',
  body: JSON.stringify({
    id: orderId,
    order_number: orderNumber,
    status: 'pending',
    payment_status: 'pending',
    payment_method: 'paynow',
    customer: { email, name: 'E2E Promote', phone: '500600700' },
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
    subtotal: 259,
    shipping_cost: 0,
    tax: 0,
    discount: 0,
    total: 259,
    notes: `E2E promote ${RUN_ID}`,
    created_at: now,
    updated_at: now,
  }),
})
assert('4. pending order created', order?.id === orderId, order?.id)

const paidRes = await postJson('/api/abandoned-carts/e2e-mark-order-paid', { orderId })
console.log('mark paid response', paidRes)
assert(
  '5. OrderService mark paid ok',
  paidRes.status === 200 && paidRes.json?.success === true && paidRes.json?.paymentStatus === 'paid',
  JSON.stringify(paidRes.json)
)

await new Promise((r) => setTimeout(r, 2000))

const carts = await supabaseRest(
  `abandoned_carts?id=eq.${cartId}&select=id,status,bitrix_deal_id,metadata`
)
const cart = carts[0]
assert('6. cart status converted', cart?.status === 'converted', cart?.status)

const promotedDealId = String(
  cart?.metadata?.promoted_deal_id || cart?.bitrix_deal_id || abandonedDealId
)
const after = await getBitrixDeal(promotedDealId)
console.log('Bitrix after paid', after)

assert('7. paid deal exists', !!after.id, JSON.stringify(after))
assert(
  '8. Bitrix category is paid pipeline (0)',
  String(after.category) === PAID_CATEGORY,
  `category=${after.category}`
)
assert(
  '9. Bitrix stage is Zamówienia ze strony opłacone (UC_DMBNNJ)',
  after.stage === PAID_STAGE,
  `stage=${after.stage}`
)

// If recreate happened, old abandoned deal should be gone or no longer the active one
if (promotedDealId !== abandonedDealId) {
  const oldDeal = await getBitrixDeal(abandonedDealId)
  console.log('Old abandoned deal after recreate', oldDeal)
  assert(
    '10. old abandoned deal removed or missing',
    !oldDeal.id,
    JSON.stringify(oldDeal)
  )
} else {
  pass('10. in-place pipeline move (same deal id)', abandonedDealId)
}

console.log('\n=== SUMMARY ===')
for (const r of results) {
  console.log(`${r.ok ? '✅' : '❌'} ${r.name}${r.detail ? ` | ${r.detail}` : ''}`)
}
const failed = results.filter((r) => !r.ok).length
console.log(`\n${results.length - failed}/${results.length} passed`)
console.log(
  JSON.stringify(
    {
      runId: RUN_ID,
      email,
      cartId,
      abandonedDealId,
      promotedDealId,
      orderId,
      orderNumber,
      before,
      after,
    },
    null,
    2
  )
)

process.exit(failed ? 1 : 0)
