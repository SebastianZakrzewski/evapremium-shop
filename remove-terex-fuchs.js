const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kmepxyervpeujwvgdqtm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZXB4eWVydnBldWp3dmdkcXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzUwOTQyNSwiZXhwIjoyMDczMDg1NDI1fQ.sr3YFtozFZCJpTKTfjX7180oI_fjT0rxG0sx2i0YKlI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeTerexFuchs() {
  try {
    console.log('🚗 Usuwam Terex-fuchs z bazy danych...');
    
    // Najpierw sprawdź ile rekordów Terex-fuchs istnieje
    const { data: countData, error: countError } = await supabase
      .from('car_models_extended')
      .select('*', { count: 'exact', head: true })
      .eq('brand_name', 'Terex-fuchs');
      
    if (countError) {
      console.error('❌ Błąd podczas sprawdzania rekordów Terex-fuchs:', countError);
      return;
    }
    
    console.log(`📊 Znaleziono ${countData?.length || 0} rekordów Terex-fuchs`);
    
    // Sprawdź czy istnieją różne warianty nazwy Terex-fuchs
    const { data: terexFuchsVariants, error: variantsError } = await supabase
      .from('car_models_extended')
      .select('brand_name')
      .ilike('brand_name', '%terex%')
      .or('brand_name.ilike.%fuchs%');
      
    if (variantsError) {
      console.error('❌ Błąd podczas sprawdzania wariantów Terex-fuchs:', variantsError);
    } else if (terexFuchsVariants && terexFuchsVariants.length > 0) {
      console.log('🔍 Znalezione warianty nazwy Terex-fuchs:');
      const uniqueVariants = [...new Set(terexFuchsVariants.map(v => v.brand_name))];
      uniqueVariants.forEach(variant => {
        console.log(`   - ${variant}`);
      });
    }
    
    // Usuń wszystkie rekordy Terex-fuchs (różne warianty nazwy)
    const { data: deletedData, error: deleteError } = await supabase
      .from('car_models_extended')
      .delete()
      .or('brand_name.eq.Terex-fuchs,brand_name.ilike.%terex-fuchs%')
      .select();
      
    if (deleteError) {
      console.error('❌ Błąd podczas usuwania rekordów Terex-fuchs:', deleteError);
      return;
    }
    
    console.log(`✅ Usunięto ${deletedData?.length || 0} rekordów Terex-fuchs`);
    
    // Sprawdź czy usunięcie się powiodło
    const { data: remainingData, error: remainingError } = await supabase
      .from('car_models_extended')
      .select('brand_name')
      .or('brand_name.eq.Terex-fuchs,brand_name.ilike.%terex-fuchs%');
      
    if (remainingError) {
      console.error('❌ Błąd podczas sprawdzania pozostałych rekordów:', remainingError);
      return;
    }
    
    if (remainingData && remainingData.length === 0) {
      console.log('✅ Terex-fuchs został całkowicie usunięty z bazy danych');
    } else {
      console.log(`⚠️  Pozostało ${remainingData?.length || 0} rekordów Terex-fuchs`);
    }
    
  } catch (error) {
    console.error('❌ Błąd:', error);
  }
}

removeTerexFuchs();
