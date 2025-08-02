const { PrismaClient } = require('../src/generated/prisma/index.js');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Mapowanie nazw katalogów na kolory obszycia dla rombów
const edgeColorMapping = {
  'czarne obszycie': 'black',
  'romby bezowe': 'beige',
  'romby beżowe': 'beige',
  'romby bordowe': 'maroon',
  'romby brazowe': 'brown',
  'romby brązowe': 'brown',
  'romby ciemnoszare': 'darkgrey',
  'romby czerwne': 'red',
  'rmby fioletowe': 'purple',
  'romby fioletowe': 'purple',
  'romby granatowe': 'darkblue',
  'romby jasnoszare': 'lightgrey',
  'romby niebieskie': 'blue',
  'romby pomaranczowe': 'orange',
  'romby pomarańczowe': 'orange',
  'romby rozowe': 'pink',
  'romby zielone': 'green',
  'romby zolte': 'yellow',
  'romby żółte': 'yellow'
};

// Mapowanie nazw kolorów z plików na kolory w bazie
const colorMapping = {
  'black': 'black',
  'blue': 'blue',
  'brown': 'brown',
  'darkblue': 'darkblue',
  'darkgreen': 'darkgreen',
  'darkgrey': 'darkgrey',
  'ivory': 'ivory',
  'lightbeige': 'lightbeige',
  'lime': 'lime',
  'maroon': 'maroon',
  'orange': 'orange',
  'pink': 'pink',
  'purple': 'purple',
  'red': 'red',
  'white': 'white',
  'yellow': 'yellow',
  'beige': 'beige'
};

async function seedRombyMats() {
  try {
    console.log('Rozpoczynam dodawanie dywaników romby (diamonds)...');
    
    const basePath = path.join(__dirname, '../public/images/konfigurator/dywaniki/klasyczne/romby');
    
    // Sprawdź które dywaniki już istnieją
    const existingMats = await prisma.mats.findMany({
      where: {
        type: 'classic',
        cellType: 'diamonds'
      },
      select: {
        color: true,
        cellType: true,
        edgeColor: true
      }
    });
    
    console.log(`Znaleziono ${existingMats.length} istniejących dywaników romby`);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    // Przejdź przez wszystkie katalogi
    for (const [folderName, edgeColor] of Object.entries(edgeColorMapping)) {
      const folderPath = path.join(basePath, folderName);
      
      if (!fs.existsSync(folderPath)) {
        console.log(`Katalog nie istnieje: ${folderName}`);
        continue;
      }
      
      const files = fs.readdirSync(folderPath);
      
      for (const file of files) {
        if (!file.endsWith('.webp')) continue;
        
        // Parsuj nazwę pliku: 5os-classic-diamonds-red-beige.webp
        const parts = file.replace('.webp', '').split('-');
        if (parts.length < 5) continue;
        
        const cellType = parts[2]; // diamonds
        const color = parts[3]; // kolor dywanika
        const fileEdgeColor = parts[4]; // kolor obszycia z nazwy pliku
        
        // Sprawdź czy już istnieje
        const exists = existingMats.some(mat => 
          mat.color === colorMapping[color] && 
          mat.cellType === cellType && 
          mat.edgeColor === edgeColor
        );
        
        if (exists) {
          console.log(`Pominięto: ${color} ${cellType} ${edgeColor} (już istnieje)`);
          skippedCount++;
          continue;
        }
        
        // Dodaj nowy dywanik
        try {
          await prisma.mats.create({
            data: {
              type: 'classic',
              color: colorMapping[color] || color,
              cellType: cellType,
              edgeColor: edgeColor,
              image: `/images/konfigurator/dywaniki/klasyczne/romby/${folderName}/${file}`
            }
          });
          
          console.log(`Dodano: ${color} ${cellType} ${edgeColor}`);
          addedCount++;
          
        } catch (error) {
          console.error(`Błąd podczas dodawania ${file}:`, error.message);
        }
      }
    }
    
    console.log(`\nPodsumowanie:`);
    console.log(`- Dodano: ${addedCount} dywaników romby`);
    console.log(`- Pominięto: ${skippedCount} dywaników (już istnieją)`);
    console.log(`- Łącznie: ${addedCount + skippedCount} przetworzonych`);
    
  } catch (error) {
    console.error('Błąd podczas dodawania dywaników romby:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedRombyMats(); 