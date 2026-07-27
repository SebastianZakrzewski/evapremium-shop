#!/usr/bin/env node
/**
 * Verifies shop database access paths after security hardening.
 *
 * Usage:
 *   node scripts/verify-shop-db-access.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import https from 'node:https'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

const ROOT = path.resolve(import.meta.dirname, '..')
const ENV_PATH = path.join(ROOT, '.env')

if (fs.existsSync(ENV_PATH)) {
  dotenv.config({ path: ENV_PATH })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

if (!supabaseUrl || !anonKey || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(supabaseUrl, serviceRoleKey)
const anon = createClient(supabaseUrl, anonKey)

const logResult = (label, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}${detail ? ` -> ${detail}` : ''}`)
}

const run = async () => {
  console.log('=== Shop DB access verification ===')

  const adminOrders = await admin.from('orders').select('id', { count: 'exact', head: true })
  logResult('service_role can read orders', !adminOrders.error, adminOrders.error?.message || `count=${adminOrders.count ?? 0}`)

  const adminAccessories = await admin.from('accessories').select('id', { count: 'exact', head: true })
  logResult(
    'service_role can read accessories',
    !adminAccessories.error,
    adminAccessories.error?.message || `count=${adminAccessories.count ?? 0}`,
  )

  const adminImages = await admin.from('mat_product_images').select('id', { count: 'exact', head: true })
  logResult(
    'service_role can read mat_product_images',
    !adminImages.error,
    adminImages.error?.message || `count=${adminImages.count ?? 0}`,
  )

  const anonOrders = await anon.from('orders').select('id').limit(1)
  logResult(
    'anon cannot read orders',
    Boolean(anonOrders.error) || (anonOrders.data?.length ?? 0) === 0,
    anonOrders.error?.message || `rows=${anonOrders.data?.length ?? 0}`,
  )

  const anonAccessories = await anon.from('accessories').select('id').limit(1)
  logResult(
    'anon can read public accessories',
    !anonAccessories.error && (anonAccessories.data?.length ?? 0) > 0,
    anonAccessories.error?.message || `rows=${anonAccessories.data?.length ?? 0}`,
  )

  const anonUsers = await anon.from('user').select('id').limit(1)
  logResult(
    'anon cannot read user table',
    Boolean(anonUsers.error) || (anonUsers.data?.length ?? 0) === 0,
    anonUsers.error?.message || `rows=${anonUsers.data?.length ?? 0}`,
  )

  process.exit(0)
}

run().catch((error) => {
  console.error('Verification failed:', error)
  process.exit(1)
})
