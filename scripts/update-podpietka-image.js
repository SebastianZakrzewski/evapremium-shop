/**
 * Skrypt do aktualizacji obrazu dla podpietki EVAPREMIUM plastry miodu
 * 
 * Użycie:
 *   node scripts/update-podpietka-image.js [ścieżka_do_obrazu]
 * 
 * Przykład:
 *   node scripts/update-podpietka-image.js /images/accessories/podpietka-evapremium.webp
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

async function updatePodpietkaImage(imagePath) {
  try {
    console.log('🔄 Łączenie z bazą danych Supabase...');
    
    // Jeśli nie podano ścieżki, użyj domyślnej
    const defaultImagePath = '/images/accessories/podpietka-evapremium-plastry-miodu.webp';
    const finalImagePath = imagePath || defaultImagePath;
    
    console.log(`📸 Aktualizowanie obrazu: ${finalImagePath}`);
    
    // Znajdź akcesorium po slug
    const slug = 'podpietka-evapremium-plastry-miodu';
    
    console.log(`\n🔍 Wyszukiwanie akcesorium o slug: ${slug}...`);
    const { data: accessory, error: findError } = await supabase
      .from('accessories')
      .select('id, name, slug, image_src')
      .eq('slug', slug)
      .single();
    
    if (findError || !accessory) {
      console.error('❌ Nie znaleziono akcesorium o slug:', slug);
      console.error('   Błąd:', findError?.message || 'Akcesorium nie istnieje');
      return;
    }
    
    console.log(`✅ Znaleziono akcesorium: ${accessory.name}`);
    console.log(`   Obecny obraz: ${accessory.image_src || '(brak)'}`);
    
    // Aktualizuj obraz
    console.log(`\n➕ Aktualizowanie obrazu...`);
    const { data: updatedAccessory, error: updateError } = await supabase
      .from('accessories')
      .update({ image_src: finalImagePath })
      .eq('id', accessory.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Błąd podczas aktualizacji:', updateError);
      return;
    }
    
    console.log('✅ Obraz został pomyślnie zaktualizowany!');
    console.log('\n📊 Szczegóły zaktualizowanego akcesorium:');
    console.log(`   ID: ${updatedAccessory.id}`);
    console.log(`   Nazwa: ${updatedAccessory.name}`);
    console.log(`   Slug: ${updatedAccessory.slug}`);
    console.log(`   Obraz: ${updatedAccessory.image_src}`);
    
    console.log('\n💡 Uwaga: Upewnij się, że plik obrazu istnieje w folderze public/images/accessories/');
    console.log(`   Oczekiwana ścieżka: public${finalImagePath}`);
    
  } catch (error) {
    console.error('❌ Nieoczekiwany błąd:', error.message);
    console.error(error);
  }
}

// Pobierz ścieżkę z argumentów wiersza poleceń
const imagePath = process.argv[2];

// Uruchom skrypt
updatePodpietkaImage(imagePath)
  .then(() => {
    console.log('\n✅ Skrypt zakończony.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Błąd krytyczny:', error);
    process.exit(1);
  });

