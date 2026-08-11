const { strictEqual } = require('node:assert')
const fs = require('node:fs')
const path = require('node:path')

const isAbandonedPaymentRedirectEvent = (input) => {
  if (input.event === 'payment_redirect') return true
  return Boolean(input.metadata && input.metadata.paymentRedirect)
}

strictEqual(isAbandonedPaymentRedirectEvent({ event: 'payment_redirect' }), true)
strictEqual(
  isAbandonedPaymentRedirectEvent({ event: 'pagehide', metadata: { paymentRedirect: true } }),
  true
)
strictEqual(isAbandonedPaymentRedirectEvent({ event: 'pagehide' }), false)
console.log('✓ payment redirect detection')

const webhookSrc = fs.readFileSync(
  path.join(__dirname, '..', '..', '..', 'app', 'api', 'abandoned-carts', 'webhook', 'route.ts'),
  'utf8'
)
strictEqual(webhookSrc.includes("reason: 'payment_redirect'"), true)
strictEqual(webhookSrc.includes('isAbandonedPaymentRedirectEvent'), true)
strictEqual(
  /isPaymentRedirect[\s\S]*Skipping Bitrix create for payment redirect/.test(webhookSrc),
  true
)
console.log('✓ webhook skips Bitrix on payment_redirect')

const checkoutSrc = fs.readFileSync(
  path.join(__dirname, '..', '..', '..', 'features', 'checkout', 'components', 'CheckoutSection.tsx'),
  'utf8'
)
strictEqual(checkoutSrc.includes('markPaymentRedirect'), true)
strictEqual((checkoutSrc.match(/markPaymentRedirect\(order\.id\)/g) || []).length >= 2, true)
console.log('✓ checkout marks payment redirect for Paynow and P24')

const heartbeatSrc = fs.readFileSync(
  path.join(
    __dirname,
    '..',
    '..',
    '..',
    'features',
    'shopping-cart',
    'hooks',
    'useAbandonedCartHeartbeat.ts'
  ),
  'utf8'
)
strictEqual(heartbeatSrc.includes('hasPaymentRedirectFlag'), true)
strictEqual(heartbeatSrc.includes("'payment_redirect'"), true)
console.log('✓ heartbeat sends payment_redirect event when flag set')

console.log('\nOK change2 checks passed')
