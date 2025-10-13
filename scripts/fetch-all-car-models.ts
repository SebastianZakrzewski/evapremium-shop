import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Załaduj zmienne środowiskowe
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://diqbnsinhsedmvvstvvc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  throw new Error('Missing Supabase key. Please set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface CarModelRecord {
  id: number;
  brand_name: string;
  model_name: string;
}

async function fetchAllCarModels(): Promise<CarModelRecord[]> {
  console.log('🚀 Rozpoczynam pobieranie wszystkich rekordów z car_models_extended...\n');

  const allRecords: CarModelRecord[] = [];
  const pageSize = 150;
  let offset = 0;
  let hasMore = true;
  let totalFetched = 0;

  try {
    // Najpierw sprawdź ile jest rekordów
    const { count, error: countError } = await supabase
      .from('car_models_extended')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw new Error(`Błąd podczas liczenia rekordów: ${countError.message}`);
    }

    console.log(`📊 Całkowita liczba rekordów w tabeli: ${count}`);
    console.log(`📄 Rozmiar strony: ${pageSize} rekordów\n`);

    // Pobieraj rekordy strona po stronie
    while (hasMore) {
      console.log(`⏳ Pobieranie strony ${Math.floor(offset / pageSize) + 1}... (offset: ${offset})`);

      const { data, error } = await supabase
        .from('car_models_extended')
        .select('id, brand_name, model_name')
        .range(offset, offset + pageSize - 1)
        .order('id');

      if (error) {
        throw new Error(`Błąd podczas pobierania danych: ${error.message}`);
      }

      if (!data || data.length === 0) {
        hasMore = false;
        console.log('✅ Osiągnięto koniec danych');
        break;
      }

      allRecords.push(...data);
      totalFetched += data.length;
      
      console.log(`   ✅ Pobrano ${data.length} rekordów (łącznie: ${totalFetched})`);

      // Sprawdź czy to była ostatnia strona
      if (data.length < pageSize) {
        hasMore = false;
        console.log('✅ Osiągnięto ostatnią stronę');
      }

      offset += pageSize;

      // Dodaj małe opóźnienie żeby nie przeciążyć bazy
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n🎉 Pobieranie zakończone!`);
    console.log(`📈 Łącznie pobrano: ${allRecords.length} rekordów`);

    // Sprawdź unikalne marki
    const uniqueBrands = [...new Set(allRecords.map(r => r.brand_name))].sort();
    console.log(`🏷️  Liczba unikalnych marek: ${uniqueBrands.length}`);
    console.log(`📋 Marki: ${uniqueBrands.join(', ')}\n`);

    // Zapisz surowe dane do pliku
    const outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const rawDataPath = path.join(outputDir, 'all-car-models-raw.json');
    fs.writeFileSync(rawDataPath, JSON.stringify(allRecords, null, 2));
    console.log(`💾 Zapisano surowe dane do: ${rawDataPath}`);

    return allRecords;

  } catch (error) {
    console.error('❌ Błąd podczas pobierania danych:', error);
    throw error;
  }
}

// Uruchom pobieranie
if (require.main === module) {
  fetchAllCarModels()
    .then((records) => {
      console.log('\n✅ Skrypt zakończony pomyślnie!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Skrypt zakończony z błędem:', error.message);
      process.exit(1);
    });
}

export { fetchAllCarModels, type CarModelRecord };
