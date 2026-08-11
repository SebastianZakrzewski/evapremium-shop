const { strictEqual, deepEqual } = require('node:assert')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

const policyPath = path.join(__dirname, '..', 'bitrixPaymentSyncPolicy.ts')
const raw = fs.readFileSync(policyPath, 'utf8')

const stripped = raw
  .replace(/\/\*\*[\s\S]*?\*\//g, '')
  .replace(/export type [\s\S]*?(?=\n(?:export )?const |\n$)/g, '')
  .replace(/export /g, '')
  .replace(/:\s*PaymentStatusForBitrix/g, '')
  .replace(/:\s*BitrixPaymentSyncDecision/g, '')
  .replace(/:\s*BitrixDealSyncAction/g, '')
  .replace(/:\s*boolean/g, '')

const sandbox = { module: { exports: {} }, exports: {} }
vm.runInNewContext(
  `${stripped}\nmodule.exports = { resolveBitrixPaymentSyncDecision, resolveBitrixDealSyncAction }`,
  sandbox
)
const { resolveBitrixPaymentSyncDecision, resolveBitrixDealSyncAction } = sandbox.module.exports

const policyCases = [
  ['paid', { shouldSync: true, createIfMissing: true }],
  ['failed', { shouldSync: true, createIfMissing: false }],
  ['refunded', { shouldSync: true, createIfMissing: false }],
  ['pending', { shouldSync: false, createIfMissing: false }],
]

const scenarioCases = [
  ['REJECTED without deal -> skip create (regression ORD-236)', 'failed', false, 'skip'],
  ['CONFIRMED without deal -> create', 'paid', false, 'create'],
  ['REJECTED with existing deal -> update', 'failed', true, 'update'],
  ['refunded with existing deal -> update', 'refunded', true, 'update'],
  ['pending never touches Bitrix', 'pending', false, 'skip'],
  ['paid with existing deal -> update', 'paid', true, 'update'],
]

let passed = 0

for (const [status, expected] of policyCases) {
  deepEqual(resolveBitrixPaymentSyncDecision(status), expected)
  console.log(`✓ policy: ${status}`)
  passed += 1
}

for (const [name, status, dealExists, expected] of scenarioCases) {
  strictEqual(resolveBitrixDealSyncAction(status, dealExists), expected, name)
  console.log(`✓ ${name}`)
  passed += 1
}

const createIfMissingFor = (status) => resolveBitrixPaymentSyncDecision(status).createIfMissing
strictEqual(createIfMissingFor('paid'), true)
strictEqual(createIfMissingFor('failed'), false)
strictEqual(createIfMissingFor('refunded'), false)
strictEqual(createIfMissingFor('pending'), false)
console.log('✓ OrderService createIfMissing wiring')
passed += 1

const orderServicePath = path.join(__dirname, '..', '..', '..', 'services', 'OrderService.ts')
const orderServiceSrc = fs.readFileSync(orderServicePath, 'utf8')
strictEqual(
  orderServiceSrc.includes('resolveBitrixPaymentSyncDecision'),
  true,
  'OrderService must use resolveBitrixPaymentSyncDecision'
)
strictEqual(
  orderServiceSrc.includes('createIfMissing: syncDecision.createIfMissing'),
  true,
  'OrderService must pass createIfMissing from policy'
)
strictEqual(
  /Bitrix deal is created only after successful payment/.test(orderServiceSrc),
  true,
  'createOrder must not auto-sync unpaid orders to Bitrix'
)
console.log('✓ OrderService source wiring guards')
passed += 1

console.log(`\nOK ${passed} checks passed`)
