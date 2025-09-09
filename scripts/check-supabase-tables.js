const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://diqbnsinhsedmvvstvvc.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpcWJuc2luaHNlZG12dnN0dnZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0MDQ4MDAsImV4cCI6MjA1MTk4MDgwMH0.example';

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
