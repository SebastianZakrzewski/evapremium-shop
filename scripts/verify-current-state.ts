import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function verifyState() {
  console.log('🔍 Sprawdzanie aktualnego stanu tabeli car_models_extended...\n');
  
  // Pobierz przykładowe rekordy z nadmiarowymi informacjami
  const { data, error } = await supabase
    .from('car_models_extended')
    .select('id, brand_name, model_name, generation, body_type, year_from, year_to')
    .order('id')
    .limit(50);
  
  if (error) {
    console.error('Błąd:', error);
    return;
  }
  
  console.log('📋 Przykładowe rekordy z tabeli:\n');
  data?.forEach((row, index) => {
    console.log(`${index + 1}. [ID: ${row.id}] ${row.brand_name} - "${row.model_name}" (${row.generation})`);
  });
  
  // Szukaj rekordów z nadmiarowymi informacjami
  console.log('\n🔍 Szukanie rekordów z nadmiarowymi informacjami...\n');
  
  const patterns = [
    'generacji',
    'gen',
    'USA',
    'benzyna',
    'Heavy Duty',
    'kabiny',
    'Sport',
    'XL',
    'Camper'
  ];
  
  for (const pattern of patterns) {
    const { data: matches, error } = await supabase
      .from('car_models_extended')
      .select('id, brand_name, model_name')
      .ilike('model_name', `%${pattern}%`)
      .limit(5);
    
    if (matches && matches.length > 0) {
      console.log(`\n⚠️ Znaleziono "${pattern}" w model_name:`);
      matches.forEach(m => console.log(`   [ID: ${m.id}] ${m.brand_name} - "${m.model_name}"`));
    }
  }
}

verifyState();

