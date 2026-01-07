import { createClient } from '@supabase/supabase-js';
import { env } from '../src/config/env';

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

async function updateDaciaSanderoStepwayGeneration() {
  console.log('🔄 Aktualizowanie generacji dla Dacia Sandero Stepway...');

  // Znajdź istniejący rekord
  const { data: existingRecord, error: findError } = await supabase
    .from('mat_product_images')
    .select('*')
    .eq('car_brand_slug', 'dacia')
    .eq('car_model_slug', 'sandero-stepway')
    .eq('year', 2012)
    .eq('body_type', 'hatchback')
    .single();

  if (findError || !existingRecord) {
    console.error('❌ Nie znaleziono rekordu do aktualizacji:', findError);
    throw new Error(`Record not found: ${findError?.message || 'No record found'}`);
  }

  console.log('📋 Znaleziony rekord:', existingRecord);

  // Aktualizuj generację - dla Sandero Stepway 2012-2020 to druga generacja (II)
  // Używamy formatu "2012-2020" zgodnie z danymi w systemie
  const { data: updatedRecord, error: updateError } = await supabase
    .from('mat_product_images')
    .update({ 
      generation: '2012-2020' // Generacja dla Sandero Stepway z lat 2012-2020
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
    await updateDaciaSanderoStepwayGeneration();
  } catch (error) {
    console.error('❌ Błąd:', error);
    process.exit(1);
  }
}

main();














