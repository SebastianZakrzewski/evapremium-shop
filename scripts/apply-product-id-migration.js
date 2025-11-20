const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Sprawdź zmienne środowiskowe - najpierw z .env.local, potem z process.env, na końcu domyślne wartości
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://kmepxyervpeujwvgdqtm.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZXB4eWVydnBldWp3dmdkcXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzUwOTQyNSwiZXhwIjoyMDczMDg1NDI1fQ.sr3YFtozFZCJpTKTfjX7180oI_fjT0rxG0sx2i0YKlI';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Brak zmiennych środowiskowych SUPABASE_URL lub SUPABASE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    console.log('🔍 Sprawdzanie aktualnego typu kolumny product_id...');
    
    // Sprawdź typ kolumny
    const { data: columns, error: checkError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, character_maximum_length')
      .eq('table_name', 'order_items')
      .eq('column_name', 'product_id');
    
    if (checkError) {
      console.error('❌ Błąd podczas sprawdzania typu kolumny:', checkError);
      return;
    }
    
    if (!columns || columns.length === 0) {
      console.error('❌ Nie znaleziono kolumny product_id w tabeli order_items');
      return;
    }
    
    console.log('📊 Aktualny typ kolumny product_id:', columns[0]);
    
    if (columns[0].data_type === 'character varying') {
      console.log('✅ Kolumna product_id jest już typu VARCHAR - migracja nie jest potrzebna');
      return;
    }
    
    if (columns[0].data_type === 'uuid') {
      console.log('🔄 Zmieniam typ kolumny product_id z UUID na VARCHAR(255)...');
      
      // W Supabase trzeba użyć RPC lub bezpośredniego SQL przez dashboard
      // Spróbujmy użyć RPC exec_sql jeśli istnieje
      const { error: migrationError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE order_items ALTER COLUMN product_id TYPE VARCHAR(255);'
      });
      
      if (migrationError) {
        console.error('❌ Błąd podczas migracji przez RPC:', migrationError);
        console.log('\n💡 Alternatywnie, wykonaj migrację bezpośrednio w Supabase Dashboard:');
        console.log('   ALTER TABLE order_items ALTER COLUMN product_id TYPE VARCHAR(255);');
        console.log('\n   Lub użyj psql:');
        console.log(`   psql -h ${supabaseUrl.replace('https://', '').split('.')[0]}.supabase.co -U postgres -d postgres -c "ALTER TABLE order_items ALTER COLUMN product_id TYPE VARCHAR(255);"`);
        return;
      }
      
      console.log('✅ Migracja wykonana pomyślnie!');
      
      // Sprawdź nowy typ kolumny
      const { data: newColumns, error: newColumnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, character_maximum_length')
        .eq('table_name', 'order_items')
        .eq('column_name', 'product_id');
      
      if (newColumnsError) {
        console.error('❌ Błąd podczas sprawdzania nowego typu kolumny:', newColumnsError);
        return;
      }
      
      console.log('📊 Nowy typ kolumny product_id:', newColumns[0]);
      
    } else {
      console.log('⚠️ Nieoczekiwany typ kolumny:', columns[0].data_type);
    }
    
  } catch (error) {
    console.error('❌ Błąd podczas wykonywania migracji:', error);
    console.log('\n💡 Wykonaj migrację bezpośrednio w Supabase Dashboard SQL Editor:');
    console.log('   ALTER TABLE order_items ALTER COLUMN product_id TYPE VARCHAR(255);');
  }
}

// Uruchom migrację
applyMigration().catch(console.error);

