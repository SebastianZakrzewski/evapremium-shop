/**
 * Skrypt do konsolidacji podpiętek gumowych
 * 
 * Usuwa 9 rekordów podpiętek gumowych w różnych kolorach
 * i aktualizuje jeden rekord "Podpietka gumowa" z dostępnymi kolorami
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

async function consolidatePodpietkiGumowe() {
  try {
    console.log('🔄 Łączenie z bazą danych Supabase...');
    
    // Znajdź wszystkie podpietki gumowe
    console.log('\n🔍 Wyszukiwanie podpiętek gumowych...');
    const { data: podpietki, error: findError } = await supabase
      .from('accessories')
      .select('id, name, slug, sku')
      .like('name', '%Podpietka gumowa%');
    
    if (findError) {
      console.error('❌ Błąd podczas wyszukiwania:', findError);
      return;
    }
    
    if (!podpietki || podpietki.length === 0) {
      console.log('⚠️  Nie znaleziono podpiętek gumowych.');
      return;
    }
    
    console.log(`✅ Znaleziono ${podpietki.length} podpiętek gumowych`);
    
    // Znajdź główny rekord "Podpietka gumowa" (bez koloru w nazwie)
    const mainPodpietka = podpietki.find(p => p.name === 'Podpietka gumowa');
    
    if (!mainPodpietka) {
      // Jeśli nie ma głównego rekordu, użyj pierwszego i zmień nazwę
      console.log('\n➕ Tworzenie głównego rekordu podpietki gumowej...');
      const firstPodpietka = podpietki[0];
      
      // Zaktualizuj pierwszy rekord na główny
      const { data: updated, error: updateError } = await supabase
        .from('accessories')
        .update({
          name: 'Podpietka gumowa',
          slug: 'podpietka-gumowa',
          sku: 'POD-GUM',
          description: 'Podpietka gumowa z wzorem rombów. Wybierz kolor w oknie podglądu produktu.',
          available_colors: [
            'brązowa',
            'ciemnobrązowa',
            'czerwona',
            'granatowa',
            'niebieska',
            'szara',
            'bordowa',
            'beżowa',
            'czarna',
            'zielona'
          ],
          color_images: {
            'brązowa': '/images/accessories/podpietka-gumowa-brazowa.webp',
            'ciemnobrązowa': '/images/accessories/podpietka-gumowa-ciemnobrazowa.webp',
            'czerwona': '/images/accessories/podpietka-gumowa-czerwona.webp',
            'granatowa': '/images/accessories/podpietka-gumowa-granatowa.webp',
            'niebieska': '/images/accessories/podpietka-gumowa-niebieska.webp',
            'szara': '/images/accessories/podpietka-gumowa-szara.webp',
            'bordowa': '/images/accessories/podpietka-gumowa-bordowa.webp',
            'beżowa': '/images/accessories/podpietka-gumowa-bezowa.webp',
            'czarna': '/images/accessories/podpietka-gumowa-czarna.webp',
            'zielona': '/images/accessories/podpietka-gumowa-zielona.webp'
          },
          image_src: '/images/accessories/podpietka-gumowa-brazowa.webp' // Domyślny obraz
        })
        .eq('id', firstPodpietka.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('❌ Błąd podczas aktualizacji głównego rekordu:', updateError);
        return;
      }
      
      console.log('✅ Główny rekord został zaktualizowany');
      
      // Usuń pozostałe rekordy
      const otherPodpietki = podpietki.filter(p => p.id !== firstPodpietka.id);
      if (otherPodpietki.length > 0) {
        console.log(`\n🗑️  Usuwanie ${otherPodpietki.length} pozostałych rekordów...`);
        const idsToDelete = otherPodpietki.map(p => p.id);
        
        const { error: deleteError } = await supabase
          .from('accessories')
          .delete()
          .in('id', idsToDelete);
        
        if (deleteError) {
          console.error('❌ Błąd podczas usuwania:', deleteError);
          return;
        }
        
        console.log('✅ Pozostałe rekordy zostały usunięte');
      }
      
      console.log('\n📊 Podsumowanie:');
      console.log(`   ✅ Główny rekord: ${updated.name} (${updated.sku})`);
      console.log(`   ✅ Dostępne kolory: ${updated.available_colors?.length || 0}`);
      console.log(`   🗑️  Usunięto: ${otherPodpietki.length} rekordów`);
      
    } else {
      // Główny rekord już istnieje
      console.log('\n✅ Główny rekord już istnieje:', mainPodpietka.name);
      
      // Zaktualizuj główny rekord z kolorami
      const { data: updated, error: updateError } = await supabase
        .from('accessories')
        .update({
          available_colors: [
            'brązowa',
            'ciemnobrązowa',
            'czerwona',
            'granatowa',
            'niebieska',
            'szara',
            'bordowa',
            'beżowa',
            'czarna',
            'zielona'
          ],
          color_images: {
            'brązowa': '/images/accessories/podpietka-gumowa-brazowa.webp',
            'ciemnobrązowa': '/images/accessories/podpietka-gumowa-ciemnobrazowa.webp',
            'czerwona': '/images/accessories/podpietka-gumowa-czerwona.webp',
            'granatowa': '/images/accessories/podpietka-gumowa-granatowa.webp',
            'niebieska': '/images/accessories/podpietka-gumowa-niebieska.webp',
            'szara': '/images/accessories/podpietka-gumowa-szara.webp',
            'bordowa': '/images/accessories/podpietka-gumowa-bordowa.webp',
            'beżowa': '/images/accessories/podpietka-gumowa-bezowa.webp',
            'czarna': '/images/accessories/podpietka-gumowa-czarna.webp',
            'zielona': '/images/accessories/podpietka-gumowa-zielona.webp'
          },
          image_src: '/images/accessories/podpietka-gumowa-brazowa.webp'
        })
        .eq('id', mainPodpietka.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('❌ Błąd podczas aktualizacji:', updateError);
        return;
      }
      
      // Usuń pozostałe rekordy
      const otherPodpietki = podpietki.filter(p => p.id !== mainPodpietka.id);
      if (otherPodpietki.length > 0) {
        console.log(`\n🗑️  Usuwanie ${otherPodpietki.length} pozostałych rekordów...`);
        const idsToDelete = otherPodpietki.map(p => p.id);
        
        const { error: deleteError } = await supabase
          .from('accessories')
          .delete()
          .in('id', idsToDelete);
        
        if (deleteError) {
          console.error('❌ Błąd podczas usuwania:', deleteError);
          return;
        }
        
        console.log('✅ Pozostałe rekordy zostały usunięte');
      }
      
      console.log('\n📊 Podsumowanie:');
      console.log(`   ✅ Główny rekord: ${updated.name} (${updated.sku})`);
      console.log(`   ✅ Dostępne kolory: ${updated.available_colors?.length || 0}`);
      console.log(`   🗑️  Usunięto: ${otherPodpietki.length} rekordów`);
    }
    
  } catch (error) {
    console.error('❌ Nieoczekiwany błąd:', error.message);
    console.error(error);
  }
}

consolidatePodpietkiGumowe()
  .then(() => {
    console.log('\n✅ Skrypt zakończony.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Błąd krytyczny:', error);
    process.exit(1);
  });

