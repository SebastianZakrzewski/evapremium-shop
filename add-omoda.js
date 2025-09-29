const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kmepxyervpeujwvgdqtm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZXB4eWVydnBldWp3dmdkcXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzUwOTQyNSwiZXhwIjoyMDczMDg1NDI1fQ.sr3YFtozFZCJpTKTfjX7180oI_fjT0rxG0sx2i0YKlI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function addOmoda() {
  console.log('🚀 Dodaję Omoda do Supabase...');
  
  // Dane Omoda z pliku JSON
  const omodaData = [
    {
      brand_name: 'Omoda',
      model_name: '5',
      generation: '2022+',
      body_type: 'SUV 5os.',
      year_from: 2022,
      year_to: null,
      is_currently_produced: true
    },
    {
      brand_name: 'Omoda',
      model_name: '9',
      generation: '2022+',
      body_type: 'SUV 5os.',
      year_from: 2022,
      year_to: null,
      is_currently_produced: true
    }
  ];
  
  console.log('📊 Dane do dodania:');
  omodaData.forEach((record, i) => {
    console.log(`  ${i + 1}. ${record.brand_name} ${record.model_name} (${record.generation})`);
  });
  
  // Dodaj dane do Supabase
  const { data, error } = await supabase
    .from('car_models_extended')
    .insert(omodaData);
    
  if (error) {
    console.error('❌ Błąd podczas dodawania Omoda:', error);
    return;
  }
  
  console.log('✅ Omoda dodana pomyślnie!');
  console.log('Dodane rekordy:', data);
  
  // Sprawdź czy Omoda jest teraz w bazie
  const { data: checkData, error: checkError } = await supabase
    .from('car_models_extended')
    .select('*')
    .eq('brand_name', 'Omoda');
    
  if (checkError) {
    console.error('❌ Błąd podczas sprawdzania:', checkError);
    return;
  }
  
  console.log('\n🔍 Sprawdzenie po dodaniu:');
  console.log('Liczba rekordów Omoda:', checkData.length);
  checkData.forEach((record, i) => {
    console.log(`  ${i + 1}. ${record.brand_name} ${record.model_name} (${record.generation})`);
  });
}

addOmoda().catch(console.error);
