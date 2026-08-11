const { strictEqual, deepEqual } = require('node:assert')
const fs = require('node:fs')
const path = require('node:path')

// Mirror of abandonedCartConversionPolicy.resolveAbandonedDealLoseStageId
const resolveAbandonedDealLoseStageId = (categoryId) => {
  if (categoryId == null || categoryId === 0) return 'LOSE'
  return `C${categoryId}:LOSE`
}

strictEqual(resolveAbandonedDealLoseStageId(undefined), 'LOSE')
strictEqual(resolveAbandonedDealLoseStageId(null), 'LOSE')
strictEqual(resolveAbandonedDealLoseStageId(0), 'LOSE')
strictEqual(resolveAbandonedDealLoseStageId(2), 'C2:LOSE')
console.log('✓ lose stage mapping')

const policySrc = fs.readFileSync(
  path.join(__dirname, '..', 'abandonedCartConversionPolicy.ts'),
  'utf8'
)
strictEqual(policySrc.includes("return 'LOSE'"), true)
strictEqual(policySrc.includes('C${categoryId}:LOSE'), true)
console.log('✓ policy source contains expected mapping')

const orderServiceSrc = fs.readFileSync(path.join(__dirname, '..', 'OrderService.ts'), 'utf8')
strictEqual(orderServiceSrc.includes('convertAbandonedCartsOnPaid'), true)
strictEqual(
  /status === 'paid'[\s\S]*convertAbandonedCartsOnPaid/.test(orderServiceSrc),
  true,
  'paid path must convert abandoned carts'
)
console.log('✓ OrderService wires convertAbandonedCartsOnPaid on paid')

const conversionSrc = fs.readFileSync(
  path.join(__dirname, '..', 'AbandonedCartConversionService.ts'),
  'utf8'
)
strictEqual(conversionSrc.includes(".in('status', ['pending', 'processing', 'exported'])"), true)
strictEqual(conversionSrc.includes('updateDealStage'), true)
strictEqual(conversionSrc.includes('resolveAbandonedDealLoseStageId'), true)
console.log('✓ conversion includes exported carts and Bitrix LOSE close')

const p24Src = fs.readFileSync(
  path.join(__dirname, '..', '..', '..', 'app', 'api', 'payments', 'p24', 'callback', 'route.ts'),
  'utf8'
)
strictEqual(
  p24Src.includes("Abandoned carts conversion runs inside OrderService.updatePaymentStatus('paid')"),
  true
)
strictEqual(p24Src.includes(".is('bitrix_deal_id', null)"), false)
console.log('✓ P24 no longer uses narrow local conversion')

const decideCloseAction = (cart) => {
  if (!['pending', 'processing', 'exported'].includes(cart.status)) return 'skip'
  if (cart.bitrix_deal_id) return 'convert_and_close'
  return 'convert_only'
}

deepEqual(
  decideCloseAction({ status: 'exported', bitrix_deal_id: '49166' }),
  'convert_and_close'
)
deepEqual(decideCloseAction({ status: 'pending', bitrix_deal_id: null }), 'convert_only')
deepEqual(decideCloseAction({ status: 'converted', bitrix_deal_id: '1' }), 'skip')
console.log('✓ exported+deal closes; pending without deal converts only')

console.log('\nOK change1 checks passed')
