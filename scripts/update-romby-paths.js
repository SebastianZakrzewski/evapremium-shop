const { PrismaClient } = require('../src/generated/prisma/index.js');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Mapowanie starych ścieżek na nowe katalogi
const pathMapping = {
  'czarne obszycie': 'czarne obszycie',
  'romby bezowe obszycie': 'romby bezowe',
  'romby beżowe obszycie': 'romby beżowe',
  'romby bordowe obszycie': 'romby bordowe',
  'romby brazowe obszycie': 'romby brazowe',
  'romby brązowe obszycie': 'romby brązowe',
  'romby ciemnoszare obszycie': 'romby ciemnoszare',
  'romby czerwne obszycie': 'romby czerwne',
  'romby fioletowe obszycie': 'rmby fioletowe',
  'romby granatowe obszycie': 'romby granatowe',
  'romby jasnoszare obszycie': 'romby jasnoszare',
  'romby niebieskie obszycie': 'romby niebieskie',
  'romby pomaranczowe obszycie': 'romby pomaranczowe',
  'romby pomarańczowe obszycie': 'romby pomarańczowe',
  'romby rozowe obszycie': 'romby rozowe',
  'romby zielone obszycie': 'romby zielone',
  'romby zolte obszycie': 'romby zolte',
  'romby żółte obszycie': 'romby żółte'
};

async function updateRombyPaths() {
  try {
    console.log('Rozpoczynam aktualizację ścieżek dla dywaników romby...\n');
    
    // Pobierz wszystkie dywaniki romby
    const diamondsMats = await prisma.mats.findMany({
      where: {
        type: 'classic',
        cellType: 'diamonds'
      },
      select: {
        id: true,
        color: true,
        edgeColor: true,
        image: true
      }
    });
    
    console.log(`Znaleziono ${diamondsMats.length} dywaników romby do sprawdzenia\n`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const mat of diamondsMats) {
      const currentPath = mat.image;
      
      // Sprawdź czy ścieżka wymaga aktualizacji
      const needsUpdate = !currentPath.includes('/romby/') || 
                         currentPath.includes('/czarne obszycie/') ||
                         currentPath.includes('/romby bezowe obszycie/') ||
                         currentPath.includes('/romby beżowe obszycie/') ||
                         currentPath.includes('/romby bordowe obszycie/') ||
                         currentPath.includes('/romby brazowe obszycie/') ||
                         currentPath.includes('/romby brązowe obszycie/') ||
                         currentPath.includes('/romby ciemnoszare obszycie/') ||
                         currentPath.includes('/romby czerwne obszycie/') ||
                         currentPath.includes('/romby fioletowe obszycie/') ||
                         currentPath.includes('/romby granatowe obszycie/') ||
                         currentPath.includes('/romby jasnoszare obszycie/') ||
                         currentPath.includes('/romby niebieskie obszycie/') ||
                         currentPath.includes('/romby pomaranczowe obszycie/') ||
                         currentPath.includes('/romby pomarańczowe obszycie/') ||
                         currentPath.includes('/romby rozowe obszycie/') ||
                         currentPath.includes('/romby zielone obszycie/') ||
                         currentPath.includes('/romby zolte obszycie/') ||
                         currentPath.includes('/romby żółte obszycie/');
      
      if (!needsUpdate) {
        console.log(`Pominięto: ${mat.color} ${mat.edgeColor} (już zaktualizowane)`);
        skippedCount++;
        continue;
      }
      
      // Wyciągnij nazwę pliku ze ścieżki
      const fileName = path.basename(currentPath);
      
      // Znajdź odpowiedni katalog na podstawie koloru obszycia
      let newFolder = '';
      switch (mat.edgeColor) {
        case 'black':
          newFolder = 'czarne obszycie';
          break;
        case 'beige':
          newFolder = 'romby bezowe';
          break;
        case 'maroon':
          newFolder = 'romby bordowe';
          break;
        case 'brown':
          newFolder = 'romby brazowe';
          break;
        case 'darkgrey':
          newFolder = 'romby ciemnoszare';
          break;
        case 'red':
          newFolder = 'romby czerwne';
          break;
        case 'purple':
          newFolder = 'rmby fioletowe';
          break;
        case 'darkblue':
          newFolder = 'romby granatowe';
          break;
        case 'lightgrey':
          newFolder = 'romby jasnoszare';
          break;
        case 'blue':
          newFolder = 'romby niebieskie';
          break;
        case 'orange':
          newFolder = 'romby pomaranczowe';
          break;
        case 'pink':
          newFolder = 'romby rozowe';
          break;
        case 'green':
          newFolder = 'romby zielone';
          break;
        case 'yellow':
          newFolder = 'romby zolte';
          break;
        default:
          console.log(`Nieznany kolor obszycia: ${mat.edgeColor}`);
          errorCount++;
          continue;
      }
      
      // Stwórz nową ścieżkę
      const newPath = `/images/konfigurator/dywaniki/klasyczne/romby/${newFolder}/${fileName}`;
      
      // Sprawdź czy plik istnieje
      const filePath = path.join(__dirname, '../public', newPath);
      if (!fs.existsSync(filePath)) {
        console.log(`Plik nie istnieje: ${newPath}`);
        errorCount++;
        continue;
      }
      
      // Zaktualizuj ścieżkę w bazie danych
      try {
        await prisma.mats.update({
          where: { id: mat.id },
          data: { image: newPath }
        });
        
        console.log(`Zaktualizowano: ${mat.color} ${mat.edgeColor} -> ${newPath}`);
        updatedCount++;
        
      } catch (error) {
        console.error(`Błąd podczas aktualizacji ${mat.id}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\nPodsumowanie:`);
    console.log(`- Zaktualizowano: ${updatedCount} dywaników`);
    console.log(`- Pominięto: ${skippedCount} dywaników (już zaktualizowane)`);
    console.log(`- Błędy: ${errorCount} dywaników`);
    console.log(`- Łącznie: ${updatedCount + skippedCount + errorCount} przetworzonych`);
    
  } catch (error) {
    console.error('Błąd podczas aktualizacji ścieżek:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateRombyPaths(); 