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
    
    // Lista obrazów z folderu podpietki/organizer-klasyczny-XL
    const images = [
      '/images/accessories/podpietki/organizer-klasyczny-XL/IMG_4814_7910116f-058f-4877-af5f-aff121e45415.webp',
      '/images/accessories/podpietki/organizer-klasyczny-XL/IMG_4815_6d741f20-0a37-4c9e-b0b3-c884c7f7426a.webp',
      '/images/accessories/podpietki/organizer-klasyczny-XL/IMG_4816_5d9ec7b3-13a3-4cb8-b80b-20081274428e.webp',
      '/images/accessories/podpietki/organizer-klasyczny-XL/IMG_4817_763254d3-8b59-4de9-b386-17558a143795.webp',
      '/images/accessories/podpietki/organizer-klasyczny-XL/IMG_4818_02d0205b-7c40-45e5-bcb2-90c7abce276a.webp',
      '/images/accessories/podpietki/organizer-klasyczny-XL/IMG_4819.webp',
      '/images/accessories/podpietki/organizer-klasyczny-XL/IMG_4820_f10f08ba-c791-4801-82da-bcd45c4b22fd.webp',
      '/images/accessories/podpietki/organizer-klasyczny-XL/IMG_4821_529e5450-2986-4fdc-9c16-5beff7bbf609.webp',
      '/images/accessories/podpietki/organizer-klasyczny-XL/IMG_4822_ee22d8f2-be43-4fa2-b125-82b47f63e84e.webp',
      '/images/accessories/podpietki/organizer-klasyczny-XL/IMG_4823_fc120fc8-1355-4366-bbec-e5c3b4a67644.webp'
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

