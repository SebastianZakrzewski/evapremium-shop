const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Przykładowe dane dla marki Audi
const audiMatsData = [
  // Audi A4 - B9 (2015-2023)
  {
    car_brand_slug: 'audi',
    car_model_slug: 'a4',
    generation: 'B9',
    body_type: 'sedan',
    year_from: 2015,
    year_to: 2023,
    base_price: 299.99,
    available_set_types: ['front', 'basic', 'premium', 'complete'],
    available_cell_types: ['diamonds', 'honey'],
    available_colors: ['black', 'beige', 'gray', 'brown'],
    available_edge_colors: ['black', 'red', 'blue'],
    has_heel_pad: true,
    is_active: true,
  },
  {
    car_brand_slug: 'audi',
    car_model_slug: 'a4',
    generation: 'B9',
    body_type: 'wagon',
    year_from: 2015,
    year_to: 2023,
    base_price: 329.99,
    available_set_types: ['front', 'basic', 'premium', 'complete'],
    available_cell_types: ['diamonds', 'honey'],
    available_colors: ['black', 'beige', 'gray'],
    available_edge_colors: ['black', 'red'],
    has_heel_pad: true,
    is_active: true,
  },
  // Audi A4 - B8 (2007-2015)
  {
    car_brand_slug: 'audi',
    car_model_slug: 'a4',
    generation: 'B8',
    body_type: 'sedan',
    year_from: 2007,
    year_to: 2015,
    base_price: 279.99,
    available_set_types: ['front', 'basic', 'premium', 'complete'],
    available_cell_types: ['diamonds', 'honey'],
    available_colors: ['black', 'beige', 'gray'],
    available_edge_colors: ['black', 'red'],
    has_heel_pad: false,
    is_active: true,
  },
  // Audi A6 - C8 (2018-2024)
  {
    car_brand_slug: 'audi',
    car_model_slug: 'a6',
    generation: 'C8',
    body_type: 'sedan',
    year_from: 2018,
    year_to: 2024,
    base_price: 349.99,
    available_set_types: ['front', 'basic', 'premium', 'complete'],
    available_cell_types: ['diamonds', 'honey'],
    available_colors: ['black', 'beige', 'gray', 'brown'],
    available_edge_colors: ['black', 'red', 'blue', 'silver'],
    has_heel_pad: true,
    is_active: true,
  },
  {
    car_brand_slug: 'audi',
    car_model_slug: 'a6',
    generation: 'C8',
    body_type: 'wagon',
    year_from: 2018,
    year_to: 2024,
    base_price: 369.99,
    available_set_types: ['front', 'basic', 'premium', 'complete'],
    available_cell_types: ['diamonds', 'honey'],
    available_colors: ['black', 'beige', 'gray'],
    available_edge_colors: ['black', 'red'],
    has_heel_pad: true,
    is_active: true,
  },
  // Audi Q5 - FY (2017-2023)
  {
    car_brand_slug: 'audi',
    car_model_slug: 'q5',
    generation: 'FY',
    body_type: 'suv',
    year_from: 2017,
    year_to: 2023,
    base_price: 379.99,
    available_set_types: ['front', 'basic', 'premium', 'complete'],
    available_cell_types: ['diamonds', 'honey'],
    available_colors: ['black', 'beige', 'gray', 'brown'],
    available_edge_colors: ['black', 'red', 'blue'],
    has_heel_pad: true,
    is_active: true,
  },
  // Audi A3 - 8Y (2020-2024)
  {
    car_brand_slug: 'audi',
    car_model_slug: 'a3',
    generation: '8Y',
    body_type: 'hatchback',
    year_from: 2020,
    year_to: 2024,
    base_price: 249.99,
    available_set_types: ['front', 'basic', 'premium', 'complete'],
    available_cell_types: ['diamonds', 'honey'],
    available_colors: ['black', 'beige', 'gray'],
    available_edge_colors: ['black', 'red'],
    has_heel_pad: false,
    is_active: true,
  },
  {
    car_brand_slug: 'audi',
    car_model_slug: 'a3',
    generation: '8Y',
    body_type: 'sedan',
    year_from: 2020,
    year_to: 2024,
    base_price: 259.99,
    available_set_types: ['front', 'basic', 'premium', 'complete'],
    available_cell_types: ['diamonds', 'honey'],
    available_colors: ['black', 'beige', 'gray'],
    available_edge_colors: ['black', 'red'],
    has_heel_pad: false,
    is_active: true,
  },
  // Audi Q7 - 4M (2015-2023)
  {
    car_brand_slug: 'audi',
    car_model_slug: 'q7',
    generation: '4M',
    body_type: 'suv',
    year_from: 2015,
    year_to: 2023,
    base_price: 429.99,
    available_set_types: ['front', 'basic', 'premium', 'complete'],
    available_cell_types: ['diamonds', 'honey'],
    available_colors: ['black', 'beige', 'gray', 'brown'],
    available_edge_colors: ['black', 'red', 'blue'],
    has_heel_pad: true,
    is_active: true,
  },
  // Audi A5 - F5 (2016-2023)
  {
    car_brand_slug: 'audi',
    car_model_slug: 'a5',
    generation: 'F5',
    body_type: 'coupe',
    year_from: 2016,
    year_to: 2023,
    base_price: 319.99,
    available_set_types: ['front', 'basic', 'premium', 'complete'],
    available_cell_types: ['diamonds', 'honey'],
    available_colors: ['black', 'beige', 'gray'],
    available_edge_colors: ['black', 'red'],
    has_heel_pad: true,
    is_active: true,
  },
  {
    car_brand_slug: 'audi',
    car_model_slug: 'a5',
    generation: 'F5',
    body_type: 'sportback',
    year_from: 2016,
    year_to: 2023,
    base_price: 329.99,
    available_set_types: ['front', 'basic', 'premium', 'complete'],
    available_cell_types: ['diamonds', 'honey'],
    available_colors: ['black', 'beige', 'gray'],
    available_edge_colors: ['black', 'red'],
    has_heel_pad: true,
    is_active: true,
  },
];

async function clearExistingAudiMats() {
  console.log('🧹 Czyszczę istniejące dywaniki dla marki Audi...');
  
  try {
    const { error } = await supabase
      .from('mats')
      .delete()
      .eq('car_brand_slug', 'audi');
    
    if (error) throw error;
    console.log('✅ Dane wyczyszczone');
  } catch (error) {
    console.error('❌ Błąd przy czyszczeniu:', error.message);
    throw error;
  }
}

async function insertAudiMats() {
  console.log(`🌱 Wstawiam ${audiMatsData.length} rekordów dla marki Audi...`);
  
  try {
    const { data, error } = await supabase
      .from('mats')
      .insert(audiMatsData)
      .select();
    
    if (error) throw error;
    
    console.log(`✅ Wstawiono ${data.length} rekordów`);
    return data;
  } catch (error) {
    console.error('❌ Błąd przy wstawianiu:', error.message);
    throw error;
  }
}

async function verifyData() {
  console.log('🔍 Weryfikuję dane...');
  
  try {
    const { data, error, count } = await supabase
      .from('mats')
      .select('*', { count: 'exact' })
      .eq('car_brand_slug', 'audi');
    
    if (error) throw error;
    
    console.log(`📊 Łączna liczba rekordów dla marki Audi: ${count}`);
    
    if (data && data.length > 0) {
      console.log('\n📝 Przykładowe rekordy:');
      data.slice(0, 5).forEach((record, index) => {
        console.log(`  ${index + 1}. ${record.car_model_slug} ${record.generation} - ${record.body_type} (${record.year_from}-${record.year_to})`);
        console.log(`     Cena: ${record.base_price} PLN, Typy zestawów: ${record.available_set_types.join(', ')}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Błąd przy weryfikacji:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Rozpoczynam seedowanie dywaników dla marki Audi...');
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Liczba rekordów do wstawienia: ${audiMatsData.length}\n`);
  
  try {
    // Wyczyść istniejące dane dla Audi
    await clearExistingAudiMats();
    
    // Wstaw nowe dane
    await insertAudiMats();
    
    // Weryfikuj dane
    await verifyData();
    
    console.log('\n🎉 Seedowanie zakończone pomyślnie!');
    console.log('\n💡 Możesz teraz przetestować ładowanie produktów na stronie:');
    console.log('   http://localhost:3000/dywaniki/audi');
    
  } catch (error) {
    console.error('\n💥 Seedowanie nieudane:', error.message);
    if (error.details) {
      console.error('Szczegóły:', error.details);
    }
    process.exit(1);
  }
}

main();

