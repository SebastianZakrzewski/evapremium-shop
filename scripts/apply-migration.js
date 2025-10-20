/**
 * Skrypt do zastosowania migracji p24_order_id z Int na String
 * 
 * Ten skrypt łączy się z bazą danych Supabase i wykonuje migrację
 */

const { createClient } = require('@supabase/supabase-js');

// Konfiguracja Supabase
const supabaseUrl = 'https://kmepxyervpeujwvgdqtm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZXB4eWVydnBldWp3dmdkcXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzUwOTQyNSwiZXhwIjoyMDczMDg1NDI1fQ.sr3YFtozFZCJpTKTfjX7180oI_fjT0rxG0sx2i0YKlI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    console.log('🔄 Łączenie z bazą danych Supabase...');
    
    // Sprawdź czy tabela orders istnieje
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'orders');
    
    if (tablesError) {
      console.error('❌ Błąd podczas sprawdzania tabel:', tablesError);
      return;
    }
    
    if (!tables || tables.length === 0) {
      console.log('❌ Tabela orders nie istnieje');
      return;
    }
    
    console.log('✅ Tabela orders istnieje');
    
    // Sprawdź aktualny typ kolumny p24_order_id
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, character_maximum_length')
      .eq('table_name', 'orders')
      .eq('column_name', 'p24_order_id');
    
    if (columnsError) {
      console.error('❌ Błąd podczas sprawdzania kolumn:', columnsError);
      return;
    }
    
    if (!columns || columns.length === 0) {
      console.log('❌ Kolumna p24_order_id nie istnieje');
      return;
    }
    
    console.log('📊 Aktualny typ kolumny p24_order_id:', columns[0]);
    
    if (columns[0].data_type === 'character varying') {
      console.log('✅ Kolumna p24_order_id jest już typu VARCHAR - migracja nie jest potrzebna');
      return;
    }
    
    if (columns[0].data_type === 'integer') {
      console.log('🔄 Zmieniam typ kolumny p24_order_id z INTEGER na VARCHAR(50)...');
      
      // Wykonaj migrację
      const { error: migrationError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE orders ALTER COLUMN p24_order_id TYPE VARCHAR(50);'
      });
      
      if (migrationError) {
        console.error('❌ Błąd podczas migracji:', migrationError);
        return;
      }
      
      console.log('✅ Migracja wykonana pomyślnie!');
      
      // Sprawdź nowy typ kolumny
      const { data: newColumns, error: newColumnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, character_maximum_length')
        .eq('table_name', 'orders')
        .eq('column_name', 'p24_order_id');
      
      if (newColumnsError) {
        console.error('❌ Błąd podczas sprawdzania nowego typu kolumny:', newColumnsError);
        return;
      }
      
      console.log('📊 Nowy typ kolumny p24_order_id:', newColumns[0]);
      
    } else {
      console.log('⚠️ Nieoczekiwany typ kolumny:', columns[0].data_type);
    }
    
  } catch (error) {
    console.error('❌ Błąd podczas wykonywania migracji:', error);
  }
}

// Uruchom migrację
applyMigration().catch(console.error);
