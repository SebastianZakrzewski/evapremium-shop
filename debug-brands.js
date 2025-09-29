const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kmepxyervpeujwvgdqtm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZXB4eWVydnBldWp3dmdkcXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzUwOTQyNSwiZXhwIjoyMDczMDg1NDI1fQ.sr3YFtozFZCJpTKTfjX7180oI_fjT0rxG0sx2i0YKlI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugBrands() {
  console.log('🔍 Debugowanie marek...');
  
  const { data: brands, error } = await supabase
    .from('car_models_extended')
    .select('brand_name')
    .order('brand_name');
    
  if (error) {
    console.error('❌ Błąd:', error);
    return;
  }
  
  console.log('📊 Wszystkie brand_name z bazy:');
  console.log('Liczba rekordów:', brands.length);
  
  // Znajdź Omoda
  const omodaRecords = brands.filter(b => b.brand_name === 'Omoda');
  console.log('Rekordy Omoda:', omodaRecords.length);
  
  if (omodaRecords.length > 0) {
    console.log('✅ Omoda JEST w surowych danych!');
    omodaRecords.forEach((record, i) => {
      console.log(`  ${i + 1}. "${record.brand_name}"`);
    });
  } else {
    console.log('❌ Omoda NIE JEST w surowych danych');
  }
  
  // Sprawdź unikalne marki
  console.log('\n🔄 Przetwarzanie unikalnych marek...');
  const uniqueBrands = Array.from(new Set(brands.map(b => b.brand_name)));
  console.log('Liczba unikalnych marek:', uniqueBrands.length);
  
  const omodaInUnique = uniqueBrands.includes('Omoda');
  console.log('Czy Omoda w unikalnych?', omodaInUnique);
  
  if (omodaInUnique) {
    const index = uniqueBrands.indexOf('Omoda');
    console.log('✅ Indeks Omoda w unikalnych:', index);
  } else {
    console.log('❌ Omoda NIE JEST w unikalnych markach!');
    
    // Sprawdź czy są podobne nazwy
    const similarBrands = uniqueBrands.filter(b => 
      b.toLowerCase().includes('omod') || 
      b.toLowerCase().includes('omoda')
    );
    console.log('Podobne marki:', similarBrands);
  }
  
  // Sprawdź pierwsze 10 marek
  console.log('\n📋 Pierwsze 10 unikalnych marek:');
  uniqueBrands.slice(0, 10).forEach((brand, i) => {
    console.log(`  ${i + 1}. "${brand}"`);
  });
}

debugBrands().catch(console.error);
