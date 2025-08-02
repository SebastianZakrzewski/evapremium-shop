const { PrismaClient } = require('../src/generated/prisma/index.js');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function checkAndUpdatePinkMats() {
  try {
    console.log('Sprawdzam i aktualizuję dywaniki z różowym obszyciem...\n');
    
    // Znajdź wszystkie rekordy z różowym obszyciem
    const pinkMats = await prisma.mats.findMany({
      where: {
        type: 'classic',
        cellType: 'diamonds',
        edgeColor: 'pink'
      },
      orderBy: {
        color: 'asc'
      }
    });
    
    console.log(`Znaleziono ${pinkMats.length} dywaników z różowym obszyciem:\n`);
    
    let updatedCount = 0;
    let correctCount = 0;
    
    for (const mat of pinkMats) {
      const expectedPath = `/images/konfigurator/dywaniki/klasyczne/romby/romby rozowe/5os-classic-diamonds-${mat.color}-pink.webp`;
      const expectedSystemPath = path.join(__dirname, '../public', expectedPath);
      const fileExists = fs.existsSync(expectedSystemPath);
      
      if (mat.image !== expectedPath) {
        if (fileExists) {
          try {
            await prisma.mats.update({
              where: { id: mat.id },
              data: {
                image: expectedPath
              }
            });
            
            console.log(`✅ Zaktualizowano: ${mat.color}-pink -> ${expectedPath}`);
            updatedCount++;
          } catch (error) {
            console.error(`❌ Błąd podczas aktualizacji ${mat.color}-pink:`, error.message);
          }
        } else {
          console.log(`❌ Brak pliku: ${mat.color}-pink -> ${expectedPath}`);
        }
      } else {
        console.log(`✅ Poprawna: ${mat.color}-pink -> ${mat.image}`);
        correctCount++;
      }
    }
    
    console.log(`\n=== PODSUMOWANIE ===`);
    console.log(`Zaktualizowano: ${updatedCount} rekordów`);
    console.log(`Poprawnych: ${correctCount} rekordów`);
    console.log(`Łącznie: ${pinkMats.length} rekordów`);
    
    // Sprawdź końcowy stan
    const finalPinkMats = await prisma.mats.findMany({
      where: {
        type: 'classic',
        cellType: 'diamonds',
        edgeColor: 'pink'
      }
    });
    
    console.log(`\nKońcowa liczba dywaników z różowym obszyciem: ${finalPinkMats.length}`);
    
    // Sprawdź czy wszystkie pliki istnieją
    let allFilesExist = true;
    for (const mat of finalPinkMats) {
      const imagePath = path.join(__dirname, '../public', mat.image);
      if (!fs.existsSync(imagePath)) {
        console.log(`❌ Brak pliku: ${mat.image}`);
        allFilesExist = false;
      }
    }
    
    if (allFilesExist) {
      console.log('✅ Wszystkie pliki z różowym obszyciem istnieją!');
    } else {
      console.log('❌ Niektóre pliki z różowym obszyciem nie istnieją');
    }
    
  } catch (error) {
    console.error('Błąd podczas sprawdzania:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndUpdatePinkMats(); 