const { PrismaClient } = require('../src/generated/prisma/index.js');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Mapowanie nazw katalogów na kolory obszycia
const edgeColorMapping = {
  'czarne obszycie': 'black',
  'romby bezowe obszycie': 'beige',
  'romby bordowe obszycie': 'maroon',
  'romby brazowe obszycie': 'brown',
  'romby ciemnoszare obszycie': 'darkgrey',
  'romby czerwone obszycie': 'red',
  'romby fioletowe obszycie': 'purple',
  'romby granatowe obszycie': 'darkblue',
  'romby jasnoszare obszycie': 'lightgrey',
  'romby niebieskie obszycie': 'blue',
  'romby pomaranczowe obszycie': 'orange',
  'romby rozowe obszycie': 'pink',
  'romby zielone obszycie': 'green',
  'romby zolte obszycie': 'yellow'
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
  'yellow': 'yellow'
};

async function seedClassicMats() {
  try {
    console.log('Rozpoczynam dodawanie dywaników klasycznych...');
    
    const basePath = path.join(__dirname, '../public/images/konfigurator/dywaniki/klasyczne');
    
    // Sprawdź które dywaniki już istnieją
    const existingMats = await prisma.mats.findMany({
      where: {
        type: 'classic'
      },
      select: {
        color: true,
        cellType: true,
        edgeColor: true
      }
    });
    
    console.log(`Znaleziono ${existingMats.length} istniejących dywaników klasycznych`);
    
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
        
        // Parsuj nazwę pliku: 5os-classic-honey-red-beige.webp
        const parts = file.replace('.webp', '').split('-');
        if (parts.length < 5) continue;
        
        const cellType = parts[2]; // honey lub diamonds
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
              image: `/images/konfigurator/dywaniki/klasyczne/${folderName}/${file}`
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
    console.log(`- Dodano: ${addedCount} dywaników`);
    console.log(`- Pominięto: ${skippedCount} dywaników (już istnieją)`);
    console.log(`- Łącznie: ${addedCount + skippedCount} przetworzonych`);
    
  } catch (error) {
    console.error('Błąd podczas dodawania dywaników:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedClassicMats(); 