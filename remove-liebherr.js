const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kmepxyervpeujwvgdqtm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZXB4eWVydnBldWp3dmdkcXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzUwOTQyNSwiZXhwIjoyMDczMDg1NDI1fQ.sr3YFtozFZCJpTKTfjX7180oI_fjT0rxG0sx2i0YKlI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeLiebherr() {
  try {
    console.log('🚗 Usuwam Liebherr z bazy danych...');
    
    // Najpierw sprawdź ile rekordów Liebherr istnieje
    const { data: countData, error: countError } = await supabase
      .from('car_models_extended')
      .select('*', { count: 'exact', head: true })
      .eq('brand_name', 'Liebherr');
      
    if (countError) {
      console.error('❌ Błąd podczas sprawdzania rekordów Liebherr:', countError);
      return;
    }
    
    console.log(`📊 Znaleziono ${countData?.length || 0} rekordów Liebherr`);
    
    // Sprawdź czy istnieją różne warianty nazwy Liebherr
    const { data: liebherrVariants, error: variantsError } = await supabase
      .from('car_models_extended')
      .select('brand_name')
      .ilike('brand_name', '%liebherr%');
      
    if (variantsError) {
      console.error('❌ Błąd podczas sprawdzania wariantów Liebherr:', variantsError);
    } else if (liebherrVariants && liebherrVariants.length > 0) {
      console.log('🔍 Znalezione warianty nazwy Liebherr:');
      const uniqueVariants = [...new Set(liebherrVariants.map(v => v.brand_name))];
      uniqueVariants.forEach(variant => {
        console.log(`   - ${variant}`);
      });
    }
    
    // Usuń wszystkie rekordy Liebherr (różne warianty nazwy)
    const { data: deletedData, error: deleteError } = await supabase
      .from('car_models_extended')
      .delete()
      .ilike('brand_name', '%liebherr%')
      .select();
      
    if (deleteError) {
      console.error('❌ Błąd podczas usuwania rekordów Liebherr:', deleteError);
      return;
    }
    
    console.log(`✅ Usunięto ${deletedData?.length || 0} rekordów Liebherr`);
    
    // Sprawdź czy usunięcie się powiodło
    const { data: remainingData, error: remainingError } = await supabase
      .from('car_models_extended')
      .select('brand_name')
      .ilike('brand_name', '%liebherr%');
      
    if (remainingError) {
      console.error('❌ Błąd podczas sprawdzania pozostałych rekordów:', remainingError);
      return;
    }
    
    if (remainingData && remainingData.length === 0) {
      console.log('✅ Liebherr został całkowicie usunięty z bazy danych');
    } else {
      console.log(`⚠️  Pozostało ${remainingData?.length || 0} rekordów Liebherr`);
    }
    
  } catch (error) {
    console.error('❌ Błąd:', error);
  }
}

removeLiebherr();
