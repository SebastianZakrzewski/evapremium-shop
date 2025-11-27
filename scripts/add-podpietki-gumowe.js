/**
 * Skrypt do dodania podpiętek gumowych w różnych kolorach
 * 
 * Dodaje 10 akcesoriów - podpietki gumowe w różnych kolorach
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

// Lista podpiętek gumowych w różnych kolorach
const podpietkiGumowe = [
  {
    name: 'Podpietka gumowa brązowa',
    slug: 'podpietka-gumowa-brazowa',
    sku: 'POD-GUM-BRAZ',
    color: 'brązowa',
    image: '/images/accessories/podpietka-gumowa-brazowa.webp'
  },
  {
    name: 'Podpietka gumowa ciemnobrązowa',
    slug: 'podpietka-gumowa-ciemnobrazowa',
    sku: 'POD-GUM-CBRAZ',
    color: 'ciemnobrązowa',
    image: '/images/accessories/podpietka-gumowa-ciemnobrazowa.webp'
  },
  {
    name: 'Podpietka gumowa czerwona',
    slug: 'podpietka-gumowa-czerwona',
    sku: 'POD-GUM-CZERW',
    color: 'czerwona',
    image: '/images/accessories/podpietka-gumowa-czerwona.webp'
  },
  {
    name: 'Podpietka gumowa granatowa',
    slug: 'podpietka-gumowa-granatowa',
    sku: 'POD-GUM-GRANAT',
    color: 'granatowa',
    image: '/images/accessories/podpietka-gumowa-granatowa.webp'
  },
  {
    name: 'Podpietka gumowa niebieska',
    slug: 'podpietka-gumowa-niebieska',
    sku: 'POD-GUM-NIEB',
    color: 'niebieska',
    image: '/images/accessories/podpietka-gumowa-niebieska.webp'
  },
  {
    name: 'Podpietka gumowa szara',
    slug: 'podpietka-gumowa-szara',
    sku: 'POD-GUM-SZARA',
    color: 'szara',
    image: '/images/accessories/podpietka-gumowa-szara.webp'
  },
  {
    name: 'Podpietka gumowa bordowa',
    slug: 'podpietka-gumowa-bordowa',
    sku: 'POD-GUM-BORD',
    color: 'bordowa',
    image: '/images/accessories/podpietka-gumowa-bordowa.webp'
  },
  {
    name: 'Podpietka gumowa beżowa',
    slug: 'podpietka-gumowa-bezowa',
    sku: 'POD-GUM-BEZ',
    color: 'beżowa',
    image: '/images/accessories/podpietka-gumowa-bezowa.webp'
  },
  {
    name: 'Podpietka gumowa czarna',
    slug: 'podpietka-gumowa-czarna',
    sku: 'POD-GUM-CZARNA',
    color: 'czarna',
    image: '/images/accessories/podpietka-gumowa-czarna.webp'
  },
  {
    name: 'Podpietka gumowa zielona',
    slug: 'podpietka-gumowa-zielona',
    sku: 'POD-GUM-ZIEL',
    color: 'zielona',
    image: '/images/accessories/podpietka-gumowa-zielona.webp'
  }
];

async function addPodpietkiGumowe() {
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
    console.log(`\n➕ Dodawanie ${podpietkiGumowe.length} podpiętek gumowych...`);
    
    const price = 50.00;
    const added = [];
    const skipped = [];
    const errors = [];
    
    for (const podpietka of podpietkiGumowe) {
      try {
        // Sprawdź czy już istnieje
        const { data: existing } = await supabase
          .from('accessories')
          .select('id, name')
          .eq('slug', podpietka.slug)
          .single();
        
        if (existing) {
          console.log(`⏭️  Pomijam: ${podpietka.name} (już istnieje)`);
          skipped.push(podpietka.name);
          continue;
        }
        
        // Przygotuj dane
        const accessoryData = {
          name: podpietka.name,
          slug: podpietka.slug,
          description: `Podpietka gumowa w kolorze ${podpietka.color} z wzorem rombów`,
          price: price,
          sku: podpietka.sku,
          image_src: podpietka.image,
          features: ['Materiał gumowy', `Kolor: ${podpietka.color}`, 'Wzór rombów', 'Trwałe'],
          in_stock: true,
          stock_quantity: null,
          is_active: true,
          rating: 4.7,
          review_count: 0,
          category_id: 2
        };
        
        // Dodaj akcesorium
        const { data: newAccessory, error: insertError } = await supabase
          .from('accessories')
          .insert(accessoryData)
          .select()
          .single();
        
        if (insertError) {
          console.error(`❌ Błąd przy dodawaniu ${podpietka.name}:`, insertError.message);
          errors.push({ name: podpietka.name, error: insertError.message });
          continue;
        }
        
        console.log(`✅ Dodano: ${podpietka.name} (${podpietka.sku})`);
        added.push(newAccessory);
        
      } catch (error) {
        console.error(`❌ Błąd przy przetwarzaniu ${podpietka.name}:`, error.message);
        errors.push({ name: podpietka.name, error: error.message });
      }
    }
    
    // Podsumowanie
    console.log('\n' + '='.repeat(60));
    console.log('📊 PODSUMOWANIE:');
    console.log('='.repeat(60));
    console.log(`✅ Dodano: ${added.length} akcesoriów`);
    console.log(`⏭️  Pominięto (już istnieją): ${skipped.length}`);
    console.log(`❌ Błędy: ${errors.length}`);
    
    if (added.length > 0) {
      console.log('\n📋 Dodane akcesoria:');
      added.forEach(acc => {
        console.log(`   • ${acc.name} - ${acc.price} PLN (${acc.sku})`);
      });
    }
    
    if (skipped.length > 0) {
      console.log('\n⏭️  Pominięte (już istnieją):');
      skipped.forEach(name => console.log(`   • ${name}`));
    }
    
    if (errors.length > 0) {
      console.log('\n❌ Błędy:');
      errors.forEach(({ name, error }) => {
        console.log(`   • ${name}: ${error}`);
      });
    }
    
    console.log('\n💡 Uwaga: Upewnij się, że pliki obrazów istnieją w folderze public/images/accessories/');
    console.log('   Oczekiwane ścieżki:');
    podpietkiGumowe.forEach(p => {
      console.log(`   - public${p.image}`);
    });
    
  } catch (error) {
    console.error('❌ Nieoczekiwany błąd:', error.message);
    console.error(error);
  }
}

addPodpietkiGumowe()
  .then(() => {
    console.log('\n✅ Skrypt zakończony.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Błąd krytyczny:', error);
    process.exit(1);
  });

