import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

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
  generation: string | null;
  body_type: string | null;
}

async function fetchAllCarModelsWithBodyTypes() {
  console.log('🚀 Pobieranie wszystkich rekordów z body_type i generation...\n');

  try {
    const allRecords: CarModelRecord[] = [];
    let page = 0;
    const pageSize = 150;
    let hasMore = true;

    while (hasMore) {
      console.log(`📄 Pobieranie strony ${page + 1}...`);
      
      const { data, error } = await supabase
        .from('car_models_extended')
        .select('id, brand_name, model_name, generation, body_type')
        .not('body_type', 'is', null)
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        hasMore = false;
        console.log('✅ Wszystkie rekordy pobrane');
        break;
      }

      allRecords.push(...data);
      console.log(`   Pobrano ${data.length} rekordów (łącznie: ${allRecords.length})`);

      if (data.length < pageSize) {
        hasMore = false;
        console.log('✅ Osiągnięto koniec danych');
      }

      page++;
    }

    console.log(`\n📊 Podsumowanie pobierania:`);
    console.log(`   Łączna liczba rekordów: ${allRecords.length}`);
    console.log(`   Liczba stron: ${page}`);

    // Sprawdź unikalne marki
    const uniqueBrands = new Set(allRecords.map(r => r.brand_name));
    console.log(`   Unikalne marki: ${uniqueBrands.size}`);

    // Sprawdź unikalne modele
    const uniqueModels = new Set(allRecords.map(r => `${r.brand_name} - ${r.model_name}`));
    console.log(`   Unikalne modele: ${uniqueModels.size}`);

    // Sprawdź unikalne typy nadwozia
    const uniqueBodyTypes = new Set(allRecords.map(r => r.body_type).filter(Boolean));
    console.log(`   Unikalne typy nadwozia: ${uniqueBodyTypes.size}`);

    // Sprawdź rekordy z generation
    const recordsWithGeneration = allRecords.filter(r => r.generation);
    console.log(`   Rekordy z generation: ${recordsWithGeneration.length}`);

    // Zapisz do pliku
    const outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'car-models-with-body-types.json');
    fs.writeFileSync(outputPath, JSON.stringify(allRecords, null, 2));
    
    console.log(`\n💾 Dane zapisane do: ${outputPath}`);

    // Przykłady danych
    console.log('\n📋 Przykłady pobranych danych:');
    allRecords.slice(0, 10).forEach((record, index) => {
      console.log(`   ${index + 1}. ${record.brand_name} ${record.model_name} | ${record.generation || 'Brak'} | ${record.body_type}`);
    });

    // Statystyki typów nadwozia
    const bodyTypeCounts: { [key: string]: number } = {};
    allRecords.forEach(record => {
      if (record.body_type) {
        bodyTypeCounts[record.body_type] = (bodyTypeCounts[record.body_type] || 0) + 1;
      }
    });

    const sortedBodyTypes = Object.entries(bodyTypeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15);

    console.log('\n🏷️ Najczęstsze typy nadwozia:');
    sortedBodyTypes.forEach(([type, count]) => {
      console.log(`   ${type}: ${count} rekordów`);
    });

  } catch (error) {
    console.error('❌ Błąd podczas pobierania danych:', error);
  }
}

fetchAllCarModelsWithBodyTypes();
