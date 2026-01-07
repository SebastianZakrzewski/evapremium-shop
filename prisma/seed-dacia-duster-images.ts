import { createClient } from '@supabase/supabase-js';
import { env } from '../src/config/env';

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

async function addDaciaDusterImages() {
  console.log('🖼️ Aktualizowanie zdjęć produktu MAT dla Dacia Duster z generacjami w formacie zakresu lat...');

  // Najpierw usuń stare wpisy z generacjami "I", "II", "III"
  console.log('🗑️ Usuwanie starych wpisów z generacjami I, II, III...');
  const { error: deleteError } = await supabase
    .from('mat_product_images')
    .delete()
    .eq('car_brand_slug', 'dacia')
    .eq('car_model_slug', 'duster')
    .in('generation', ['I', 'II', 'III']);

  if (deleteError) {
    console.warn('⚠️ Ostrzeżenie podczas usuwania starych wpisów:', deleteError);
  } else {
    console.log('✅ Stare wpisy zostały usunięte');
  }

  // Dodaj nowe wpisy z generacjami w formacie zakresu lat
  console.log('➕ Dodawanie nowych wpisów z generacjami w formacie zakresu lat...');
  const imagesData = [
    {
      car_brand_slug: 'dacia',
      car_model_slug: 'duster',
      generation: '2010-2017', // Generacja I w formacie zakresu lat
      year: 2010, // Rok początkowy zakresu 2010-2017
      body_type: 'suv',
      image_url: '/images/product_mat_images/Dacia/Duster/Dacia_Duster_I_2010-2017_image_template.png',
      alt_text: 'Dywaniki samochodowe Dacia Duster I (2010-2017) - SUV',
      sort_order: 0,
      is_active: true,
    },
    {
      car_brand_slug: 'dacia',
      car_model_slug: 'duster',
      generation: '2017-2024', // Generacja II w formacie zakresu lat
      year: 2017, // Rok początkowy zakresu 2017-2024
      body_type: 'suv',
      image_url: '/images/product_mat_images/Dacia/Duster/Dacia_Duster_II_2017-2024_image_template.png',
      alt_text: 'Dywaniki samochodowe Dacia Duster II (2017-2024) - SUV',
      sort_order: 1,
      is_active: true,
    },
    {
      car_brand_slug: 'dacia',
      car_model_slug: 'duster',
      generation: '2024+', // Generacja III w formacie zakresu lat
      year: 2024, // Rok początkowy zakresu 2024+
      body_type: 'suv',
      image_url: '/images/product_mat_images/Dacia/Duster/Dacia_Duster_III_2024+_image_template.png',
      alt_text: 'Dywaniki samochodowe Dacia Duster III (2024+) - SUV',
      sort_order: 2,
      is_active: true,
    },
  ];

  console.log('📝 Dane do wstawienia:', imagesData);

  const { data, error } = await supabase
    .from('mat_product_images')
    .insert(imagesData)
    .select();

  if (error) {
    console.error('❌ Błąd podczas dodawania zdjęć:', error);
    throw new Error(`Error adding mat product images: ${error.message}`);
  }

  console.log('✅ Zdjęcia produktu zostały dodane pomyślnie!');
  console.log('📋 Dodane rekordy:', data);
  
  return data;
}

async function main() {
  try {
    await addDaciaDusterImages();
  } catch (error) {
    console.error('❌ Błąd:', error);
    process.exit(1);
  }
}

main();

