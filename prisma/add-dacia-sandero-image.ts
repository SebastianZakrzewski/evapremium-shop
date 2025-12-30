import { createClient } from '@supabase/supabase-js';
import { env } from '../src/config/env';

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

async function addDaciaSanderoImage() {
  console.log('🖼️ Dodawanie zdjęcia produktu MAT dla Dacia Sandero (bez Stepway) do bazy danych...');

  // Sprawdź czy istnieje już rekord dla Sandero
  const { data: existingRecord, error: findError } = await supabase
    .from('mat_product_images')
    .select('*')
    .eq('car_brand_slug', 'dacia')
    .eq('car_model_slug', 'sandero')
    .eq('year', 2012)
    .eq('body_type', 'hatchback')
    .maybeSingle();

  if (findError && findError.code !== 'PGRST116') {
    console.error('❌ Błąd podczas sprawdzania istniejącego rekordu:', findError);
    throw new Error(`Error checking existing record: ${findError.message}`);
  }

  if (existingRecord) {
    console.log('📋 Znaleziono istniejący rekord, aktualizuję...');
    
    // Aktualizuj istniejący rekord
    const { data: updatedRecord, error: updateError } = await supabase
      .from('mat_product_images')
      .update({
        generation: '2012-2020',
        image_url: '/images/product_mat_images/Dacia/Sandero/Dacia_Sandero Stepway_2012-2020_image_0_template_classic.png',
        alt_text: 'Dywaniki samochodowe Dacia Sandero (2012-2020) - Hatchback 5 drzwi',
        is_active: true
      })
      .eq('id', existingRecord.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Błąd podczas aktualizacji rekordu:', updateError);
      throw new Error(`Error updating record: ${updateError.message}`);
    }

    console.log('✅ Rekord został zaktualizowany pomyślnie!');
    console.log('📋 Zaktualizowany rekord:', updatedRecord);
    return updatedRecord;
  } else {
    console.log('📝 Tworzenie nowego rekordu...');
    
    // Utwórz nowy rekord dla Sandero (bez Stepway)
    const imageData = {
      car_brand_slug: 'dacia',
      car_model_slug: 'sandero', // Sandero bez Stepway
      generation: '2012-2020',
      year: 2012, // Rok początkowy zakresu 2012-2020
      body_type: 'hatchback',
      image_url: '/images/product_mat_images/Dacia/Sandero/Dacia_Sandero Stepway_2012-2020_image_0_template_classic.png',
      alt_text: 'Dywaniki samochodowe Dacia Sandero (2012-2020) - Hatchback 5 drzwi',
      sort_order: 0,
      is_active: true,
    };

    console.log('📝 Dane do wstawienia:', imageData);

    const { data: newRecord, error: insertError } = await supabase
      .from('mat_product_images')
      .insert([imageData])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Błąd podczas dodawania zdjęcia:', insertError);
      throw new Error(`Error adding mat product image: ${insertError.message}`);
    }

    console.log('✅ Zdjęcie produktu zostało dodane pomyślnie!');
    console.log('📋 Dodany rekord:', newRecord);
    return newRecord;
  }
}

async function main() {
  try {
    await addDaciaSanderoImage();
  } catch (error) {
    console.error('❌ Błąd:', error);
    process.exit(1);
  }
}

main();




