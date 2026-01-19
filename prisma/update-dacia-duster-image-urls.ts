import { createClient } from '@supabase/supabase-js';
import { env } from '../src/config/env';

const supabase = createClient(env.supabase.url, env.supabase.serviceRoleKey);

async function updateDaciaDusterImageUrls() {
  console.log('🖼️ Aktualizowanie URL-i zdjęć dla Dacia Duster...');

  const updates = [
    {
      generation: '2010-2017',
      year: 2010,
      imageUrl: '/images/product_mat_images/Dacia/Duster/Dacia_Duster_2010-2017_image_3_template_3d.png',
      altText: 'Dywaniki samochodowe Dacia Duster I (2010-2017) - SUV',
    },
    {
      generation: '2017-2024',
      year: 2017,
      imageUrl: '/images/product_mat_images/Dacia/Duster/Dacia_Duster_2017-2023_image_8_template_3d.png',
      altText: 'Dywaniki samochodowe Dacia Duster II (2017-2024) - SUV',
    },
    {
      generation: '2024+',
      year: 2024,
      imageUrl: '/images/product_mat_images/Dacia/Duster/Dacia_Duster_2024-2027_image_15_template_3d.png',
      altText: 'Dywaniki samochodowe Dacia Duster III (2024+) - SUV',
    },
  ];

  for (const update of updates) {
    console.log(`\n🔄 Aktualizowanie wpisu dla generacji ${update.generation}...`);

    // Znajdź istniejący rekord
    const { data: existingRecord, error: findError } = await supabase
      .from('mat_product_images')
      .select('*')
      .eq('car_brand_slug', 'dacia')
      .eq('car_model_slug', 'duster')
      .eq('generation', update.generation)
      .eq('year', update.year)
      .eq('body_type', 'suv')
      .single();

    if (findError || !existingRecord) {
      console.error(`❌ Nie znaleziono rekordu dla generacji ${update.generation}:`, findError);
      // Spróbuj znaleźć bez body_type
      const { data: recordWithoutBodyType, error: findError2 } = await supabase
        .from('mat_product_images')
        .select('*')
        .eq('car_brand_slug', 'dacia')
        .eq('car_model_slug', 'duster')
        .eq('generation', update.generation)
        .eq('year', update.year)
        .single();

      if (findError2 || !recordWithoutBodyType) {
        console.error(`❌ Nie znaleziono rekordu nawet bez body_type dla generacji ${update.generation}`);
        continue;
      }

      console.log(`📋 Znaleziony rekord (bez body_type):`, recordWithoutBodyType);

      // Aktualizuj URL zdjęcia
      const { data: updatedRecord, error: updateError } = await supabase
        .from('mat_product_images')
        .update({
          image_url: update.imageUrl,
          alt_text: update.altText,
        })
        .eq('id', recordWithoutBodyType.id)
        .select()
        .single();

      if (updateError) {
        console.error(`❌ Błąd podczas aktualizacji dla generacji ${update.generation}:`, updateError);
      } else {
        console.log(`✅ Zaktualizowano rekord dla generacji ${update.generation}:`, updatedRecord);
      }
    } else {
      console.log(`📋 Znaleziony rekord:`, existingRecord);

      // Aktualizuj URL zdjęcia
      const { data: updatedRecord, error: updateError } = await supabase
        .from('mat_product_images')
        .update({
          image_url: update.imageUrl,
          alt_text: update.altText,
        })
        .eq('id', existingRecord.id)
        .select()
        .single();

      if (updateError) {
        console.error(`❌ Błąd podczas aktualizacji dla generacji ${update.generation}:`, updateError);
      } else {
        console.log(`✅ Zaktualizowano rekord dla generacji ${update.generation}:`, updatedRecord);
      }
    }
  }

  console.log('\n✅ Aktualizacja URL-i zdjęć zakończona!');
}

async function main() {
  try {
    await updateDaciaDusterImageUrls();
  } catch (error) {
    console.error('❌ Błąd:', error);
    process.exit(1);
  }
}

main();









