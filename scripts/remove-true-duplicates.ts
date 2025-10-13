/**
 * Skrypt do usuwania prawdziwych duplikatów z zachowaniem różnych generacji/roczników
 * Usuwa tylko rekordy z identycznymi danymi, zachowując różne generacje i roczniki
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Załaduj zmienne środowiskowe
config();

// Konfiguracja Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://diqbnsinhsedmvvstvvc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseKey) {
  console.error('❌ Brak klucza Supabase. Ustaw SUPABASE_SERVICE_ROLE_KEY w zmiennych środowiskowych.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface CarModel {
  id: number;
  brand_name: string;
  model_name: string;
  generation: string;
  body_type: string;
  year_from: number | null;
  year_to: number | null;
  is_currently_produced: boolean;
  created_at: string;
  updated_at: string;
}

interface DuplicateGroup {
  key: string;
  models: CarModel[];
  keepId: number;
  removeIds: number[];
}

interface DuplicateAnalysis {
  totalRecords: number;
  duplicateGroups: DuplicateGroup[];
  totalDuplicates: number;
  recordsToRemove: number;
}

// Funkcja do pobierania danych
async function getCarModels(): Promise<CarModel[]> {
  console.log('🔍 Pobieranie danych z tabeli car_models_extended...');
  
  // Pobierz wszystkie rekordy (bez limitu)
  let allModels: CarModel[] = [];
  let from = 0;
  const pageSize = 1000;
  
  while (true) {
    const { data: models, error } = await supabase
      .from('car_models_extended')
      .select('*')
      .order('brand_name', { ascending: true })
      .order('model_name', { ascending: true })
      .range(from, from + pageSize - 1);
    
    if (error) {
      console.error('❌ Błąd podczas pobierania danych:', error);
      throw error;
    }
    
    if (!models || models.length === 0) {
      break;
    }
    
    allModels = allModels.concat(models);
    
    if (models.length < pageSize) {
      break;
    }
    
    from += pageSize;
  }
  
  console.log(`✅ Pobrano ${allModels.length} rekordów`);
  return allModels;
}

// Funkcja do tworzenia klucza grupowania
function createGroupKey(model: CarModel): string {
  return `${model.brand_name}|${model.model_name}|${model.generation}|${model.body_type}|${model.year_from || 'null'}|${model.year_to || 'null'}`;
}

// Funkcja do analizy duplikatów
function analyzeDuplicates(models: CarModel[]): DuplicateAnalysis {
  console.log('🔍 Analizowanie duplikatów...');
  
  const groups: { [key: string]: CarModel[] } = {};
  
  // Grupowanie według klucza
  models.forEach(model => {
    const key = createGroupKey(model);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(model);
  });
  
  // Identyfikacja grup duplikatów
  const duplicateGroups: DuplicateGroup[] = [];
  let totalDuplicates = 0;
  let recordsToRemove = 0;
  
  Object.entries(groups).forEach(([key, groupModels]) => {
    if (groupModels.length > 1) {
      // Sortuj według ID (zachowaj najstarszy rekord)
      groupModels.sort((a, b) => a.id - b.id);
      
      const keepModel = groupModels[0];
      const removeModels = groupModels.slice(1);
      
      duplicateGroups.push({
        key,
        models: groupModels,
        keepId: keepModel.id,
        removeIds: removeModels.map(m => m.id)
      });
      
      totalDuplicates += groupModels.length;
      recordsToRemove += removeModels.length;
    }
  });
  
  return {
    totalRecords: models.length,
    duplicateGroups,
    totalDuplicates,
    recordsToRemove
  };
}

// Funkcja do generowania raportu
function generateReport(analysis: DuplicateAnalysis): string {
  let report = '# Raport usuwania prawdziwych duplikatów\n\n';
  
  report += `## Podsumowanie\n`;
  report += `- **Łączna liczba rekordów:** ${analysis.totalRecords}\n`;
  report += `- **Grupy duplikatów:** ${analysis.duplicateGroups.length}\n`;
  report += `- **Łączna liczba duplikatów:** ${analysis.totalDuplicates}\n`;
  report += `- **Rekordy do usunięcia:** ${analysis.recordsToRemove}\n`;
  report += `- **Rekordy do zachowania:** ${analysis.totalRecords - analysis.recordsToRemove}\n\n`;
  
  report += `## Zasady usuwania\n\n`;
  report += `- ✅ **Zachowujemy różne generacje** (różne \`generation\`)\n`;
  report += `- ✅ **Zachowujemy różne roczniki** (różne \`year_from\`, \`year_to\`)\n`;
  report += `- ✅ **Zachowujemy różne typy nadwozia** (różne \`body_type\`)\n`;
  report += `- ❌ **Usuwamy identyczne rekordy** (identyczne wszystkie pola)\n\n`;
  
  if (analysis.duplicateGroups.length > 0) {
    report += `## Grupy duplikatów do usunięcia\n\n`;
    
    analysis.duplicateGroups.forEach((group, index) => {
      const [brand, model, generation, bodyType, yearFrom, yearTo] = group.key.split('|');
      
      report += `### ${index + 1}. ${brand} - ${model}\n`;
      report += `- **Generacja:** ${generation}\n`;
      report += `- **Typ nadwozia:** ${bodyType}\n`;
      report += `- **Lata:** ${yearFrom === 'null' ? 'N/A' : yearFrom} - ${yearTo === 'null' ? 'N/A' : yearTo}\n`;
      report += `- **Liczba duplikatów:** ${group.models.length}\n`;
      report += `- **Zachować ID:** ${group.keepId}\n`;
      report += `- **Usunąć ID:** ${group.removeIds.join(', ')}\n\n`;
    });
  }
  
  return report;
}

// Funkcja do usuwania duplikatów
async function removeDuplicates(analysis: DuplicateAnalysis, dryRun: boolean = true): Promise<void> {
  if (analysis.recordsToRemove === 0) {
    console.log('✅ Brak duplikatów do usunięcia');
    return;
  }
  
  console.log(`🧹 ${dryRun ? 'Symulacja' : 'Wykonywanie'} usuwania duplikatów...`);
  console.log(`📊 Do usunięcia: ${analysis.recordsToRemove} rekordów`);
  
  if (dryRun) {
    console.log('\n📋 Preview usuwania (pierwsze 10 grup):');
    analysis.duplicateGroups.slice(0, 10).forEach((group, index) => {
      const [brand, model] = group.key.split('|');
      console.log(`${index + 1}. ${brand} - ${model}: zachować ID ${group.keepId}, usunąć ID ${group.removeIds.join(', ')}`);
    });
    
    if (analysis.duplicateGroups.length > 10) {
      console.log(`... i ${analysis.duplicateGroups.length - 10} więcej grup`);
    }
  } else {
    console.log('💾 Wykonywanie usuwania w bazie danych...');
    
    let successCount = 0;
    let errorCount = 0;
    
    // Usuń wszystkie ID do usunięcia
    const allRemoveIds = analysis.duplicateGroups.flatMap(group => group.removeIds);
    
    try {
      const { error } = await supabase
        .from('car_models_extended')
        .delete()
        .in('id', allRemoveIds);
      
      if (error) {
        console.error('❌ Błąd podczas usuwania:', error);
        errorCount = allRemoveIds.length;
      } else {
        successCount = allRemoveIds.length;
        console.log(`✅ Usunięto ${successCount} rekordów`);
      }
    } catch (err) {
      console.error('❌ Błąd podczas usuwania:', err);
      errorCount = allRemoveIds.length;
    }
    
    console.log(`✅ Zakończono: ${successCount} sukcesów, ${errorCount} błędów`);
  }
}

// Główna funkcja
async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--execute');
  
  try {
    if (dryRun) {
      console.log('🔍 Tryb symulacji - żadne zmiany nie zostaną zapisane');
      console.log('💡 Aby wykonać rzeczywiste zmiany, uruchom z flagą --execute');
    } else {
      console.log('⚠️ Tryb wykonania - duplikaty zostaną usunięte z bazy danych!');
    }
    
    // Pobierz dane
    const models = await getCarModels();
    
    // Analizuj duplikaty
    const analysis = analyzeDuplicates(models);
    
    // Wyświetl podsumowanie
    console.log('\n📊 Podsumowanie analizy:');
    console.log(`- Łączna liczba rekordów: ${analysis.totalRecords}`);
    console.log(`- Grupy duplikatów: ${analysis.duplicateGroups.length}`);
    console.log(`- Łączna liczba duplikatów: ${analysis.totalDuplicates}`);
    console.log(`- Rekordy do usunięcia: ${analysis.recordsToRemove}`);
    console.log(`- Rekordy do zachowania: ${analysis.totalRecords - analysis.recordsToRemove}`);
    
    // Usuń duplikaty
    await removeDuplicates(analysis, dryRun);
    
    // Zapisz raport
    const report = generateReport(analysis);
    const reportPath = path.join(process.cwd(), 'scripts', 'duplicates-removal-report.md');
    fs.writeFileSync(reportPath, report, 'utf8');
    console.log(`📄 Raport zapisany w: ${reportPath}`);
    
    if (dryRun) {
      console.log('\n✅ Symulacja zakończona pomyślnie!');
      console.log('💡 Aby wykonać rzeczywiste zmiany, uruchom: npx tsx scripts/remove-true-duplicates.ts --execute');
    } else {
      console.log('\n✅ Usuwanie duplikatów zakończone pomyślnie!');
    }
    
  } catch (error) {
    console.error('❌ Błąd podczas usuwania duplikatów:', error);
    process.exit(1);
  }
}

// Uruchom skrypt
if (require.main === module) {
  main();
}

export { analyzeDuplicates, removeDuplicates };
