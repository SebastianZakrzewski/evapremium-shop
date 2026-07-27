import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/database/supabase', () => ({
  supabaseAdmin: { from: vi.fn() },
}))

import { OrderRepository } from '../OrderRepository'
import { supabaseAdmin } from '@/lib/database/supabase'

describe('OrderRepository', () => {
  it('uses supabaseAdmin instead of the public anon key', () => {
    const repository = new OrderRepository()

    expect(repository.supabase).toBe(supabaseAdmin)
  })
})
