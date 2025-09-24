const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Mapowanie katalogów na typy mat
const MAT_TYPE_MAPPING = {
  '3d': '3d',
  'classic': 'classic'
};

// Mapowanie struktur komórek
const CELL_STRUCTURE_MAPPING = {
  'diamonds': 'diamonds',
  'honey': 'honey',
  'honeycomb': 'honeycomb'
};

// Mapowanie kolorów
const COLOR_MAPPING = {
  'beige': 'beige',
  'black': 'black',
  'blue': 'blue',
  'brown': 'brown',
  'darkblue': 'darkblue',
  'darkgrey': 'darkgrey',
  'green': 'green',
  'lightgrey': 'lightgrey',
  'maroon': 'maroon',
  'orange': 'orange',
  'pink': 'pink',
  'purple': 'purple',
  'red': 'red',
  'white': 'white',
  'yellow': 'yellow',
  'ivory': 'ivory',
  'lightbeige': 'lightbeige',
  'lime': 'lime'
};

function parseFileName(filename) {
  // Przykład: 5os-3d-diamonds-black-black.webp
  const parts = filename.replace('.webp', '').split('-');
  
  if (parts.length >= 5) {
    return {
      matType: parts[1], // 3d
      cellStructure: parts[2], // diamonds
      materialColor: parts[3], // black
      borderColor: parts[4] // black
    };
  }
  
  return null;
}

function scanDywanikiDirectory() {
  const dywanikiPath = path.join(__dirname, '..', 'public', 'dywaniki');
  const records = [];
  
  console.log('🔍 Skanuję katalog dywaniki...');
  
  // Skanuj 3d
  const threeDPath = path.join(dywanikiPath, '3d');
  if (fs.existsSync(threeDPath)) {
    scanDirectory(threeDPath, '3d', records);
  }
  
  // Skanuj classic
  const classicPath = path.join(dywanikiPath, 'classic');
  if (fs.existsSync(classicPath)) {
    scanDirectory(classicPath, 'classic', records);
  }
  
  return records;
}

function scanDirectory(dirPath, matType, records) {
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      // To jest katalog struktury (diamonds, honey, etc.)
      const cellStructure = item;
      scanColorDirectories(itemPath, matType, cellStructure, records);
    }
  }
}

function scanColorDirectories(dirPath, matType, cellStructure, records) {
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      // To jest katalog koloru
      const materialColor = item;
      scanFiles(itemPath, matType, cellStructure, materialColor, records);
    }
  }
}

function scanFiles(dirPath, matType, cellStructure, materialColor, records) {
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    if (file.endsWith('.webp')) {
      const filePath = path.join(dirPath, file);
      const relativePath = filePath.replace(path.join(__dirname, '..', 'public'), '');
      
      // Parsuj nazwę pliku
      const parsed = parseFileName(file);
      
      if (parsed) {
        records.push({
          matType: parsed.matType,
          materialColor: parsed.materialColor,
          cellStructure: parsed.cellStructure,
          borderColor: parsed.borderColor,
          imagePath: relativePath.replace(/\\/g, '/') // Zamień backslashe na forward slashe
        });
      }
    }
  }
}

async function clearExistingData() {
  console.log('🧹 Czyszczę istniejące dane...');
  
  try {
    const { error } = await supabase
      .from('Mats')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Usuń wszystkie rekordy
    
    if (error) throw error;
    console.log('✅ Dane wyczyszczone');
  } catch (error) {
    console.error('❌ Błąd przy czyszczeniu:', error.message);
    throw error;
  }
}

async function insertRecords(records) {
  console.log(`🌱 Wstawiam ${records.length} rekordów...`);
  
  const batchSize = 100;
  let inserted = 0;
  
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    
    try {
      const { data, error } = await supabase
        .from('Mats')
        .insert(batch)
        .select();
      
      if (error) throw error;
      
      inserted += data.length;
      console.log(`✅ Wstawiono ${inserted}/${records.length} rekordów`);
    } catch (error) {
      console.error(`❌ Błąd przy wstawianiu batch ${i}-${i + batchSize}:`, error.message);
      throw error;
    }
  }
  
  console.log(`🎉 Wstawiono łącznie ${inserted} rekordów`);
}

async function verifyData() {
  console.log('🔍 Weryfikuję dane...');
  
  try {
    const { data, error, count } = await supabase
      .from('Mats')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    
    console.log(`📊 Łączna liczba rekordów w tabeli Mats: ${count}`);
    
    // Pokaż przykładowe rekordy
    const { data: sampleData, error: sampleError } = await supabase
      .from('Mats')
      .select('*')
      .limit(3);
    
    if (!sampleError && sampleData.length > 0) {
      console.log('📝 Przykładowe rekordy:');
      sampleData.forEach((record, index) => {
        console.log(`  ${index + 1}. ${record.matType} - ${record.materialColor} (${record.cellStructure}) - ${record.borderColor}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Błąd przy weryfikacji:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Rozpoczynam seedowanie dywaników do tabeli Mats...');
  console.log(`Supabase URL: ${supabaseUrl}`);
  
  try {
    // Skanuj katalog dywaniki
    const records = scanDywanikiDirectory();
    console.log(`📁 Znaleziono ${records.length} plików dywaników`);
    
    if (records.length === 0) {
      console.log('❌ Nie znaleziono żadnych plików dywaników');
      return;
    }
    
    // Wyczyść istniejące dane
    await clearExistingData();
    
    // Wstaw nowe dane
    await insertRecords(records);
    
    // Weryfikuj dane
    await verifyData();
    
    console.log('🎉 Seedowanie zakończone pomyślnie!');
    
  } catch (error) {
    console.error('💥 Seedowanie nieudane:', error.message);
    process.exit(1);
  }
}

main();
