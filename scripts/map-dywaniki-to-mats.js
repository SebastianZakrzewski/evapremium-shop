const fs = require('fs');
const path = require('path');

/**
 * Mapowanie plików dywaników na model MatsModel
 * Analizuje strukturę katalogów i nazwy plików aby wygenerować rekordy Mats
 */

// Model MatsModel (zgodny z carmat-mapping.ts)
const MatsModel = {
  id: 0,
  type: '',        // rodzaj dywanika (3d, classic)
  color: '',       // kolor dywanika
  cellType: '',    // struktura komórek (diamonds, honey)
  edgeColor: '',   // kolor obszycia
  image: ''        // ścieżka do zdjęcia
};

/**
 * Parsuje nazwę pliku i wyciąga informacje o dywaniku
 * Format: 5os-[typ]-[wzór]-[kolor]-[kolor_obramowania].webp
 */
function parseFileName(fileName) {
  const parts = fileName.replace('.webp', '').split('-');
  
  if (parts.length < 5) {
    console.log(`⚠️ Nieprawidłowy format nazwy: ${fileName}`);
    return null;
  }
  
  // parts[0] = "5os" (pomijamy)
  // parts[1] = typ (3d, classic)
  // parts[2] = wzór (diamonds, honey)
  // parts[3] = kolor materiału
  // parts[4] = kolor obramowania
  
  return {
    type: parts[1],
    cellType: parts[2],
    color: parts[3],
    edgeColor: parts[4]
  };
}

/**
 * Mapuje katalog na typ dywanika
 */
function mapDirectoryToType(dirPath) {
  if (dirPath.includes('3d')) return '3d';
  if (dirPath.includes('classic')) return 'classic';
  return 'unknown';
}

/**
 * Mapuje podkatalog na wzór komórek
 */
function mapSubdirectoryToCellType(subDir) {
  if (subDir.includes('diamonds')) return 'diamonds';
  if (subDir.includes('honey')) return 'honey';
  if (subDir.includes('honeycomb')) return 'honey';
  return 'unknown';
}

/**
 * Normalizuje nazwę koloru
 */
function normalizeColor(colorName) {
  const colorMap = {
    'darkgrey': 'darkgrey',
    'darkgreen': 'darkgreen', 
    'maroon': 'maroon',
    'red': 'red',
    'darkblue': 'darkblue',
    'lightbeige': 'lightbeige',
    'black': 'black',
    'brown': 'brown',
    'blue': 'blue',
    'ivory': 'ivory',
    'purple': 'purple',
    'white': 'white',
    'yellow': 'yellow',
    'orange': 'orange',
    'beige': 'beige',
    'pink': 'pink',
    'lime': 'lime',
    'green': 'green',
    'lightgrey': 'lightgrey'
  };
  
  return colorMap[colorName] || colorName;
}

/**
 * Główna funkcja mapowania
 */
async function mapDywanikiToMats() {
  const dywanikiPath = path.join(__dirname, '..', 'public', 'dywaniki');
  const matsRecords = [];
  let idCounter = 1;
  
  console.log('🔍 Rozpoczynam mapowanie plików dywaników...');
  console.log('📁 Katalog:', dywanikiPath);
  
  // Przejdź przez główne katalogi (3d, classic)
  const mainDirs = fs.readdirSync(dywanikiPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  console.log('📂 Główne katalogi:', mainDirs);
  
  for (const mainDir of mainDirs) {
    const mainDirPath = path.join(dywanikiPath, mainDir);
    const type = mapDirectoryToType(mainDir);
    
    console.log(`\n📁 Przetwarzam katalog: ${mainDir} (typ: ${type})`);
    
    // Przejdź przez podkatalogi (diamonds, honey)
    const subDirs = fs.readdirSync(mainDirPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    console.log(`  📂 Podkatalogi:`, subDirs);
    
    for (const subDir of subDirs) {
      const subDirPath = path.join(mainDirPath, subDir);
      const cellType = mapSubdirectoryToCellType(subDir);
      
      console.log(`    📁 Przetwarzam: ${subDir} (wzór: ${cellType})`);
      
      // Przejdź przez katalogi kolorów
      const colorDirs = fs.readdirSync(subDirPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      console.log(`      🎨 Kolory:`, colorDirs);
      
      for (const colorDir of colorDirs) {
        const colorDirPath = path.join(subDirPath, colorDir);
        
        // Przejdź przez pliki .webp
        const files = fs.readdirSync(colorDirPath)
          .filter(file => file.endsWith('.webp'));
        
        console.log(`        📄 Pliki w ${colorDir}: ${files.length}`);
        
        for (const file of files) {
          const filePath = path.join(colorDirPath, file);
          const relativePath = path.relative(path.join(__dirname, '..', 'public'), filePath)
            .replace(/\\/g, '/'); // Normalizuj ścieżki dla web
          
          // Parsuj nazwę pliku
          const parsed = parseFileName(file);
          
          if (parsed) {
            const matRecord = {
              id: idCounter++,
              type: type,
              color: normalizeColor(parsed.color),
              cellType: parsed.cellType,
              edgeColor: normalizeColor(parsed.edgeColor),
              image: `/${relativePath}`
            };
            
            matsRecords.push(matRecord);
            
            // Loguj co 50 rekordów
            if (matsRecords.length % 50 === 0) {
              console.log(`        ✅ Zmapowano ${matsRecords.length} rekordów...`);
            }
          }
        }
      }
    }
  }
  
  return matsRecords;
}

/**
 * Generuje statystyki mapowania
 */
function generateStats(matsRecords) {
  const stats = {
    total: matsRecords.length,
    byType: {},
    byCellType: {},
    byColor: {},
    byEdgeColor: {},
    uniqueCombinations: new Set()
  };
  
  matsRecords.forEach(record => {
    // Statystyki według typu
    stats.byType[record.type] = (stats.byType[record.type] || 0) + 1;
    
    // Statystyki według wzoru komórek
    stats.byCellType[record.cellType] = (stats.byCellType[record.cellType] || 0) + 1;
    
    // Statystyki według koloru materiału
    stats.byColor[record.color] = (stats.byColor[record.color] || 0) + 1;
    
    // Statystyki według koloru obramowania
    stats.byEdgeColor[record.edgeColor] = (stats.byEdgeColor[record.edgeColor] || 0) + 1;
    
    // Unikalne kombinacje
    const combination = `${record.type}-${record.cellType}-${record.color}-${record.edgeColor}`;
    stats.uniqueCombinations.add(combination);
  });
  
  return stats;
}

/**
 * Zapisuje wyniki do pliku
 */
function saveResults(matsRecords, stats) {
  const outputPath = path.join(__dirname, '..', 'mapped-dywaniki.json');
  
  const output = {
    metadata: {
      generatedAt: new Date().toISOString(),
      totalRecords: matsRecords.length,
      sourceDirectory: 'public/dywaniki'
    },
    statistics: stats,
    records: matsRecords
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n💾 Wyniki zapisane do: ${outputPath}`);
  
  return outputPath;
}

// Uruchom mapowanie
async function main() {
  try {
    console.log('🚀 Rozpoczynam mapowanie dywaników na model Mats...\n');
    
    const matsRecords = await mapDywanikiToMats();
    const stats = generateStats(matsRecords);
    const outputPath = saveResults(matsRecords, stats);
    
    console.log('\n📊 STATYSTYKI MAPOWANIA:');
    console.log('========================');
    console.log(`📈 Łączna liczba rekordów: ${stats.total}`);
    console.log(`🔢 Unikalne kombinacje: ${stats.uniqueCombinations.size}`);
    
    console.log('\n📋 Według typu dywanika:');
    Object.entries(stats.byType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} rekordów`);
    });
    
    console.log('\n🔷 Według wzoru komórek:');
    Object.entries(stats.byCellType).forEach(([cellType, count]) => {
      console.log(`  ${cellType}: ${count} rekordów`);
    });
    
    console.log('\n🎨 Według koloru materiału (top 10):');
    Object.entries(stats.byColor)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([color, count]) => {
        console.log(`  ${color}: ${count} rekordów`);
      });
    
    console.log('\n🔲 Według koloru obramowania (top 10):');
    Object.entries(stats.byEdgeColor)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([edgeColor, count]) => {
        console.log(`  ${edgeColor}: ${count} rekordów`);
      });
    
    console.log('\n✅ Mapowanie zakończone pomyślnie!');
    console.log(`📁 Plik wynikowy: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Błąd podczas mapowania:', error.message);
    process.exit(1);
  }
}

main();


