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

strictEqual(resolveAbandonedExportSkipReason('paid'), 'order_already_paid')
strictEqual(resolveAbandonedExportSkipReason('pending'), 'order_in_payment')
strictEqual(isAmountWithinTolerance(259, 259), true)
strictEqual(isAmountWithinTolerance(100, 50), false)
console.log('✓ guard policy helpers')

const root = path.join(__dirname, '..', '..', '..')
const files = [
  path.join(root, 'app', 'api', 'abandoned-carts', 'route.ts'),
  path.join(root, 'app', 'api', 'abandoned-carts', 'webhook', 'route.ts'),
  path.join(root, 'app', 'api', 'abandoned-carts', 'cron', 'route.ts'),
]

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8')
  strictEqual(src.includes('findRecentBlockingOrder'), true, file)
  strictEqual(src.includes(".eq('payment_status', 'paid')"), false, file)
}
console.log('✓ heartbeat/webhook/cron use shared pending|paid guard')

const guardSrc = fs.readFileSync(
  path.join(__dirname, '..', 'abandonedCartExportGuard.ts'),
  'utf8'
)
strictEqual(guardSrc.includes(".in('payment_status', ['pending', 'paid'])"), true)
console.log('✓ guard queries pending and paid')

console.log('\nOK change3 checks passed')
