const { PrismaClient } = require('../src/generated/prisma/index.js');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Poprawione mapowanie katalogów na kolory obszycia
const folderToEdgeColorMapping = {
  'romby czarne': 'black',
  'romby bezowe': 'beige',
  'romby brazowe': 'brown',
  'romby bordowe': 'maroon',
  'romby ciemnoszare': 'darkgrey',
  'romby czerwone': 'red',
  'rmby fioletowe': 'purple',
  'romby granatowe': 'blue', // Poprawione z darkblue na blue
  'romby jasnoszare': 'lightgrey',
  'romby niebieskie': 'darkblue',
  'romby pomaranczowe': 'orange',
  'romby rozowe': 'pink',
  'romby zielone': 'green',
  'romby zolte': 'yellow'
};

async function fixRemainingRomby() {
  try {
    console.log('Naprawiam pozostałe problemy z dywanikami romby...\n');
    
    const basePath = path.join(__dirname, '../public/images/konfigurator/dywaniki/klasyczne/romby');
    
    let totalProcessed = 0;
    let totalUpdated = 0;
    let totalErrors = 0;
    
    // Przetwórz tylko problematyczne katalogi
    const problematicFolders = ['romby granatowe'];
    
    for (const folderName of problematicFolders) {
      const edgeColor = folderToEdgeColorMapping[folderName];
      const folderPath = path.join(basePath, folderName);
      
      if (!fs.existsSync(folderPath)) {
        console.log(`Katalog nie istnieje: ${folderName}`);
        continue;
      }
      
      console.log(`\nNaprawiam katalog: ${folderName} (obszycie: ${edgeColor})`);
      
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
            totalUpdated++;
          }
          
        } catch (error) {
          console.error(`Błąd podczas przetwarzania ${filename}:`, error.message);
          totalErrors++;
        }
      }
    }
    
    console.log(`\n=== PODSUMOWANIE ===`);
    console.log(`Przetworzono plików: ${totalProcessed}`);
    console.log(`Zaktualizowano/utworzono rekordów: ${totalUpdated}`);
    console.log(`Błędy: ${totalErrors}`);
    
  } catch (error) {
    console.error('Błąd podczas naprawy:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixRemainingRomby(); 