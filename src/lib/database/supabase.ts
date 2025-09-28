import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://diqbnsinhsedmvvstvvc.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseKey) {
  throw new Error('Missing Supabase key. Please set SUPABASE_KEY or SUPABASE_ANON_KEY environment variable.');
}

// Client for client-side operations (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Service role client for server-side operations (admin privileges)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase;

// Database table names
export const TABLES = {
  MATS: 'CarMat',
  CAR_BRANDS: 'car_brands',
  CAR_MODELS: 'car_models',
  ORDERS: 'orders'
} as const;
