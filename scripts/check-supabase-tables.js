const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://diqbnsinhsedmvvstvvc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Checking Supabase tables...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? 'SET' : 'NOT SET');

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  const tables = ['mats', 'car_brands', 'car_models'];
  
  for (const table of tables) {
    try {
      console.log(`\n📋 Checking table: ${table}`);
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ Error: ${error.message}`);
        if (error.code) console.log(`   Code: ${error.code}`);
        if (error.details) console.log(`   Details: ${error.details}`);
        if (error.hint) console.log(`   Hint: ${error.hint}`);
      } else {
        console.log(`✅ Table exists, count: ${count || 0}`);
      }
    } catch (err) {
      console.log(`💥 Exception: ${err.message}`);
    }
  }
}

checkTables().catch(console.error);
