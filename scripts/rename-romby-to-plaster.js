const { PrismaClient } = require('../src/generated/prisma/index.js');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Mapowanie starych nazw katalogów na nowe
const directoryMapping = {
  'romby bezowe obszycie': 'plaster bezowe obszycie',
  'romby bordowe obszycie': 'plaster bordowe obszycie', 
  'romby brazowe obszycie': 'plaster brazowe obszycie',
  'romby ciemnoszare obszycie': 'plaster ciemnoszare obszycie',
  'romby czerwone obszycie': 'plaster czerwone obszycie',
  'romby fioletowe obszycie': 'plaster fioletowe obszycie',
  'romby granatowe obszycie': 'plaster granatowe obszycie',
  'romby jasnoszare obszycie': 'plaster jasnoszare obszycie',
  'romby niebieskie obszycie': 'plaster niebieskie obszycie',
  'romby pomaranczowe obszycie': 'plaster pomaranczowe obszycie',
  'romby rozowe obszycie': 'plaster rozowe obszycie',
  'romby zielone obszycie': 'plaster zielone obszycie',
  'romby zolte obszycie': 'plaster zolte obszycie'
};

async function renameDirectoriesAndUpdateDatabase() {
  try {
    console.log('🔄 Rozpoczynam zmianę nazw katalogów i aktualizację bazy danych...');
    
    const basePath = path.join(__dirname, '../public/images/konfigurator/dywaniki/klasyczne');
    
    // Sprawdź które dywaniki mają cellType 'honey' (plaster miodu)
    const honeyMats = await prisma.mats.findMany({
      where: {
        cellType: 'honey'
      }
    });
    
    console.log(`📊 Znaleziono ${honeyMats.length} dywaników z teksturą plastra miodu (honey)`);
    
    let updatedCount = 0;
    let renamedDirectories = 0;
    
    // Przejdź przez mapowanie katalogów
    for (const [oldName, newName] of Object.entries(directoryMapping)) {
      const oldPath = path.join(basePath, oldName);
      const newPath = path.join(basePath, newName);
      
      // Sprawdź czy stary katalog istnieje
      if (fs.existsSync(oldPath)) {
        try {
          // Zmień nazwę katalogu
          fs.renameSync(oldPath, newPath);
          console.log(`✅ Zmieniono nazwę katalogu: ${oldName} → ${newName}`);
          renamedDirectories++;
          
          // Zaktualizuj ścieżki w bazie danych dla tego katalogu
          const oldImagePath = `/images/konfigurator/dywaniki/klasyczne/${oldName}`;
          const newImagePath = `/images/konfigurator/dywaniki/klasyczne/${newName}`;
          
          const updatedMats = await prisma.mats.updateMany({
            where: {
              image: {
                startsWith: oldImagePath
              }
            },
            data: {
              image: {
                set: prisma.mats.fields.image.replace(oldImagePath, newImagePath)
              }
            }
          });
          
          console.log(`📝 Zaktualizowano ${updatedMats.count} rekordów w bazie dla katalogu ${oldName}`);
          updatedCount += updatedMats.count;
          
        } catch (error) {
          console.error(`❌ Błąd podczas zmiany nazwy katalogu ${oldName}:`, error.message);
        }
      } else {
        console.log(`⚠️ Katalog nie istnieje: ${oldName}`);
      }
    }
    
    console.log(`\n📊 Podsumowanie:`);
    console.log(`- Zmieniono nazwy katalogów: ${renamedDirectories}`);
    console.log(`- Zaktualizowano rekordów w bazie: ${updatedCount}`);
    console.log(`- Dywaniki z teksturą plastra miodu: ${honeyMats.length}`);
    
    // Sprawdź czy wszystkie ścieżki zostały poprawnie zaktualizowane
    const allMats = await prisma.mats.findMany({
      where: {
        cellType: 'honey'
      },
      select: {
        id: true,
        image: true,
        color: true,
        edgeColor: true
      }
    });
    
    console.log(`\n🔍 Sprawdzenie zaktualizowanych ścieżek:`);
    allMats.forEach(mat => {
      if (mat.image.includes('romby')) {
        console.log(`⚠️ Niezaktualizowana ścieżka: ID ${mat.id} - ${mat.image}`);
      } else {
        console.log(`✅ Poprawna ścieżka: ID ${mat.id} - ${mat.image}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Błąd podczas wykonywania operacji:', error);
  } finally {
    await prisma.$disconnect();
  }
}

renameDirectoriesAndUpdateDatabase(); 