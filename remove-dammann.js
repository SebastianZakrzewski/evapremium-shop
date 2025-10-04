const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kmepxyervpeujwvgdqtm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZXB4eWVydnBldWp3dmdkcXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzUwOTQyNSwiZXhwIjoyMDczMDg1NDI1fQ.sr3YFtozFZCJpTKTfjX7180oI_fjT0rxG0sx2i0YKlI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeDammann() {
  try {
    console.log('🚗 Usuwam Dammann z bazy danych...');
    
    // Najpierw sprawdź ile rekordów Dammann istnieje
    const { data: countData, error: countError } = await supabase
      .from('car_models_extended')
      .select('*', { count: 'exact', head: true })
      .eq('brand_name', 'Dammann');
      
    if (countError) {
      console.error('❌ Błąd podczas sprawdzania rekordów Dammann:', countError);
      return;
    }
    
    console.log(`📊 Znaleziono ${countData?.length || 0} rekordów Dammann`);
    
    // Sprawdź czy istnieją różne warianty nazwy Dammann
    const { data: dammannVariants, error: variantsError } = await supabase
      .from('car_models_extended')
      .select('brand_name')
      .ilike('brand_name', '%dammann%');
      
    if (variantsError) {
      console.error('❌ Błąd podczas sprawdzania wariantów Dammann:', variantsError);
    } else if (dammannVariants && dammannVariants.length > 0) {
      console.log('🔍 Znalezione warianty nazwy Dammann:');
      const uniqueVariants = [...new Set(dammannVariants.map(v => v.brand_name))];
      uniqueVariants.forEach(variant => {
        console.log(`   - ${variant}`);
      });
    }
    
    // Usuń wszystkie rekordy Dammann (różne warianty nazwy)
    const { data: deletedData, error: deleteError } = await supabase
      .from('car_models_extended')
      .delete()
      .ilike('brand_name', '%dammann%')
      .select();
      
    if (deleteError) {
      console.error('❌ Błąd podczas usuwania rekordów Dammann:', deleteError);
      return;
    }
    
    console.log(`✅ Usunięto ${deletedData?.length || 0} rekordów Dammann`);
    
    // Sprawdź czy usunięcie się powiodło
    const { data: remainingData, error: remainingError } = await supabase
      .from('car_models_extended')
      .select('brand_name')
      .ilike('brand_name', '%dammann%');
      
    if (remainingError) {
      console.error('❌ Błąd podczas sprawdzania pozostałych rekordów:', remainingError);
      return;
    }
    
    if (remainingData && remainingData.length === 0) {
      console.log('✅ Dammann został całkowicie usunięty z bazy danych');
    } else {
      console.log(`⚠️  Pozostało ${remainingData?.length || 0} rekordów Dammann`);
    }
    
  } catch (error) {
    console.error('❌ Błąd:', error);
  }
}

removeDammann();
