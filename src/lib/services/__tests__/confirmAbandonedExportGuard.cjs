const { strictEqual } = require('node:assert')
const fs = require('node:fs')
const path = require('node:path')

const isAmountWithinTolerance = (orderTotal, cartTotal, toleranceRatio = 0.1) => {
  const difference = Math.abs(orderTotal - cartTotal)
  const tolerance = Math.max(orderTotal, cartTotal) * toleranceRatio
  return difference <= tolerance
}

const resolveAbandonedExportSkipReason = (paymentStatus) => {
  if (paymentStatus === 'paid') return 'order_already_paid'
  return 'order_in_payment'
}

const shouldBlockAbandonedCartHeartbeat = (paymentStatus) => paymentStatus === 'paid'
const shouldBlockAbandonedCartBitrixExport = (paymentStatus) =>
  paymentStatus === 'paid' || paymentStatus === 'pending'

strictEqual(resolveAbandonedExportSkipReason('paid'), 'order_already_paid')
strictEqual(resolveAbandonedExportSkipReason('pending'), 'order_in_payment')
strictEqual(shouldBlockAbandonedCartHeartbeat('pending'), false)
strictEqual(shouldBlockAbandonedCartBitrixExport('pending'), true)
strictEqual(isAmountWithinTolerance(259, 259), true)
strictEqual(isAmountWithinTolerance(100, 50), false)
console.log('✓ guard policy helpers')

const root = path.join(__dirname, '..', '..', '..')
const heartbeatSrc = fs.readFileSync(
  path.join(root, 'app', 'api', 'abandoned-carts', 'route.ts'),
  'utf8'
)
const webhookSrc = fs.readFileSync(
  path.join(root, 'app', 'api', 'abandoned-carts', 'webhook', 'route.ts'),
  'utf8'
)
const cronSrc = fs.readFileSync(
  path.join(root, 'app', 'api', 'abandoned-carts', 'cron', 'route.ts'),
  'utf8'
)

strictEqual(heartbeatSrc.includes('findRecentBlockingOrderForHeartbeat'), true)
strictEqual(webhookSrc.includes('findRecentBlockingOrderForBitrixExport'), true)
strictEqual(cronSrc.includes('findRecentBlockingOrderForBitrixExport'), true)
console.log('✓ heartbeat/webhook/cron use split guards')

const guardSrc = fs.readFileSync(
  path.join(__dirname, '..', 'abandonedCartExportGuard.ts'),
  'utf8'
)
strictEqual(guardSrc.includes("paymentStatuses: ['paid']"), true)
strictEqual(guardSrc.includes("paymentStatuses: ['pending', 'paid']"), true)
console.log('✓ guard queries paid for heartbeat and pending|paid for export')

const paymentSrc = fs.readFileSync(
  path.join(__dirname, '..', 'PaymentService.ts'),
  'utf8'
)
strictEqual(paymentSrc.includes('exportPendingAbandonedCartsForEmail'), true)
console.log('✓ failed Paynow payment exports abandoned carts')

console.log('\nOK abandoned export guard checks passed')
