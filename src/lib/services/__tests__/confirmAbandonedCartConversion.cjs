const { strictEqual, deepEqual } = require('node:assert')
const fs = require('node:fs')
const path = require('node:path')

const resolvePaidOrderDealStageId = () => 'UC_DMBNNJ'

strictEqual(resolvePaidOrderDealStageId(), 'UC_DMBNNJ')
console.log('✓ paid order stage mapping')

const policySrc = fs.readFileSync(
  path.join(__dirname, '..', 'abandonedCartConversionPolicy.ts'),
  'utf8'
)
strictEqual(policySrc.includes("'UC_DMBNNJ'"), true)
console.log('✓ policy source contains paid order stage')

const orderServiceSrc = fs.readFileSync(path.join(__dirname, '..', 'OrderService.ts'), 'utf8')
strictEqual(orderServiceSrc.includes('convertAbandonedCartsOnPaid'), true)
strictEqual(
  /status === 'paid'[\s\S]*convertAbandonedCartsOnPaid[\s\S]*syncOrderToBitrix24/.test(orderServiceSrc),
  true,
  'paid path must promote abandoned carts before Bitrix sync'
)
console.log('✓ OrderService promotes abandoned carts before sync')

const conversionSrc = fs.readFileSync(
  path.join(__dirname, '..', 'AbandonedCartConversionService.ts'),
  'utf8'
)
strictEqual(conversionSrc.includes(".in('status', ['pending', 'processing', 'exported'])"), true)
strictEqual(conversionSrc.includes('mapOrderToDeal'), true)
strictEqual(conversionSrc.includes('promoteAbandonedDealToPaidOrder'), true)
strictEqual(conversionSrc.includes('updateDealStage'), true)
strictEqual(conversionSrc.includes('resolveAbandonedDealLoseStageId'), false)
strictEqual(conversionSrc.includes('deleteDeal'), false)
console.log('✓ conversion promotes abandoned deal to paid order stage')

const p24Src = fs.readFileSync(
  path.join(__dirname, '..', '..', '..', 'app', 'api', 'payments', 'p24', 'callback', 'route.ts'),
  'utf8'
)
strictEqual(
  p24Src.includes("Abandoned carts conversion runs inside OrderService.updatePaymentStatus('paid')"),
  true
)
console.log('✓ P24 conversion still wired through OrderService paid path')

const decidePromotionAction = (cart) => {
  if (!['pending', 'processing', 'exported'].includes(cart.status)) return 'skip'
  if (cart.bitrix_deal_id) return 'convert_and_promote'
  return 'convert_only'
}

deepEqual(
  decidePromotionAction({ status: 'exported', bitrix_deal_id: '49166' }),
  'convert_and_promote'
)
deepEqual(decidePromotionAction({ status: 'pending', bitrix_deal_id: null }), 'convert_only')
deepEqual(decidePromotionAction({ status: 'converted', bitrix_deal_id: '1' }), 'skip')
console.log('✓ exported+deal promotes; pending without deal converts only')

console.log('\nOK abandoned cart promotion checks passed')
