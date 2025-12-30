import { createClient } from '@supabase/supabase-js';
import { env } from '../src/config/env';

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

async function addMatProductImage() {
  console.log('🖼️ Dodawanie zdjęcia produktu MAT do bazy danych...');

  const imageData = {
    car_brand_slug: 'dacia',
    car_model_slug: 'spring',
    generation: null, // Generacja nie jest określona dla tego modelu
    year: 2021, // Rok początkowy zakresu 2021-2025
    body_type: 'hatchback',
    image_url: '/images/product_mat_images/Dacia/Spring/Dacia_Spring_2021-2025_image_4_template_3d.png',
    alt_text: 'Dywaniki samochodowe Dacia Spring IV (2021-2025) - Hatchback',
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
    await addMatProductImage();
  } catch (error) {
    console.error('❌ Błąd:', error);
    process.exit(1);
  }
}

main();

