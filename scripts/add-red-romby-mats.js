const { PrismaClient } = require('../src/generated/prisma/index.js');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function addRedRombyMats() {
  try {
    console.log('Dodaję brakujące dywaniki z czerwonym obszyciem...\n');
    
    const basePath = path.join(__dirname, '../public/images/konfigurator/dywaniki/klasyczne/romby/romby czerwone');
    
    if (!fs.existsSync(basePath)) {
      console.log('Katalog romby czerwone nie istnieje!');
      return;
    }
    
    const files = fs.readdirSync(basePath);
    const webpFiles = files.filter(file => file.endsWith('.webp'));
    
    console.log(`Znaleziono ${webpFiles.length} plików w katalogu romby czerwone\n`);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const filename of webpFiles) {
      const colorMatch = filename.match(/5os-classic-diamonds-(\w+)-(\w+)\.webp/);
      if (!colorMatch) {
        console.log(`Nieprawidłowa nazwa pliku: ${filename}`);
        continue;
      }
      
      const matColor = colorMatch[1];
      const fileEdgeColor = colorMatch[2];
      
      if (fileEdgeColor !== 'red') {
        console.log(`Niezgodność: ${filename} - plik ma ${fileEdgeColor}, oczekiwano red`);
        continue;
      }
      
      const imagePath = `/images/konfigurator/dywaniki/klasyczne/romby/romby czerwone/${filename}`;
      
      // Sprawdź czy rekord już istnieje
      const existingMat = await prisma.mats.findFirst({
        where: {
          type: 'classic',
          cellType: 'diamonds',
          color: matColor,
          edgeColor: 'red'
        }
      });
      
      if (existingMat) {
        console.log(`Pominięto: ${matColor}-red (już istnieje)`);
        skippedCount++;
        continue;
      }
      
      try {
        await prisma.mats.create({
          data: {
            type: 'classic',
            cellType: 'diamonds',
            color: matColor,
            edgeColor: 'red',
            image: imagePath
          }
        });
        
        console.log(`Dodano: ${matColor}-red -> ${filename}`);
        addedCount++;
        
      } catch (error) {
        console.error(`Błąd podczas dodawania ${matColor}-red:`, error.message);
      }
    }
    
    console.log(`\n=== PODSUMOWANIE ===`);
    console.log(`Dodano: ${addedCount} rekordów`);
    console.log(`Pominięto: ${skippedCount} rekordów (już istnieją)`);
    
    // Sprawdź końcowy stan
    const redMats = await prisma.mats.findMany({
      where: {
        type: 'classic',
        cellType: 'diamonds',
        edgeColor: 'red'
      }
    });
    
    console.log(`\nŁączna liczba dywaników z czerwonym obszyciem: ${redMats.length}`);
    
  } catch (error) {
    console.error('Błąd podczas dodawania:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addRedRombyMats(); 