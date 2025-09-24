const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkTableStructure() {
  try {
    console.log('🔍 Sprawdzam strukturę tabeli Mats...');
    
    // Sprawdź czy tabela istnieje
    const { data: tables, error: tablesError } = await supabase
      .rpc('exec_sql', {
        sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Mats';"
      });
    
    if (tablesError) {
      console.log('❌ Błąd przy sprawdzaniu tabel:', tablesError);
      return;
    }
    
    console.log('📋 Tabele:', tables);
    
    // Sprawdź kolumny tabeli Mats
    const { data: columns, error: columnsError } = await supabase
      .rpc('exec_sql', {
        sql: "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'Mats' ORDER BY ordinal_position;"
      });
    
    if (columnsError) {
      console.log('❌ Błąd przy sprawdzaniu kolumn:', columnsError);
      return;
    }
    
    console.log('📊 Kolumny tabeli Mats:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
  } catch (err) {
    console.error('💥 Błąd:', err.message);
  }
}

checkTableStructure();
