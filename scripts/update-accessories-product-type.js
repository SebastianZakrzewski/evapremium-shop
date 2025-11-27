/**
 * Skrypt do aktualizacji kolumny product_type w tabeli accessories
 * Przypisuje 'organizer' lub 'podpietka' na podstawie kategorii produktu
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

async function updateProductTypes() {
  try {
    console.log('🔄 Łączenie z bazą danych Supabase...');
    console.log(`   URL: ${supabaseUrl}`);
    
    // Pobierz wszystkie akcesoria z kategoriami
    console.log('\n🔍 Pobieranie wszystkich akcesoriów...');
    const { data: accessories, error: fetchError } = await supabase
      .from('accessories')
      .select(`
        id,
        name,
        slug,
        category_id,
        accessory_categories (
          id,
          name,
          slug
        )
      `);
    
    if (fetchError) {
      console.error('❌ Błąd podczas pobierania akcesoriów:', fetchError);
      return;
    }
    
    if (!accessories || accessories.length === 0) {
      console.log('⚠️  Nie znaleziono żadnych akcesoriów w bazie danych');
      return;
    }
    
    console.log(`✅ Znaleziono ${accessories.length} akcesoriów`);
    
    let updated = 0;
    let errors = 0;
    
    // Zaktualizuj każdy rekord
    for (const accessory of accessories) {
      const category = accessory.accessory_categories;
      const productName = accessory.name.toLowerCase();
      let productType = null;
      
      // PRIORYTET 1: Sprawdź nazwę produktu (najbardziej niezawodne)
      if (productName.includes('podpięt') || productName.includes('podpiet')) {
        productType = 'podpietka';
      } else if (productName.includes('organizer') || productName.includes('bagażnik')) {
        productType = 'organizer';
      }
      // PRIORYTET 2: Jeśli nazwa nie pomogła, sprawdź kategorię
      else if (category) {
        const categoryName = category.name.toLowerCase();
        const categorySlug = category.slug.toLowerCase();
        
        // Sprawdź czy to podpiętka
        if (categoryName.includes('podpięt') || 
            categoryName.includes('podpiet') ||
            categorySlug.includes('podpiet') ||
            categorySlug.includes('podpietka')) {
          productType = 'podpietka';
        }
        // Sprawdź czy to organizer
        else if (categoryName.includes('organizer') || 
                 categoryName.includes('bagażnik') ||
                 categorySlug.includes('organizer') ||
                 categorySlug.includes('bagaznik')) {
          productType = 'organizer';
        }
      }
      
      if (productType) {
        console.log(`\n📝 Aktualizowanie: ${accessory.name}`);
        console.log(`   Typ: ${productType}`);
        console.log(`   Kategoria: ${category?.name || 'brak'}`);
        
        const { error: updateError } = await supabase
          .from('accessories')
          .update({ product_type: productType })
          .eq('id', accessory.id);
        
        if (updateError) {
          console.error(`   ❌ Błąd: ${updateError.message}`);
          errors++;
        } else {
          console.log(`   ✅ Zaktualizowano`);
          updated++;
        }
      } else {
        console.log(`\n⚠️  Nie można określić typu dla: ${accessory.name}`);
        console.log(`   Kategoria: ${category?.name || 'brak'}`);
        errors++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Podsumowanie:');
    console.log(`   ✅ Zaktualizowano: ${updated}`);
    console.log(`   ❌ Błędy/Nieokreślone: ${errors}`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Nieoczekiwany błąd:', error.message);
    console.error(error);
  }
}

updateProductTypes()
  .then(() => {
    console.log('\n✅ Skrypt zakończony.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Błąd krytyczny:', error);
    process.exit(1);
  });

