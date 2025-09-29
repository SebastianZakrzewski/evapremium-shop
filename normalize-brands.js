const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kmepxyervpeujwvgdqtm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZXB4eWVydnBldWp3dmdkcXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzUwOTQyNSwiZXhwIjoyMDczMDg1NDI1fQ.sr3YFtozFZCJpTKTfjX7180oI_fjT0rxG0sx2i0YKlI';
const supabase = createClient(supabaseUrl, supabaseKey);

// Funkcja do normalizacji nazw marek
function normalizeBrandName(brandName) {
  // Specjalne przypadki dla marek z wieloma słowami
  const specialCases = {
    'ALFA ROMEO': 'Alfa Romeo',
    'ASTON MARTIN': 'Aston Martin',
    'LAND ROVER': 'Land Rover',
    'ROLLS-ROYCE': 'Rolls-Royce',
    'MERCEDES-BENZ': 'Mercedes-Benz',
    'BMW': 'BMW', // BMW pozostaje w całości wielkimi literami
    'AUDI': 'Audi',
    'FORD': 'Ford',
    'CHEVROLET': 'Chevrolet',
    'KIA': 'Kia',
    'GMC': 'GMC', // GMC pozostaje w całości wielkimi literami
    'GMS': 'GMS', // GMS pozostaje w całości wielkimi literami
    'CAT': 'CAT', // CAT pozostaje w całości wielkimi literami
    'JCB': 'JCB', // JCB pozostaje w całości wielkimi literami
    'MAN': 'MAN', // MAN pozostaje w całości wielkimi literami
    'DS': 'DS', // DS pozostaje w całości wielkimi literami
    'BYD': 'BYD', // BYD pozostaje w całości wielkimi literami
    'GAZ': 'GAZ', // GAZ pozostaje w całości wielkimi literami
    'DACIA/RENAULT': 'Dacia/Renault'
  };
  
  // Sprawdź specjalne przypadki
  const upperBrand = brandName.toUpperCase();
  if (specialCases[upperBrand]) {
    return specialCases[upperBrand];
  }
  
  // Dla pozostałych marek: pierwsza litera duża, reszta mała
  return brandName.charAt(0).toUpperCase() + brandName.slice(1).toLowerCase();
}

async function normalizeBrands() {
  console.log('🚀 Normalizuję nazwy marek w bazie danych...');
  
  try {
    // Pobierz wszystkie unikalne nazwy marek
    const { data: brands, error: fetchError } = await supabase
      .from('car_models_extended')
      .select('brand_name')
      .order('brand_name');
      
    if (fetchError) {
      console.error('❌ Błąd podczas pobierania marek:', fetchError);
      return;
    }
    
    const uniqueBrands = [...new Set(brands.map(b => b.brand_name))];
    console.log(`📊 Znaleziono ${uniqueBrands.length} unikalnych marek`);
    
    // Znajdź marki do normalizacji
    const brandsToNormalize = [];
    const normalizedMap = new Map();
    
    uniqueBrands.forEach(brand => {
      const normalized = normalizeBrandName(brand);
      if (brand !== normalized) {
        brandsToNormalize.push({ original: brand, normalized: normalized });
        normalizedMap.set(brand, normalized);
        console.log(`🔄 ${brand} → ${normalized}`);
      }
    });
    
    console.log(`\n📝 Znaleziono ${brandsToNormalize.length} marek do normalizacji`);
    
    if (brandsToNormalize.length === 0) {
      console.log('✅ Wszystkie marki są już znormalizowane!');
      return;
    }
    
    // Zaktualizuj każdą markę
    for (const { original, normalized } of brandsToNormalize) {
      console.log(`\n🔄 Aktualizuję ${original} → ${normalized}...`);
      
      const { data, error } = await supabase
        .from('car_models_extended')
        .update({ brand_name: normalized })
        .eq('brand_name', original);
        
      if (error) {
        console.error(`❌ Błąd podczas aktualizacji ${original}:`, error);
        continue;
      }
      
      console.log(`✅ Zaktualizowano ${original} → ${normalized}`);
    }
    
    // Sprawdź wyniki
    console.log('\n🔍 Sprawdzanie wyników...');
    const { data: finalBrands, error: finalError } = await supabase
      .from('car_models_extended')
      .select('brand_name')
      .order('brand_name');
      
    if (finalError) {
      console.error('❌ Błąd podczas sprawdzania wyników:', finalError);
      return;
    }
    
    const finalUniqueBrands = [...new Set(finalBrands.map(b => b.brand_name))];
    console.log(`📊 Po normalizacji: ${finalUniqueBrands.length} unikalnych marek`);
    
    // Sprawdź czy duplikaty zostały usunięte
    const fordVariants = finalUniqueBrands.filter(b => 
      b.toLowerCase().includes('ford')
    );
    console.log('🔍 Warianty Ford:', fordVariants);
    
    const audiVariants = finalUniqueBrands.filter(b => 
      b.toLowerCase().includes('audi')
    );
    console.log('🔍 Warianty Audi:', audiVariants);
    
    console.log('\n✅ Normalizacja zakończona!');
    
  } catch (error) {
    console.error('❌ Błąd podczas normalizacji:', error);
  }
}

normalizeBrands().catch(console.error);
