const { PrismaClient } = require('../src/generated/prisma/index.js');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Mapowanie katalogów na kolory obszycia
const folderToEdgeColorMapping = {
  'romby czarne': 'black',
  'romby bezowe': 'beige',
  'romby brazowe': 'brown',
  'romby bordowe': 'maroon',
  'romby ciemnoszare': 'darkgrey',
  'romby czerwone': 'red',
  'rmby fioletowe': 'purple',
  'romby granatowe': 'darkblue',
  'romby jasnoszare': 'lightgrey',
  'romby niebieskie': 'darkblue',
  'romby pomaranczowe': 'orange',
  'romby rozowe': 'pink',
  'romby zielone': 'green',
  'romby zolte': 'yellow'
};

async function updateAllRombyMats() {
  try {
    console.log('Rozpoczynam kompleksową aktualizację dywaników romby...\n');
    
    const basePath = path.join(__dirname, '../public/images/konfigurator/dywaniki/klasyczne/romby');
    
    let totalProcessed = 0;
    let totalUpdated = 0;
    let totalCreated = 0;
    let totalErrors = 0;
    
    // Przetwórz każdy katalog
    for (const [folderName, edgeColor] of Object.entries(folderToEdgeColorMapping)) {
      const folderPath = path.join(basePath, folderName);
      
      if (!fs.existsSync(folderPath)) {
        console.log(`Katalog nie istnieje: ${folderName}`);
        continue;
      }
      
      console.log(`\nPrzetwarzam katalog: ${folderName} (obszycie: ${edgeColor})`);
      
      const files = fs.readdirSync(folderPath);
      const webpFiles = files.filter(file => file.endsWith('.webp'));
      
      console.log(`Znaleziono ${webpFiles.length} plików .webp`);
      
      for (const filename of webpFiles) {
        totalProcessed++;
        
        // Wyciągnij kolor dywanika z nazwy pliku
        const colorMatch = filename.match(/5os-classic-diamonds-(\w+)-(\w+)\.webp/);
        if (!colorMatch) {
          console.log(`Nieprawidłowa nazwa pliku: ${filename}`);
          totalErrors++;
          continue;
        }
        
        const matColor = colorMatch[1];
        const fileEdgeColor = colorMatch[2];
        
        // Sprawdź czy kolor obszycia w nazwie pliku zgadza się z katalogiem
        if (fileEdgeColor !== edgeColor) {
          console.log(`Niezgodność kolorów: plik ${filename} ma obszycie ${fileEdgeColor}, ale katalog to ${edgeColor}`);
          totalErrors++;
          continue;
        }
        
        const imagePath = `/images/konfigurator/dywaniki/klasyczne/romby/${folderName}/${filename}`;
        
        try {
          // Sprawdź czy rekord już istnieje
          const existingMat = await prisma.mats.findFirst({
            where: {
              type: 'classic',
              cellType: 'diamonds',
              color: matColor,
              edgeColor: edgeColor
            }
          });
          
          if (existingMat) {
            // Zaktualizuj istniejący rekord
            await prisma.mats.update({
              where: { id: existingMat.id },
              data: { image: imagePath }
            });
            console.log(`Zaktualizowano: ${matColor}-${edgeColor} -> ${imagePath}`);
            totalUpdated++;
          } else {
            // Utwórz nowy rekord
            await prisma.mats.create({
              data: {
                type: 'classic',
                cellType: 'diamonds',
                color: matColor,
                edgeColor: edgeColor,
                image: imagePath
              }
            });
            console.log(`Utworzono nowy: ${matColor}-${edgeColor} -> ${imagePath}`);
            totalCreated++;
          }
          
        } catch (error) {
          console.error(`Błąd podczas przetwarzania ${filename}:`, error.message);
          totalErrors++;
        }
      }
    }
    
    console.log(`\n=== PODSUMOWANIE ===`);
    console.log(`Przetworzono plików: ${totalProcessed}`);
    console.log(`Zaktualizowano rekordów: ${totalUpdated}`);
    console.log(`Utworzono nowych rekordów: ${totalCreated}`);
    console.log(`Błędy: ${totalErrors}`);
    console.log(`Łącznie: ${totalUpdated + totalCreated} rekordów w bazie danych`);
    
  } catch (error) {
    console.error('Błąd podczas aktualizacji:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAllRombyMats(); 