const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://diqbnsinhsedmvvstvvc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Debug Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseKey ? supabaseKey.length : 'NOT SET');
console.log('Key preview:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'NOT SET');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n🧪 Testing connection...');
    
    // Test with a simple query
    const { data, error } = await supabase
      .from('mats')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error details:');
      console.log('  Message:', error.message);
      console.log('  Code:', error.code);
      console.log('  Details:', error.details);
      console.log('  Hint:', error.hint);
      console.log('  Status:', error.status);
    } else {
      console.log('✅ Connection successful!');
      console.log('  Data:', data);
    }
  } catch (err) {
    console.log('💥 Exception:', err.message);
  }
}

testConnection();
