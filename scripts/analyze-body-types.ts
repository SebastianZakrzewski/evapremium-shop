import { createClient } from '@supabase/supabase-js';
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

async function analyzeBodyTypes() {
  console.log('🔍 Analiza typów nadwozia w bazie danych...\n');

  try {
    // Pobierz wszystkie rekordy z body_type
    const { data: records, error } = await supabase
      .from('car_models_extended')
      .select('id, brand_name, model_name, generation, body_type')
      .not('body_type', 'is', null);

    if (error) {
      throw error;
    }

    if (!records || records.length === 0) {
      console.log('❌ Brak rekordów z body_type w bazie danych');
      return;
    }

    console.log(`📊 Znaleziono ${records.length} rekordów z body_type`);

    // Analiza unikalnych typów nadwozia
    const uniqueBodyTypes = new Set<string>();
    const bodyTypeCounts: { [key: string]: number } = {};
    const brandBodyTypes: { [brand: string]: Set<string> } = {};
    const modelBodyTypes: { [key: string]: Set<string> } = {};

    records.forEach((record: CarModelRecord) => {
      if (record.body_type) {
        // Dodaj do unikalnych typów
        uniqueBodyTypes.add(record.body_type);
        
        // Policz wystąpienia
        bodyTypeCounts[record.body_type] = (bodyTypeCounts[record.body_type] || 0) + 1;
        
        // Grupuj po marce
        if (!brandBodyTypes[record.brand_name]) {
          brandBodyTypes[record.brand_name] = new Set();
        }
        brandBodyTypes[record.brand_name].add(record.body_type);
        
        // Grupuj po marce + model
        const key = `${record.brand_name} - ${record.model_name}`;
        if (!modelBodyTypes[key]) {
          modelBodyTypes[key] = new Set();
        }
        modelBodyTypes[key].add(record.body_type);
      }
    });

    // Sortuj typy nadwozia według częstotliwości
    const sortedBodyTypes = Object.entries(bodyTypeCounts)
      .sort(([,a], [,b]) => b - a);

    console.log('\n📈 Statystyki typów nadwozia:');
    console.log(`Łączna liczba rekordów z body_type: ${records.length}`);
    console.log(`Unikalne typy nadwozia: ${uniqueBodyTypes.size}`);
    console.log('\nNajczęstsze typy nadwozia:');
    sortedBodyTypes.slice(0, 10).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} rekordów`);
    });

    // Przykłady dla różnych marek
    console.log('\n🏷️ Przykłady typów nadwozia dla marek:');
    const popularBrands = ['Bmw', 'Audi', 'Mercedes-Benz', 'Toyota', 'Volkswagen'];
    
    popularBrands.forEach(brand => {
      if (brandBodyTypes[brand]) {
        const types = Array.from(brandBodyTypes[brand]);
        console.log(`  ${brand}: ${types.join(', ')}`);
      }
    });

    // Przykłady modeli z różnymi typami nadwozia
    console.log('\n🚗 Przykłady modeli z typami nadwozia:');
    const modelExamples = Object.entries(modelBodyTypes)
      .filter(([, types]) => types.size > 1)
      .slice(0, 10);

    modelExamples.forEach(([model, types]) => {
      const typeArray = Array.from(types);
      console.log(`  ${model}: ${typeArray.join(', ')}`);
    });

    // Sprawdź format danych body_type
    console.log('\n🔍 Analiza formatu danych body_type:');
    const sampleRecords = records.slice(0, 20);
    console.log('Przykładowe rekordy:');
    sampleRecords.forEach((record, index) => {
      console.log(`  ${index + 1}. ${record.brand_name} ${record.model_name}: "${record.body_type}"`);
    });

    // Sprawdź czy body_type zawiera przecinki (może być array jako string)
    const commaSeparated = records.filter(r => r.body_type && r.body_type.includes(','));
    if (commaSeparated.length > 0) {
      console.log(`\n⚠️ Znaleziono ${commaSeparated.length} rekordów z przecinkami w body_type:`);
      commaSeparated.slice(0, 5).forEach(record => {
        console.log(`  ${record.brand_name} ${record.model_name}: "${record.body_type}"`);
      });
    }

    // Sprawdź puste lub null body_type
    const { data: allRecords } = await supabase
      .from('car_models_extended')
      .select('id, brand_name, model_name, body_type');
    
    const totalRecords = allRecords?.length || 0;
    const recordsWithBodyType = records.length;
    const recordsWithoutBodyType = totalRecords - recordsWithBodyType;

    console.log('\n📊 Podsumowanie:');
    console.log(`  Łączna liczba rekordów: ${totalRecords}`);
    console.log(`  Rekordy z body_type: ${recordsWithBodyType} (${Math.round(recordsWithBodyType/totalRecords*100)}%)`);
    console.log(`  Rekordy bez body_type: ${recordsWithoutBodyType} (${Math.round(recordsWithoutBodyType/totalRecords*100)}%)`);

    // Zapisz wyniki analizy
    const analysisResult = {
      totalRecords,
      recordsWithBodyType,
      recordsWithoutBodyType,
      uniqueBodyTypes: Array.from(uniqueBodyTypes),
      bodyTypeCounts,
      brandBodyTypes: Object.fromEntries(
        Object.entries(brandBodyTypes).map(([brand, types]) => [brand, Array.from(types)])
      ),
      modelBodyTypes: Object.fromEntries(
        Object.entries(modelBodyTypes).map(([model, types]) => [model, Array.from(types)])
      ),
      sampleRecords: sampleRecords.map(r => ({
        brand: r.brand_name,
        model: r.model_name,
        bodyType: r.body_type,
        generation: r.generation
      })),
      commaSeparatedCount: commaSeparated.length,
      commaSeparatedExamples: commaSeparated.slice(0, 10).map(r => ({
        brand: r.brand_name,
        model: r.model_name,
        bodyType: r.body_type
      }))
    };

    const fs = require('fs');
    const path = require('path');
    
    const outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'body-types-analysis.json');
    fs.writeFileSync(outputPath, JSON.stringify(analysisResult, null, 2));
    
    console.log(`\n💾 Wyniki analizy zapisane do: ${outputPath}`);

  } catch (error) {
    console.error('❌ Błąd podczas analizy:', error);
  }
}

analyzeBodyTypes();
