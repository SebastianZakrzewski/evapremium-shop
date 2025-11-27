/**
 * Skrypt do aktualizacji organizera z wieloma obrazami
 * 
 * Uruchom po dodaniu kolumny images do tabeli accessories
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

async function updateOrganizerImages() {
  try {
    console.log('🔄 Łączenie z bazą danych Supabase...');
    
    const slug = 'organizer-do-bagaznika-klasyczny-xl';
    
    // Lista obrazów
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
    
    console.log(`\n🔍 Wyszukiwanie organizera o slug: ${slug}...`);
    const { data: accessory, error: findError } = await supabase
      .from('accessories')
      .select('id, name, slug')
      .eq('slug', slug)
      .single();
    
    if (findError || !accessory) {
      console.error('❌ Nie znaleziono organizera o slug:', slug);
      return;
    }
    
    console.log(`✅ Znaleziono: ${accessory.name}`);
    console.log(`\n➕ Aktualizowanie z ${images.length} obrazami...`);
    
    const { data: updated, error: updateError } = await supabase
      .from('accessories')
      .update({ images: images })
      .eq('id', accessory.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Błąd podczas aktualizacji:', updateError);
      
      if (updateError.message && updateError.message.includes('images')) {
        console.error('\n💡 Kolumna "images" nie istnieje w tabeli.');
        console.error('   Najpierw wykonaj w Supabase Dashboard:');
        console.error('   ALTER TABLE accessories ADD COLUMN IF NOT EXISTS images TEXT[];');
      }
      
      return;
    }
    
    console.log('✅ Obrazy zostały pomyślnie zaktualizowane!');
    console.log(`\n📊 Zaktualizowany rekord:`);
    console.log(`   ID: ${updated.id}`);
    console.log(`   Nazwa: ${updated.name}`);
    console.log(`   Liczba obrazów: ${updated.images?.length || 0}`);
    if (updated.images && updated.images.length > 0) {
      console.log(`   Obrazy:`);
      updated.images.forEach((img, idx) => {
        console.log(`     ${idx + 1}. ${img}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Nieoczekiwany błąd:', error.message);
    console.error(error);
  }
}

updateOrganizerImages()
  .then(() => {
    console.log('\n✅ Skrypt zakończony.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Błąd krytyczny:', error);
    process.exit(1);
  });

