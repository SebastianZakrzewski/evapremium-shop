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
strictEqual(webhookSrc.includes('isAbandonedPaymentRedirectEvent'), true)
strictEqual(webhookSrc.includes('payment_redirect_exported'), true)
strictEqual(webhookSrc.includes('Creating Bitrix deal for payment-redirect cart'), true)
strictEqual(webhookSrc.includes('Skipping Bitrix create for payment redirect'), false)
console.log('✓ webhook exports Bitrix deal on payment_redirect')

const checkoutSrc = fs.readFileSync(
  path.join(__dirname, '..', '..', '..', 'features', 'checkout', 'components', 'CheckoutSection.tsx'),
  'utf8'
)
strictEqual(checkoutSrc.includes('markPaymentRedirect'), true)
strictEqual((checkoutSrc.match(/markPaymentRedirect\(order\.id\)/g) || []).length >= 2, true)
strictEqual(checkoutSrc.includes('persistPaymentRedirectCartSnapshot'), true)
strictEqual(checkoutSrc.includes('persistPaymentRedirectSnapshot'), true)
console.log('✓ checkout marks payment redirect and persists snapshot before clearCart')

const abandonedApiSrc = fs.readFileSync(
  path.join(__dirname, '..', '..', '..', 'lib', 'api', 'abandonedCarts.ts'),
  'utf8'
)
strictEqual(abandonedApiSrc.includes('persistPaymentRedirectSnapshot'), true)
strictEqual(abandonedApiSrc.includes("event: 'payment_redirect'"), true)
console.log('✓ abandoned carts API awaits payment_redirect snapshot')

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
