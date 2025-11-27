/**
 * Skrypt do dodania nowego akcesorium: Organizer do bagażnika Klasyczny XL
 * 
 * Ten skrypt dodaje nowy rekord z wieloma obrazami.
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

async function addOrganizerKlasycznyXL() {
  try {
    console.log('🔄 Łączenie z bazą danych Supabase...');
    console.log(`   URL: ${supabaseUrl}`);
    
    // Sprawdź czy kategoria "Organizery do Bagażnika" istnieje
    console.log('\n📋 Sprawdzanie kategorii "Organizery do Bagażnika"...');
    const { data: category, error: categoryError } = await supabase
      .from('accessory_categories')
      .select('id, name')
      .ilike('name', '%Organizery%')
      .single();
    
    if (categoryError || !category) {
      console.error('❌ Błąd: Kategoria "Organizery do Bagażnika" nie istnieje w bazie danych');
      console.error('   Najpierw utwórz kategorię w tabeli accessory_categories');
      return;
    }
    
    console.log(`✅ Znaleziono kategorię: ${category.name} (id: ${category.id})`);
    
    // Lista obrazów dla organizera (10 obrazów zgodnie z załączonymi zdjęciami)
    const images = [
      '/images/accessories/organizer-klasyczny-xl-1.webp',
      '/images/accessories/organizer-klasyczny-xl-2.webp',
      '/images/accessories/organizer-klasyczny-xl-3.webp',
      '/images/accessories/organizer-klasyczny-xl-4.webp',
      '/images/accessories/organizer-klasyczny-xl-5.webp',
      '/images/accessories/organizer-klasyczny-xl-6.webp',
      '/images/accessories/organizer-klasyczny-xl-7.webp',
      '/images/accessories/organizer-klasyczny-xl-8.webp',
      '/images/accessories/organizer-klasyczny-xl-9.webp',
      '/images/accessories/organizer-klasyczny-xl-10.webp'
    ];
    
    // Przygotuj dane akcesorium
    const accessoryData = {
      name: 'Organizer do bagażnika Klasyczny XL',
      slug: 'organizer-do-bagaznika-klasyczny-xl',
      description: 'Pojemny organizer do bagażnika w rozmiarze XL z wzorem heksagonalnym. Idealny do organizacji bagażu w samochodzie. Wykonany z trwałego materiału z czerwonymi akcentami.',
      price: 150.00,
      sku: 'ORG-KLAS-XL',
      image_src: images[0], // Pierwszy obraz jako główny
      // images: images, // Dodamy później po utworzeniu kolumny
      features: [
        'Rozmiar XL',
        'Wzór heksagonalny',
        'Czerwone akcenty',
        'Trwały materiał',
        'Łatwy w czyszczeniu',
        'Wymiary: 48x33x22 cm'
      ],
      in_stock: true,
      stock_quantity: null,
      is_active: true,
      rating: 4.8,
      review_count: 0,
      weight: 800, // gramy
      dimensions: {
        length: 48,
        width: 33,
        height: 22
      },
      category_id: category.id
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
    console.log(`   Liczba obrazów: ${images.length}`);
    
    const { data: newAccessory, error: insertError } = await supabase
      .from('accessories')
      .insert(accessoryData)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Błąd podczas dodawania akcesorium:', insertError);
      
      // Jeśli błąd dotyczy kolumny images, może nie istnieć - dodaj ją najpierw
      if (insertError.message && insertError.message.includes('images')) {
        console.error('\n💡 Kolumna "images" może nie istnieć w tabeli.');
        console.error('   Najpierw wykonaj migrację SQL: add-images-column-to-accessories.sql');
        console.error('   Lub wykonaj w Supabase Dashboard:');
        console.error('   ALTER TABLE accessories ADD COLUMN IF NOT EXISTS images TEXT[];');
      }
      
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
    console.log(`   Główny obraz: ${newAccessory.image_src}`);
    console.log(`   Liczba obrazów: ${newAccessory.images?.length || 0}`);
    if (newAccessory.images && newAccessory.images.length > 0) {
      console.log(`   Obrazy:`);
      newAccessory.images.forEach((img, idx) => {
        console.log(`     ${idx + 1}. ${img}`);
      });
    }
    console.log(`   Status: ${newAccessory.is_active ? 'Aktywne' : 'Nieaktywne'}`);
    console.log(`   Na stanie: ${newAccessory.in_stock ? 'Tak' : 'Nie'}`);
    
    console.log('\n💡 Uwaga: Upewnij się, że pliki obrazów istnieją w folderze public/images/accessories/');
    console.log('   Oczekiwane ścieżki:');
    images.forEach((img, idx) => {
      console.log(`   ${idx + 1}. public${img}`);
    });
    
  } catch (error) {
    console.error('❌ Nieoczekiwany błąd:', error.message);
    console.error(error);
  }
}

addOrganizerKlasycznyXL()
  .then(() => {
    console.log('\n✅ Skrypt zakończony.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Błąd krytyczny:', error);
    process.exit(1);
  });

