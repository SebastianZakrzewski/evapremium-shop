import 'server-only'

import { createClient } from '@supabase/supabase-js'
import { env } from '@/config/env.server'

export const supabaseAdmin = createClient(env.supabase.url, env.supabase.serviceRoleKey)

export const TABLES = {
  MATS: 'CarMat',
  CAR_BRANDS: 'car_brands',
  CAR_MODELS: 'car_models',
  ORDERS: 'orders',
} as const
