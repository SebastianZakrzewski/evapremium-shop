/**
 * Skrypt do dodania nowego akcesorium: podpietka metalowa
 * 
 * Ten skrypt dodaje nowy rekord do tabeli accessories w bazie Supabase.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Brak zmiennych środowiskowych SUPABASE_URL lub SUPABASE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addPodpietkaMetalowa() {
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
      return;
    }
    
    console.log(`✅ Znaleziono kategorię: ${category.name} (id: ${category.id})`);
    
    // Przygotuj dane akcesorium
    const accessoryData = {
      name: 'Podpietka metalowa',
      slug: 'podpietka-metalowa',
      description: 'Elegancka podpietka metalowa z wypustkami antypoślizgowymi, idealna do samochodu',
      price: 60.00,
      sku: 'POD-METAL',
      image_src: '/images/accessories/podpietka-metalowa.webp',
      features: ['Materiał metalowy', 'Wypustki antypoślizgowe', 'Elegancka', 'Trwała'],
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
    console.log(`   Obraz: ${newAccessory.image_src}`);
    console.log(`   Status: ${newAccessory.is_active ? 'Aktywne' : 'Nieaktywne'}`);
    console.log(`   Na stanie: ${newAccessory.in_stock ? 'Tak' : 'Nie'}`);
    
    console.log('\n💡 Uwaga: Upewnij się, że plik obrazu istnieje w folderze public/images/accessories/');
    console.log(`   Oczekiwana ścieżka: public${accessoryData.image_src}`);
    
  } catch (error) {
    console.error('❌ Nieoczekiwany błąd:', error.message);
    console.error(error);
  }
}

addPodpietkaMetalowa()
  .then(() => {
    console.log('\n✅ Skrypt zakończony.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Błąd krytyczny:', error);
    process.exit(1);
  });

