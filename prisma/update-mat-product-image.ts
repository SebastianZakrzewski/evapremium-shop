import { createClient } from '@supabase/supabase-js';
import { env } from '../src/config/env';

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

async function updateMatProductImage() {
  console.log('🔄 Aktualizowanie typu nadwozia na "hatchback" dla Dacia Spring...');

  // Aktualizuj wszystkie rekordy Dacia Spring z suv na hatchback
  const updateData = {
    body_type: 'hatchback',
    alt_text: 'Dywaniki samochodowe Dacia Spring IV (2021-2025) - Hatchback',
  };

  console.log('📝 Dane do aktualizacji:', updateData);
  console.log('🔍 Szukanie rekordów: car_brand_slug=dacia, car_model_slug=spring, body_type=suv');

  const { data, error } = await supabase
    .from('mat_product_images')
    .update(updateData)
    .eq('car_brand_slug', 'dacia')
    .eq('car_model_slug', 'spring')
    .eq('body_type', 'suv')
    .select();

  if (error) {
    console.error('❌ Błąd podczas aktualizacji zdjęcia:', error);
    throw new Error(`Error updating mat product image: ${error.message}`);
  }

  if (!data || data.length === 0) {
    console.warn('⚠️ Nie znaleziono rekordów do aktualizacji. Możliwe, że rekord już ma body_type=hatchback lub nie istnieje.');
    return null;
  }

  console.log(`✅ Zaktualizowano ${data.length} rekord(ów) pomyślnie!`);
  console.log('📋 Zaktualizowane rekordy:', data);
  
  return data;
}

async function main() {
  try {
    await updateMatProductImage();
  } catch (error) {
    console.error('❌ Błąd:', error);
    process.exit(1);
  }
}

main();

