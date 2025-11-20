/**
 * Skrypt do zastosowania migracji: zmiana product_id na nullable dla matów w order_items
 * 
 * Ten skrypt wykonuje migrację SQL, która zmienia kolumnę product_id na nullable,
 * aby umożliwić zapisywanie matów (produktów konfigurowanych) bez wymaganego UUID.
 */

const { createClient } = require('@supabase/supabase-js');
// Ładuj zmienne z .env.local (priorytet) lub .env
require('dotenv').config({ path: '.env.local' });
require('dotenv').config(); // Fallback do .env

// Sprawdź zmienne środowiskowe (w kolejności priorytetu)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Brak zmiennych środowiskowych SUPABASE_URL lub SUPABASE_KEY');
  console.error('   Upewnij się, że plik .env lub .env.local zawiera:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL=...');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=... (lub NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  console.error('\n   Sprawdzane zmienne:');
  console.error(`   NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓' : '✗'}`);
  console.error(`   SUPABASE_URL: ${process.env.SUPABASE_URL ? '✓' : '✗'}`);
  console.error(`   SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗'}`);
  console.error(`   SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? '✓' : '✗'}`);
  console.error(`   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓' : '✗'}`);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    console.log('🔄 Łączenie z bazą danych Supabase...');
    console.log(`   URL: ${supabaseUrl}`);
    
    // Sprawdź czy tabela order_items istnieje
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'order_items');
    
    if (tablesError) {
      console.error('❌ Błąd podczas sprawdzania tabel:', tablesError);
      console.log('\n💡 Wykonaj migrację bezpośrednio w Supabase Dashboard SQL Editor:');
      showManualInstructions();
      return;
    }
    
    if (!tables || tables.length === 0) {
      console.log('❌ Tabela order_items nie istnieje');
      return;
    }
    
    console.log('✅ Tabela order_items istnieje');
    
    // Sprawdź aktualny stan kolumny product_id
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'order_items')
      .eq('column_name', 'product_id');
    
    if (columnsError) {
      console.error('❌ Błąd podczas sprawdzania kolumn:', columnsError);
      showManualInstructions();
      return;
    }
    
    if (!columns || columns.length === 0) {
      console.log('❌ Kolumna product_id nie istnieje w tabeli order_items');
      return;
    }
    
    const columnInfo = columns[0];
    console.log('📊 Aktualny stan kolumny product_id:');
    console.log(`   Typ: ${columnInfo.data_type}`);
    console.log(`   Nullable: ${columnInfo.is_nullable}`);
    
    if (columnInfo.is_nullable === 'YES') {
      console.log('✅ Kolumna product_id jest już nullable - migracja nie jest potrzebna');
      return;
    }
    
    console.log('🔄 Zmieniam kolumnę product_id na nullable...');
    
    // W Supabase nie można bezpośrednio wykonać ALTER TABLE przez API
    // Musimy użyć RPC lub wykonać przez SQL Editor
    // Spróbujmy użyć RPC exec_sql jeśli istnieje
    const { error: migrationError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE order_items ALTER COLUMN product_id DROP NOT NULL;'
    });
    
    if (migrationError) {
      console.error('❌ Błąd podczas migracji przez RPC:', migrationError);
      console.log('\n💡 Supabase API nie pozwala na bezpośrednie wykonanie ALTER TABLE.');
      console.log('   Wykonaj migrację ręcznie w Supabase Dashboard SQL Editor:');
      showManualInstructions();
      return;
    }
    
    console.log('✅ Migracja wykonana pomyślnie!');
    
    // Sprawdź nowy stan kolumny
    const { data: newColumns, error: newColumnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'order_items')
      .eq('column_name', 'product_id');
    
    if (newColumnsError) {
      console.error('❌ Błąd podczas sprawdzania nowego stanu kolumny:', newColumnsError);
      return;
    }
    
    console.log('📊 Nowy stan kolumny product_id:');
    console.log(`   Typ: ${newColumns[0].data_type}`);
    console.log(`   Nullable: ${newColumns[0].is_nullable}`);
    
    if (newColumns[0].is_nullable === 'YES') {
      console.log('\n🎉 Migracja zakończona sukcesem!');
      console.log('   Kolumna product_id jest teraz nullable dla matów.');
    }
    
  } catch (error) {
    console.error('❌ Błąd podczas wykonywania migracji:', error);
    showManualInstructions();
  }
}

function showManualInstructions() {
  console.log('\n📝 INSTRUKCJE WYKONANIA MIGRACJI RĘCZNIE:');
  console.log('\n1. Otwórz Supabase Dashboard: https://supabase.com/dashboard');
  console.log('2. Wybierz swój projekt');
  console.log('3. Przejdź do SQL Editor');
  console.log('4. Wykonaj następujące zapytanie SQL:');
  console.log('\n   ALTER TABLE order_items ALTER COLUMN product_id DROP NOT NULL;');
  console.log('\n5. Opcjonalnie zaktualizuj komentarz:');
  console.log('   COMMENT ON COLUMN order_items.product_id IS \'ID z tabeli accessories (dla akcesoriów) lub NULL (dla matów - produkty konfigurowane)\';');
  console.log('\n6. Kliknij "Run" aby wykonać migrację');
}

// Uruchom migrację
applyMigration().catch(console.error);

