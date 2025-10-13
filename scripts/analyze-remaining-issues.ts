import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

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
  generation: string;
  body_type: string;
  year_from: number | null;
  year_to: number | null;
}

async function analyzeRemainingIssues() {
  console.log('🔍 Pobieranie wszystkich rekordów z tabeli...\n');
  
  // Pobierz wszystkie rekordy używając paginacji
  let allRecords: CarModel[] = [];
  let from = 0;
  const pageSize = 1000;
  let hasMore = true;
  
  while (hasMore) {
    const { data: records, error } = await supabase
      .from('car_models_extended')
      .select('*')
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1);
    
    if (error) {
      console.error('Błąd:', error);
      return;
    }
    
    if (records && records.length > 0) {
      allRecords = allRecords.concat(records);
      from += pageSize;
      hasMore = records.length === pageSize;
      console.log(`📥 Pobrano ${allRecords.length} rekordów...`);
    } else {
      hasMore = false;
    }
  }
  
  console.log(`✅ Pobrano łącznie ${allRecords.length} rekordów\n`);
  
  const issues: {
    category: string;
    examples: Array<{ id: number; brand: string; model: string; issue: string }>;
  }[] = [];
  
  // Wzorce do sprawdzenia
  const patterns = {
    'Liczba drzwi': /\d+\s*drzwi/gi,
    'Slash separatory': /\//g,
    'Nadmiarowe spacje': /\s{2,}/g,
    'Kody generacji bez nawiasów (nie-premium)': /\s+[A-Z]\d{1,3}\s*$/g,
    'Warianty "zwykła/zwykły"': /zwykł[aąy]/gi,
    'Warianty Long/Short': /\s+(long|short|krótki)\b/gi,
    'Warianty karoserii w środku': /\s+(sedan|kombi|wagon|van|suv|coupe|cabrio|hatchback)\s+/gi,
  };
  
  const foundIssues: Map<string, Array<CarModel>> = new Map();
  
  allRecords.forEach(record => {
    Object.entries(patterns).forEach(([patternName, pattern]) => {
      if (pattern.test(record.model_name)) {
        if (!foundIssues.has(patternName)) {
          foundIssues.set(patternName, []);
        }
        foundIssues.get(patternName)!.push(record);
      }
    });
  });
  
  // Wyświetl wyniki
  console.log('📊 Znalezione problemy:\n');
  
  let totalIssues = 0;
  foundIssues.forEach((records, patternName) => {
    console.log(`\n### ${patternName} (${records.length} rekordów):`);
    totalIssues += records.length;
    
    // Pokaż pierwsze 10 przykładów
    records.slice(0, 10).forEach(record => {
      console.log(`  - [ID: ${record.id}] ${record.brand_name} - "${record.model_name}"`);
    });
    
    if (records.length > 10) {
      console.log(`  ... i ${records.length - 10} więcej`);
    }
  });
  
  console.log(`\n\n📈 PODSUMOWANIE: Znaleziono ${totalIssues} rekordów z problemami w ${foundIssues.size} kategoriach\n`);
  
  // Zapisz szczegółowy raport
  let report = '# Analiza pozostałych problemów w model_name\n\n';
  report += `**Data:** ${new Date().toISOString()}\n`;
  report += `**Łączna liczba rekordów:** ${allRecords.length}\n`;
  report += `**Rekordy z problemami:** ${totalIssues}\n\n`;
  
  foundIssues.forEach((records, patternName) => {
    report += `## ${patternName} (${records.length} rekordów)\n\n`;
    
    records.forEach(record => {
      report += `- [ID: ${record.id}] **${record.brand_name}** - "${record.model_name}" (${record.year_from}-${record.year_to || '?'})\n`;
    });
    
    report += '\n';
  });
  
  fs.writeFileSync('scripts/remaining-issues-detailed.md', report);
  console.log('📄 Szczegółowy raport zapisany w: scripts/remaining-issues-detailed.md\n');
}

analyzeRemainingIssues().catch(console.error);

