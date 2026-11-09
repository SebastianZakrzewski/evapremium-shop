import { OrderRepository } from '@/lib/repositories/OrderRepository'
import { readServerTrackingEnv } from './gate'
import { trackPaidPaynowPurchase, type TrackPaidPaynowInput } from './sendPurchase'

export const trackPaidPaynowPurchaseFromDatabase = async (
  input: TrackPaidPaynowInput
): Promise<void> => {
  const repository = new OrderRepository()
  await trackPaidPaynowPurchase(input, {
    env: readServerTrackingEnv(),
    fetchImpl: fetch,
    loadOrder: (orderId) => repository.findById(orderId),
    saveTracking: (orderId, tracking) => repository.updatePurchaseTracking(orderId, tracking),
  })
}
