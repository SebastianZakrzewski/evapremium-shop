import { createClient } from '@supabase/supabase-js';
import { env } from '../src/config/env';

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

async function updateDaciaSpringGeneration() {
  console.log('🔄 Aktualizowanie generacji dla Dacia Spring...');

  // Znajdź istniejący rekord
  const { data: existingRecord, error: findError } = await supabase
    .from('mat_product_images')
    .select('*')
    .eq('car_brand_slug', 'dacia')
    .eq('car_model_slug', 'spring')
    .eq('year', 2021)
    .eq('body_type', 'hatchback')
    .single();

  if (findError || !existingRecord) {
    console.error('❌ Nie znaleziono rekordu do aktualizacji:', findError);
    throw new Error(`Record not found: ${findError?.message || 'No record found'}`);
  }

  console.log('📋 Znaleziony rekord:', existingRecord);

  // Aktualizuj generację - dla Spring 2021+ to generacja "2021+" zgodnie z danymi w API
  const { data: updatedRecord, error: updateError } = await supabase
    .from('mat_product_images')
    .update({ 
      generation: '2021+' // Generacja dla Spring z lat 2021+
    })
    .eq('id', existingRecord.id)
    .select()
    .single();

  if (updateError) {
    console.error('❌ Błąd podczas aktualizacji generacji:', updateError);
    throw new Error(`Error updating generation: ${updateError.message}`);
  }

  console.log('✅ Generacja została zaktualizowana pomyślnie!');
  console.log('📋 Zaktualizowany rekord:', updatedRecord);
  
  return updatedRecord;
}

async function main() {
  try {
    await updateDaciaSpringGeneration();
  } catch (error) {
    console.error('❌ Błąd:', error);
    process.exit(1);
  }
}

main();









