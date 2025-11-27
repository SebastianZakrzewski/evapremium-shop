/**
 * Skrypt do aktualizacji ceny dla podpietki EVAPREMIUM plastry miodu
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

async function updatePodpietkaPrice() {
  try {
    console.log('🔄 Łączenie z bazą danych Supabase...');
    
    const slug = 'podpietka-evapremium-plastry-miodu';
    const newPrice = 30.00;
    
    console.log(`\n🔍 Wyszukiwanie akcesorium o slug: ${slug}...`);
    const { data: accessory, error: findError } = await supabase
      .from('accessories')
      .select('id, name, slug, price')
      .eq('slug', slug)
      .single();
    
    if (findError || !accessory) {
      console.error('❌ Nie znaleziono akcesorium o slug:', slug);
      console.error('   Błąd:', findError?.message || 'Akcesorium nie istnieje');
      return;
    }
    
    console.log(`✅ Znaleziono akcesorium: ${accessory.name}`);
    console.log(`   Obecna cena: ${accessory.price} PLN`);
    
    // Aktualizuj cenę
    console.log(`\n💰 Aktualizowanie ceny na ${newPrice} PLN...`);
    const { data: updatedAccessory, error: updateError } = await supabase
      .from('accessories')
      .update({ price: newPrice })
      .eq('id', accessory.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Błąd podczas aktualizacji:', updateError);
      return;
    }
    
    console.log('✅ Cena została pomyślnie zaktualizowana!');
    console.log('\n📊 Szczegóły zaktualizowanego akcesorium:');
    console.log(`   ID: ${updatedAccessory.id}`);
    console.log(`   Nazwa: ${updatedAccessory.name}`);
    console.log(`   Slug: ${updatedAccessory.slug}`);
    console.log(`   Cena: ${updatedAccessory.price} PLN`);
    
  } catch (error) {
    console.error('❌ Nieoczekiwany błąd:', error.message);
    console.error(error);
  }
}

updatePodpietkaPrice()
  .then(() => {
    console.log('\n✅ Skrypt zakończony.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Błąd krytyczny:', error);
    process.exit(1);
  });

