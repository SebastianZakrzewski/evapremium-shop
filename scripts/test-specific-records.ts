import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://diqbnsinhsedmvvstvvc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  throw new Error('Missing Supabase key');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Import funkcji z głównego skryptu
import { cleanModelName } from './clean-car-models';

async function testSpecificRecords() {
  console.log('🧪 Testowanie konkretnych problematycznych rekordów...\n');
  
  // Pobierz konkretne rekordy
  const { data: records, error } = await supabase
    .from('car_models_extended')
    .select('id, brand_name, model_name')
    .in('id', [2317, 2319, 2879, 2882, 2163, 2168, 3263, 3271, 3266, 2736]);
  
  if (error) {
    console.error('Błąd:', error);
    return;
  }
  
  records?.forEach(record => {
    console.log(`ID ${record.id}: "${record.model_name}" (${record.brand_name})`);
    const result = cleanModelName(record.model_name, record.brand_name);
    console.log(`  → "${result.cleaned}"`);
    if (result.changes.length > 0) {
      console.log(`  Zmiany: ${result.changes.join(', ')}`);
    }
    console.log('');
  });
}

testSpecificRecords().catch(console.error);
