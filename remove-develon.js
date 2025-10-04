const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kmepxyervpeujwvgdqtm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZXB4eWVydnBldWp3dmdkcXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzUwOTQyNSwiZXhwIjoyMDczMDg1NDI1fQ.sr3YFtozFZCJpTKTfjX7180oI_fjT0rxG0sx2i0YKlI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeDevelon() {
  try {
    console.log('🚗 Usuwam Develon z bazy danych...');
    
    // Najpierw sprawdź ile rekordów Develon istnieje
    const { data: countData, error: countError } = await supabase
      .from('car_models_extended')
      .select('*', { count: 'exact', head: true })
      .eq('brand_name', 'Develon');
      
    if (countError) {
      console.error('❌ Błąd podczas sprawdzania rekordów Develon:', countError);
      return;
    }
    
    console.log(`📊 Znaleziono ${countData?.length || 0} rekordów Develon`);
    
    // Sprawdź czy istnieją różne warianty nazwy Develon
    const { data: develonVariants, error: variantsError } = await supabase
      .from('car_models_extended')
      .select('brand_name')
      .ilike('brand_name', '%develon%');
      
    if (variantsError) {
      console.error('❌ Błąd podczas sprawdzania wariantów Develon:', variantsError);
    } else if (develonVariants && develonVariants.length > 0) {
      console.log('🔍 Znalezione warianty nazwy Develon:');
      const uniqueVariants = [...new Set(develonVariants.map(v => v.brand_name))];
      uniqueVariants.forEach(variant => {
        console.log(`   - ${variant}`);
      });
    }
    
    // Usuń wszystkie rekordy Develon (różne warianty nazwy)
    const { data: deletedData, error: deleteError } = await supabase
      .from('car_models_extended')
      .delete()
      .ilike('brand_name', '%develon%')
      .select();
      
    if (deleteError) {
      console.error('❌ Błąd podczas usuwania rekordów Develon:', deleteError);
      return;
    }
    
    console.log(`✅ Usunięto ${deletedData?.length || 0} rekordów Develon`);
    
    // Sprawdź czy usunięcie się powiodło
    const { data: remainingData, error: remainingError } = await supabase
      .from('car_models_extended')
      .select('brand_name')
      .ilike('brand_name', '%develon%');
      
    if (remainingError) {
      console.error('❌ Błąd podczas sprawdzania pozostałych rekordów:', remainingError);
      return;
    }
    
    if (remainingData && remainingData.length === 0) {
      console.log('✅ Develon został całkowicie usunięty z bazy danych');
    } else {
      console.log(`⚠️  Pozostało ${remainingData?.length || 0} rekordów Develon`);
    }
    
  } catch (error) {
    console.error('❌ Błąd:', error);
  }
}

removeDevelon();
