/**
 * Skrypt do dodania nowego akcesorium: podpietka EVAPREMIUM plastry miodu
 * 
 * Ten skrypt dodaje nowy rekord do tabeli accessories w bazie Supabase.
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
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addPodpietkaEvapremium() {
  try {
    console.log('🔄 Łączenie z bazą danych Supabase...');
    console.log(`   URL: ${supabaseUrl}`);
    
    // Sprawdź czy kategoria "Podpiętki" istnieje (id: 2)
    console.log('\n📋 Sprawdzanie kategorii "Podpiętki"...');
    const { data: category, error: categoryError } = await supabase
      .from('accessory_categories')
      .select('id, name')
      .eq('id', 2)
      .single();
    
    if (categoryError || !category) {
      console.error('❌ Błąd: Kategoria "Podpiętki" (id: 2) nie istnieje w bazie danych');
      console.error('   Najpierw utwórz kategorię w tabeli accessory_categories');
      return;
    }
    
    console.log(`✅ Znaleziono kategorię: ${category.name} (id: ${category.id})`);
    
    // Przygotuj dane akcesorium
    const accessoryData = {
      name: 'Podpietka EVAPREMIUM plastry miodu',
      slug: 'podpietka-evapremium-plastry-miodu',
      description: 'Elegancka podpietka EVAPREMIUM z wzorem plastrów miodu wykonana z materiału EVA',
      price: 34.99,
      sku: 'POD-EVAPREM',
      image_src: null,
      features: ['Materiał EVA', 'Wzór plastrów miodu', 'Premium', 'Trwałe'],
      in_stock: true,
      stock_quantity: null,
      is_active: true,
      rating: 4.8,
      review_count: 0,
      category_id: 2
    };
    
    // Sprawdź czy akcesorium o tym samym slug już istnieje
    console.log('\n🔍 Sprawdzanie czy akcesorium już istnieje...');
    const { data: existing } = await supabase
      .from('accessories')
      .select('id, name, slug')
      .eq('slug', accessoryData.slug)
      .single();
    
    if (existing) {
      console.log(`⚠️  Akcesorium o slug "${accessoryData.slug}" już istnieje:`);
      console.log(`   ID: ${existing.id}`);
      console.log(`   Nazwa: ${existing.name}`);
      console.log('\n💡 Jeśli chcesz zaktualizować istniejący rekord, użyj innego skryptu.');
      return;
    }
    
    // Dodaj akcesorium
    console.log('\n➕ Dodawanie nowego akcesorium...');
    const { data: newAccessory, error: insertError } = await supabase
      .from('accessories')
      .insert(accessoryData)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Błąd podczas dodawania akcesorium:', insertError);
      
      // Sprawdź czy problem jest z unikalnością SKU
      if (insertError.code === '23505') {
        console.error('\n💡 Prawdopodobnie akcesorium o tym samym SKU już istnieje.');
        console.error('   Zmień wartość SKU w skrypcie i spróbuj ponownie.');
      }
      
      return;
    }
    
    console.log('✅ Akcesorium zostało pomyślnie dodane!');
    console.log('\n📊 Szczegóły dodanego akcesorium:');
    console.log(`   ID: ${newAccessory.id}`);
    console.log(`   Nazwa: ${newAccessory.name}`);
    console.log(`   Slug: ${newAccessory.slug}`);
    console.log(`   SKU: ${newAccessory.sku}`);
    console.log(`   Cena: ${newAccessory.price} PLN`);
    console.log(`   Kategoria ID: ${newAccessory.category_id}`);
    console.log(`   Status: ${newAccessory.is_active ? 'Aktywne' : 'Nieaktywne'}`);
    console.log(`   Na stanie: ${newAccessory.in_stock ? 'Tak' : 'Nie'}`);
    
  } catch (error) {
    console.error('❌ Nieoczekiwany błąd:', error.message);
    console.error(error);
  }
}

// Uruchom skrypt
addPodpietkaEvapremium()
  .then(() => {
    console.log('\n✅ Skrypt zakończony.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Błąd krytyczny:', error);
    process.exit(1);
  });

