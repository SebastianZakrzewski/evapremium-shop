import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Załaduj zmienne środowiskowe
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kmepxyervpeujwvgdqtm.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  throw new Error('Missing Supabase key. Please set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface CleanedRecord {
  id: number;
  brand_name: string;
  model_name_original: string;
  model_name_cleaned: string;
  needsCleaning: boolean;
}

interface UpdateStats {
  totalRecords: number;
  updatedRecords: number;
  skippedRecords: number;
  errors: Array<{
    id: number;
    error: string;
  }>;
  startTime: string;
  endTime?: string;
  duration?: number;
}

async function updateCarModelsInDatabase(): Promise<void> {
  console.log('🔄 Rozpoczynam aktualizację bazy danych...\n');

  const stats: UpdateStats = {
    totalRecords: 0,
    updatedRecords: 0,
    skippedRecords: 0,
    errors: [],
    startTime: new Date().toISOString()
  };

  try {
    // Wczytaj oczyszczone dane
    const cleanedDataPath = path.join(process.cwd(), 'output', 'cleaned-models.json');
    if (!fs.existsSync(cleanedDataPath)) {
      throw new Error(`Plik z oczyszczonymi danymi nie istnieje: ${cleanedDataPath}`);
    }

    const cleanedData: CleanedRecord[] = JSON.parse(fs.readFileSync(cleanedDataPath, 'utf-8'));
    const recordsToUpdate = cleanedData.filter(record => record.needsCleaning);
    
    stats.totalRecords = cleanedData.length;
    console.log(`📊 Łączna liczba rekordów: ${stats.totalRecords}`);
    console.log(`🔄 Rekordy do aktualizacji: ${recordsToUpdate.length}`);
    console.log(`⏭️  Rekordy do pominięcia: ${stats.totalRecords - recordsToUpdate.length}\n`);

    if (recordsToUpdate.length === 0) {
      console.log('✅ Wszystkie rekordy są już czyste - brak aktualizacji do wykonania!');
      return;
    }

    // Aktualizuj rekordy w batch'ach po 50
    const batchSize = 50;
    const totalBatches = Math.ceil(recordsToUpdate.length / batchSize);
    
    console.log(`📦 Aktualizacja w ${totalBatches} batch'ach po ${batchSize} rekordów\n`);

    for (let i = 0; i < recordsToUpdate.length; i += batchSize) {
      const batch = recordsToUpdate.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      
      console.log(`⏳ Przetwarzanie batch ${batchNumber}/${totalBatches} (${batch.length} rekordów)...`);

      // Przygotuj dane do aktualizacji
      const updates = batch.map(record => ({
        id: record.id,
        model_name: record.model_name_cleaned
      }));

      // Wykonaj aktualizację dla każdego rekordu w batch'u
      for (const update of updates) {
        try {
          const { error } = await supabase
            .from('car_models_extended')
            .update({ model_name: update.model_name })
            .eq('id', update.id);

          if (error) {
            stats.errors.push({
              id: update.id,
              error: error.message
            });
            console.log(`   ❌ Błąd dla ID ${update.id}: ${error.message}`);
          } else {
            stats.updatedRecords++;
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd';
          stats.errors.push({
            id: update.id,
            error: errorMessage
          });
          console.log(`   ❌ Błąd dla ID ${update.id}: ${errorMessage}`);
        }
      }

      // Dodaj małe opóźnienie między batch'ami
      if (i + batchSize < recordsToUpdate.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      console.log(`   ✅ Batch ${batchNumber} zakończony`);
    }

    stats.skippedRecords = stats.totalRecords - stats.updatedRecords - stats.errors.length;
    stats.endTime = new Date().toISOString();
    stats.duration = new Date(stats.endTime).getTime() - new Date(stats.startTime).getTime();

    // Zapisz statystyki aktualizacji
    const outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const statsPath = path.join(outputDir, 'update-stats.json');
    fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));

    // Wyświetl podsumowanie
    console.log('\n📊 PODSUMOWANIE AKTUALIZACJI:');
    console.log(`📈 Łączna liczba rekordów: ${stats.totalRecords}`);
    console.log(`✅ Zaktualizowane rekordy: ${stats.updatedRecords}`);
    console.log(`⏭️  Pominięte rekordy: ${stats.skippedRecords}`);
    console.log(`❌ Błędy: ${stats.errors.length}`);
    console.log(`⏱️  Czas wykonania: ${(stats.duration! / 1000).toFixed(2)} sekund`);

    if (stats.errors.length > 0) {
      console.log('\n❌ BŁĘDY PODCZAS AKTUALIZACJI:');
      stats.errors.slice(0, 10).forEach(error => {
        console.log(`   • ID ${error.id}: ${error.error}`);
      });
      if (stats.errors.length > 10) {
        console.log(`   ... i ${stats.errors.length - 10} więcej błędów`);
      }
    }

    console.log(`\n💾 Zapisano statystyki do: ${statsPath}`);
    console.log('\n✅ Aktualizacja bazy danych zakończona!');

    // Weryfikacja - sprawdź kilka zaktualizowanych rekordów
    if (stats.updatedRecords > 0) {
      console.log('\n🔍 Weryfikacja aktualizacji...');
      
      const sampleIds = recordsToUpdate.slice(0, 3).map(r => r.id);
      for (const id of sampleIds) {
        const { data, error } = await supabase
          .from('car_models_extended')
          .select('id, brand_name, model_name')
          .eq('id', id)
          .single();

        if (error) {
          console.log(`   ❌ Nie można zweryfikować ID ${id}: ${error.message}`);
        } else {
          console.log(`   ✅ ID ${id}: ${data.brand_name} - "${data.model_name}"`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Błąd podczas aktualizacji bazy danych:', error);
    throw error;
  }
}

// Uruchom aktualizację
if (require.main === module) {
  updateCarModelsInDatabase()
    .then(() => {
      console.log('\n✅ Skrypt aktualizacji zakończony pomyślnie!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Skrypt aktualizacji zakończony z błędem:', error.message);
      process.exit(1);
    });
}

export { updateCarModelsInDatabase, type UpdateStats };
