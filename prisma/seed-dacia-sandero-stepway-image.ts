import { createClient } from '@supabase/supabase-js';
import { env } from '../src/config/env';

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

async function addDaciaSanderoStepwayImage() {
  console.log('🖼️ Dodawanie zdjęcia produktu MAT dla Dacia Sandero Stepway do bazy danych...');

  const imageData = {
    car_brand_slug: 'dacia',
    car_model_slug: 'sandero-stepway', // Konwersja nazwy na slug
    generation: null, // Generacja nie jest określona dla tego modelu
    year: 2012, // Rok początkowy zakresu 2012-2020
    body_type: 'hatchback',
    image_url: '/images/product_mat_images/Dacia/Sandero/Dacia_Sandero Stepway_2012-2020_image_0_template_classic.png',
    alt_text: 'Dywaniki samochodowe Dacia Sandero Stepway (2012-2020) - Hatchback 5 drzwi',
    sort_order: 0,
    is_active: true,
  };

  console.log('📝 Dane do wstawienia:', imageData);

  const { data, error } = await supabase
    .from('mat_product_images')
    .insert([imageData])
    .select()
    .single();

  if (error) {
    console.error('❌ Błąd podczas dodawania zdjęcia:', error);
    throw new Error(`Error adding mat product image: ${error.message}`);
  }

  console.log('✅ Zdjęcie produktu zostało dodane pomyślnie!');
  console.log('📋 Dodany rekord:', data);
  
  return data;
}

async function main() {
  try {
    await addDaciaSanderoStepwayImage();
  } catch (error) {
    console.error('❌ Błąd:', error);
    process.exit(1);
  }
}

main();














