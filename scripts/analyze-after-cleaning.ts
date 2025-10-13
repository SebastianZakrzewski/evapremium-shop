import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://diqbnsinhsedmvvstvvc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  throw new Error('Missing Supabase key');
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface CarModel {
  id: number;
  brand_name: string;
  model_name: string;
  generation?: string;
  body_type?: string;
  year_from?: number;
  year_to?: number;
}

async function getAllCarModels(): Promise<CarModel[]> {
  const allRecords: CarModel[] = [];
  let offset = 0;
  const limit = 1000;
  
  while (true) {
    const { data, error } = await supabase
      .from('car_models_extended')
      .select('id, brand_name, model_name, generation, body_type, year_from, year_to')
      .range(offset, offset + limit - 1)
      .order('brand_name', { ascending: true })
      .order('model_name', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    if (!data || data.length === 0) break;
    
    allRecords.push(...data);
    
    if (data.length < limit) break;
    offset += limit;
  }
  
  return allRecords;
}

// Wzorce do wykrycia nadmiarowych informacji
const patterns = {
  // Warianty nadwozia
  bodyVariants: [
    /\b(Gran Coupe|Gran Turismo|Gran Tourismo|Gran Tourer|Active Tourer)\b/gi,
    /\b(Coupe|Cabriolet|Cabrio|Sedan|Touring|Hatchback|Kombi|Compact)\b/gi,
    /\b(Wagon|Van|SUV|Crossover|Pickup|Truck)\b/gi,
  ],
  
  // Konfiguracje i warianty
  configurations: [
    /\b(ławka|long|zwykla|zwykły|krótka|długa)\b/gi,
    /\bna [0-9] (fotele|miejsca|os\.)\b/gi,
    /\b[0-9]os\./gi,
    /\b(5-drzwiowy|3-drzwiowy)\b/gi,
  ],
  
  // Warianty silnika i paliwa
  engineVariants: [
    /\b(benzyna|diesel|hybryda|PHEV|MHEV|HEV|EV|elektryczny)\b/gi,
    /\b(4x4|AWD|FWD|RWD|HTRAC)\b/gi,
  ],
  
  // Pochodzenie
  origin: [
    /\b(USA|ANGLIK|Europa|Japonia)\b/gi,
  ],
  
  // Inne
  other: [
    /\b(Heavy Duty|Półtorej kabiny|Kamper|Camper)\b/gi,
    /\b(Sport|Limited|XL|XLT|Premium|Luxury)\b(?!back|wagon|van|line|age)/gi,
    /\b(generacj[ai]?|gen\.)\b/gi,
    /\+\s*$/gi, // samotny + na końcu
  ],
  
  // Kody generacji bez nawiasów (oprócz BMW/Audi które mogą mieć)
  generationCodesWithoutParens: [
    /\s+[EFGUWV][0-9]{2,3}\b(?!\))/g, // E90, F30, G20, W123, V8 itp.
  ],
  
  // Błędne kody BMW
  wrongBMWCodes: [
    /\bGt[0-9]+\b/gi,
  ],
};

async function analyzeAfterCleaning() {
  console.log('🔍 Pobieranie wszystkich rekordów po czyszczeniu...\n');
  
  const records = await getAllCarModels();
  console.log(`✅ Pobrano ${records.length} rekordów\n`);
  
  const issues: { [key: string]: CarModel[] } = {
    bodyVariants: [],
    configurations: [],
    engineVariants: [],
    origin: [],
    other: [],
    generationCodesWithoutParens: [],
    wrongBMWCodes: [],
    duplicates: [],
  };
  
  // Sprawdź każdy rekord
  for (const record of records) {
    const modelName = record.model_name;
    
    // Sprawdź warianty nadwozia
    if (patterns.bodyVariants.some(p => p.test(modelName))) {
      issues.bodyVariants.push(record);
    }
    
    // Sprawdź konfiguracje
    if (patterns.configurations.some(p => p.test(modelName))) {
      issues.configurations.push(record);
    }
    
    // Sprawdź warianty silnika
    if (patterns.engineVariants.some(p => p.test(modelName))) {
      issues.engineVariants.push(record);
    }
    
    // Sprawdź pochodzenie
    if (patterns.origin.some(p => p.test(modelName))) {
      issues.origin.push(record);
    }
    
    // Sprawdź inne
    if (patterns.other.some(p => p.test(modelName))) {
      issues.other.push(record);
    }
    
    // Sprawdź błędne kody BMW
    if (record.brand_name.toLowerCase() === 'bmw' && patterns.wrongBMWCodes.some(p => p.test(modelName))) {
      issues.wrongBMWCodes.push(record);
    }
    
    // Sprawdź kody generacji bez nawiasów (pomiń BMW i Audi które mogą mieć w nawiasach)
    if (!['bmw', 'audi', 'mercedes-benz'].includes(record.brand_name.toLowerCase())) {
      if (patterns.generationCodesWithoutParens.some(p => p.test(modelName))) {
        issues.generationCodesWithoutParens.push(record);
      }
    }
  }
  
  // Znajdź duplikaty
  const recordMap = new Map<string, CarModel[]>();
  for (const record of records) {
    const key = `${record.brand_name}|${record.model_name}|${record.generation || ''}|${record.body_type || ''}|${record.year_from || ''}|${record.year_to || ''}`;
    if (!recordMap.has(key)) {
      recordMap.set(key, []);
    }
    recordMap.get(key)!.push(record);
  }
  
  for (const [key, recs] of recordMap) {
    if (recs.length > 1) {
      issues.duplicates.push(...recs);
    }
  }
  
  // Generuj raport
  let report = '# Analiza rekordów po czyszczeniu\n\n';
  report += `**Data:** ${new Date().toLocaleString('pl-PL')}\n`;
  report += `**Łączna liczba rekordów:** ${records.length}\n\n`;
  
  report += '## Podsumowanie problemów\n\n';
  report += `| Kategoria | Liczba rekordów |\n`;
  report += `|-----------|----------------|\n`;
  report += `| Warianty nadwozia | ${issues.bodyVariants.length} |\n`;
  report += `| Konfiguracje (ławka, long, etc.) | ${issues.configurations.length} |\n`;
  report += `| Warianty silnika (benzyna, etc.) | ${issues.engineVariants.length} |\n`;
  report += `| Pochodzenie (USA, ANGLIK, etc.) | ${issues.origin.length} |\n`;
  report += `| Inne (Sport, XL, Heavy Duty, etc.) | ${issues.other.length} |\n`;
  report += `| Błędne kody BMW (Gt*) | ${issues.wrongBMWCodes.length} |\n`;
  report += `| Kody generacji bez nawiasów | ${issues.generationCodesWithoutParens.length} |\n`;
  report += `| Duplikaty | ${issues.duplicates.length / 2} grup |\n\n`;
  
  // Szczegóły dla każdej kategorii
  for (const [category, items] of Object.entries(issues)) {
    if (items.length === 0) continue;
    
    report += `## ${getCategoryName(category)} (${items.length} rekordów)\n\n`;
    
    const limit = category === 'duplicates' ? 50 : 30;
    items.slice(0, limit).forEach(item => {
      report += `- [ID: ${item.id}] **${item.brand_name}** - "${item.model_name}"`;
      if (item.year_from || item.year_to) {
        report += ` (${item.year_from || '?'}-${item.year_to || '?'})`;
      }
      report += '\n';
    });
    
    if (items.length > limit) {
      report += `\n... i ${items.length - limit} więcej\n`;
    }
    report += '\n';
  }
  
  // Przykłady sugerowanych zmian
  report += '## Sugerowane transformacje\n\n';
  
  if (issues.bodyVariants.length > 0) {
    report += '### Warianty nadwozia:\n';
    issues.bodyVariants.slice(0, 10).forEach(item => {
      const cleaned = item.model_name
        .replace(/\s*(Gran Coupe|Gran Turismo|Gran Tourismo|Gran Tourer|Active Tourer)/gi, '')
        .replace(/\s*(Coupe|Cabriolet|Cabrio|Sedan|Touring|Hatchback|Kombi|Compact)/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
      report += `- "${item.model_name}" → "${cleaned}"\n`;
    });
    report += '\n';
  }
  
  if (issues.configurations.length > 0) {
    report += '### Konfiguracje:\n';
    issues.configurations.slice(0, 10).forEach(item => {
      const cleaned = item.model_name
        .replace(/\s*(ławka|long|zwykla|zwykły|krótka|długa)/gi, '')
        .replace(/\s*na [0-9] (fotele|miejsca|os\.)/gi, '')
        .replace(/\s*[0-9]os\./gi, '')
        .replace(/\s+/g, ' ')
        .trim();
      report += `- "${item.model_name}" → "${cleaned}"\n`;
    });
    report += '\n';
  }
  
  if (issues.engineVariants.length > 0) {
    report += '### Warianty silnika:\n';
    issues.engineVariants.slice(0, 10).forEach(item => {
      const cleaned = item.model_name
        .replace(/\s*(benzyna|diesel|hybryda|PHEV|MHEV|HEV|EV|elektryczny)/gi, '')
        .replace(/\s*(4x4|AWD|FWD|RWD|HTRAC)/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
      report += `- "${item.model_name}" → "${cleaned}"\n`;
    });
    report += '\n';
  }
  
  // Zapisz raport
  const reportPath = 'scripts/post-cleaning-analysis.md';
  fs.writeFileSync(reportPath, report);
  
  console.log('📊 Podsumowanie problemów:');
  console.log(`   Warianty nadwozia: ${issues.bodyVariants.length}`);
  console.log(`   Konfiguracje: ${issues.configurations.length}`);
  console.log(`   Warianty silnika: ${issues.engineVariants.length}`);
  console.log(`   Pochodzenie: ${issues.origin.length}`);
  console.log(`   Inne: ${issues.other.length}`);
  console.log(`   Błędne kody BMW: ${issues.wrongBMWCodes.length}`);
  console.log(`   Kody generacji bez nawiasów: ${issues.generationCodesWithoutParens.length}`);
  console.log(`   Duplikaty: ${issues.duplicates.length / 2} grup\n`);
  
  console.log(`📄 Raport zapisany w: ${reportPath}`);
}

function getCategoryName(category: string): string {
  const names: { [key: string]: string } = {
    bodyVariants: 'Warianty nadwozia',
    configurations: 'Konfiguracje (ławka, long, etc.)',
    engineVariants: 'Warianty silnika (benzyna, diesel, etc.)',
    origin: 'Pochodzenie (USA, ANGLIK, etc.)',
    other: 'Inne (Sport, XL, Heavy Duty, etc.)',
    wrongBMWCodes: 'Błędne kody BMW (Gt*)',
    generationCodesWithoutParens: 'Kody generacji bez nawiasów',
    duplicates: 'Duplikaty',
  };
  return names[category] || category;
}

analyzeAfterCleaning().catch(console.error);
