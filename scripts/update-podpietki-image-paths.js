/**
 * Skrypt do aktualizacji ścieżek obrazów podpiętek zgodnie z nową strukturą folderów
 * 
 * Aktualizuje ścieżki w bazie danych Supabase dla wszystkich podpiętek
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

// Mapowanie slug -> nowa ścieżka obrazu
const imagePathUpdates = {
  'podpietka-evapremium-plastry-miodu': {
    image_src: '/images/accessories/podpietki/evapremium/podpietkaEVAPLASTRYMIODU.webp'
  },
  'podpietka-evapremium-w-romby': {
    image_src: '/images/accessories/podpietki/evapremium/podpietkaEVAromby.webp'
  },
  'podpietka-gumowa': {
    image_src: '/images/accessories/podpietki/gumowa/braz.webp', // Domyślny obraz
    color_images: {
      'brązowa': '/images/accessories/podpietki/gumowa/braz.webp',
      'ciemnobrązowa': '/images/accessories/podpietki/gumowa/ciemnybeż.webp',
      'czerwona': '/images/accessories/podpietki/gumowa/czerwona.webp',
      'granatowa': '/images/accessories/podpietki/gumowa/granatowa.webp',
      'niebieska': '/images/accessories/podpietki/gumowa/niebieska.webp',
      'szara': '/images/accessories/podpietki/gumowa/ciemnoszara.webp',
      'bordowa': '/images/accessories/podpietki/gumowa/bordowy.webp',
      'beżowa': '/images/accessories/podpietki/gumowa/koscloniowa.webp',
      'czarna': '/images/accessories/podpietki/gumowa/czarna.webp',
      'zielona': '/images/accessories/podpietki/gumowa/zielona.webp'
    }
  },
  'podpietka-metalowa': {
    image_src: '/images/accessories/podpietki/metalowa/podpietkametalowabeztla.webp'
  },
  'podpietka-plastikowa': {
    image_src: '/images/accessories/podpietki/plastikowa/IMG_5267_1.webp'
  }
};

async function updatePodpietkiImagePaths() {
  try {
    console.log('🔄 Łączenie z bazą danych Supabase...');
    console.log(`   URL: ${supabaseUrl}`);
    
    const updates = [];
    const errors = [];
    
    for (const [slug, updateData] of Object.entries(imagePathUpdates)) {
      try {
        console.log(`\n🔍 Wyszukiwanie akcesorium o slug: ${slug}...`);
        
        const { data: accessory, error: findError } = await supabase
          .from('accessories')
          .select('id, name, slug, image_src')
          .eq('slug', slug)
          .single();
        
        if (findError || !accessory) {
          console.log(`⚠️  Nie znaleziono akcesorium: ${slug}`);
          errors.push({ slug, error: 'Nie znaleziono' });
          continue;
        }
        
        console.log(`✅ Znaleziono: ${accessory.name}`);
        console.log(`   Obecna ścieżka: ${accessory.image_src || '(brak)'}`);
        console.log(`   Nowa ścieżka: ${updateData.image_src}`);
        
        // Przygotuj dane do aktualizacji
        const updatePayload = {
          image_src: updateData.image_src
        };
        
        // Jeśli są color_images, dodaj je również
        if (updateData.color_images) {
          updatePayload.color_images = updateData.color_images;
          console.log(`   Zaktualizowano również color_images (${Object.keys(updateData.color_images).length} kolorów)`);
        }
        
        // Aktualizuj rekord
        const { data: updated, error: updateError } = await supabase
          .from('accessories')
          .update(updatePayload)
          .eq('id', accessory.id)
          .select()
          .single();
        
        if (updateError) {
          console.error(`❌ Błąd podczas aktualizacji ${slug}:`, updateError.message);
          errors.push({ slug, error: updateError.message });
          continue;
        }
        
        console.log(`✅ Zaktualizowano: ${updated.name}`);
        updates.push({
          name: updated.name,
          slug: updated.slug,
          image_src: updated.image_src
        });
        
      } catch (error) {
        console.error(`❌ Błąd przy przetwarzaniu ${slug}:`, error.message);
        errors.push({ slug, error: error.message });
      }
    }
    
    // Podsumowanie
    console.log('\n' + '='.repeat(70));
    console.log('📊 PODSUMOWANIE AKTUALIZACJI ŚCIEŻEK OBRAZÓW:');
    console.log('='.repeat(70));
    console.log(`✅ Zaktualizowano: ${updates.length} rekordów`);
    console.log(`❌ Błędy: ${errors.length}`);
    
    if (updates.length > 0) {
      console.log('\n📋 Zaktualizowane akcesoria:');
      updates.forEach(acc => {
        console.log(`   • ${acc.name}`);
        console.log(`     Slug: ${acc.slug}`);
        console.log(`     Obraz: ${acc.image_src}`);
        console.log('');
      });
    }
    
    if (errors.length > 0) {
      console.log('\n❌ Błędy:');
      errors.forEach(({ slug, error }) => {
        console.log(`   • ${slug}: ${error}`);
      });
    }
    
    console.log('\n💡 Upewnij się, że wszystkie pliki obrazów istnieją w odpowiednich folderach:');
    console.log('   - /images/accessories/podpietki/evapremium/');
    console.log('   - /images/accessories/podpietki/gumowa/');
    console.log('   - /images/accessories/podpietki/metalowa/');
    console.log('   - /images/accessories/podpietki/plastikowa/');
    
  } catch (error) {
    console.error('❌ Nieoczekiwany błąd:', error.message);
    console.error(error);
  }
}

updatePodpietkiImagePaths()
  .then(() => {
    console.log('\n✅ Skrypt zakończony.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Błąd krytyczny:', error);
    process.exit(1);
  });

