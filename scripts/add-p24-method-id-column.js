/**
 * Skrypt do dodania kolumny p24_method_id do tabeli orders w Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Wczytaj zmienne środowiskowe z .env
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');

let supabaseUrl = '';
let supabaseKey = '';

envLines.forEach(line => {
  const [key, value] = line.split('=');
  if (key === 'NEXT_PUBLIC_SUPABASE_URL') {
    supabaseUrl = value?.trim();
  }
  if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
    supabaseKey = value?.trim();
  }
});

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Brak zmiennych SUPABASE_URL lub SUPABASE_ANON_KEY w .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addP24MethodIdColumn() {
  try {
    console.log('🔄 Dodawanie kolumny p24_method_id do tabeli orders...');
    
    // Wykonaj SQL ALTER TABLE
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE orders ADD COLUMN p24_method_id INTEGER;'
    });

    if (error) {
      // Jeśli kolumna już istnieje, to nie jest błąd
      if (error.message.includes('already exists') || error.message.includes('duplicate column')) {
        console.log('✅ Kolumna p24_method_id już istnieje');
        return;
      }
      throw error;
    }

    console.log('✅ Kolumna p24_method_id została dodana pomyślnie');
    
    // Sprawdź czy kolumna została dodana
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'orders')
      .eq('column_name', 'p24_method_id');

    if (columnsError) {
      console.log('⚠️ Nie można sprawdzić kolumny:', columnsError.message);
    } else if (columns && columns.length > 0) {
      console.log('✅ Kolumna p24_method_id została potwierdzona:', columns[0]);
    }

  } catch (error) {
    console.error('❌ Błąd podczas dodawania kolumny:', error.message);
    
    // Spróbuj alternatywnej metody przez SQL editor
    console.log('\n🔧 Alternatywne rozwiązanie:');
    console.log('1. Otwórz Supabase Dashboard');
    console.log('2. Przejdź do SQL Editor');
    console.log('3. Wykonaj następujący SQL:');
    console.log('\nALTER TABLE orders ADD COLUMN p24_method_id INTEGER;');
    console.log('\nCOMMENT ON COLUMN orders.p24_method_id IS \'ID metody płatności wybranej w Przelewy24\';');
  }
}

// Uruchom skrypt
addP24MethodIdColumn();
