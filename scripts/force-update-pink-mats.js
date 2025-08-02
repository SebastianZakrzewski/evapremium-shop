const { PrismaClient } = require('../src/generated/prisma/index.js');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function forceUpdatePinkMats() {
  try {
    console.log('Wymuszam aktualizację wszystkich dywaników z różowym obszyciem...\n');
    
    // Lista wszystkich kolorów dywaników z różowym obszyciem
    const matColors = [
      'beige', 'black', 'blue', 'brown', 'darkblue', 'darkgreen', 
      'darkgrey', 'ivory', 'lightbeige', 'lime', 'maroon', 
      'orange', 'pink', 'purple', 'red', 'white', 'yellow'
    ];
    
    let updatedCount = 0;
    let createdCount = 0;
    
    for (const matColor of matColors) {
      const expectedPath = `/images/konfigurator/dywaniki/klasyczne/romby/romby rozowe/5os-classic-diamonds-${matColor}-pink.webp`;
      const expectedSystemPath = path.join(__dirname, '../public', expectedPath);
      const fileExists = fs.existsSync(expectedSystemPath);
      
      if (!fileExists) {
        console.log(`❌ Brak pliku: ${matColor}-pink -> ${expectedPath}`);
        continue;
      }
      
      // Sprawdź czy rekord istnieje
      const existingMat = await prisma.mats.findFirst({
        where: {
          type: 'classic',
          cellType: 'diamonds',
          color: matColor,
          edgeColor: 'pink'
        }
      });
      
      if (existingMat) {
        // Aktualizuj istniejący rekord
        try {
          await prisma.mats.update({
            where: { id: existingMat.id },
            data: {
              image: expectedPath
            }
          });
          
          console.log(`✅ Zaktualizowano: ${matColor}-pink -> ${expectedPath}`);
          updatedCount++;
          
        } catch (error) {
          console.error(`❌ Błąd podczas aktualizacji ${matColor}-pink:`, error.message);
        }
      } else {
        // Utwórz nowy rekord
        try {
          await prisma.mats.create({
            data: {
              type: 'classic',
              cellType: 'diamonds',
              color: matColor,
              edgeColor: 'pink',
              image: expectedPath
            }
          });
          
          console.log(`✅ Utworzono: ${matColor}-pink -> ${expectedPath}`);
          createdCount++;
          
        } catch (error) {
          console.error(`❌ Błąd podczas tworzenia ${matColor}-pink:`, error.message);
        }
      }
    }
    
    console.log(`\n=== PODSUMOWANIE ===`);
    console.log(`Zaktualizowano: ${updatedCount} rekordów`);
    console.log(`Utworzono: ${createdCount} rekordów`);
    console.log(`Łącznie przetworzono: ${updatedCount + createdCount} rekordów`);
    
    // Sprawdź końcowy stan
    const finalPinkMats = await prisma.mats.findMany({
      where: {
        type: 'classic',
        cellType: 'diamonds',
        edgeColor: 'pink'
      },
      orderBy: {
        color: 'asc'
      }
    });
    
    console.log(`\nKońcowa liczba dywaników z różowym obszyciem: ${finalPinkMats.length}`);
    
    // Wyświetl wszystkie końcowe encje
    console.log('\n=== KOŃCOWE ENCJE Z RÓŻOWYM OBSZYCIM ===');
    for (const mat of finalPinkMats) {
      const imagePath = path.join(__dirname, '../public', mat.image);
      const fileExists = fs.existsSync(imagePath);
      const status = fileExists ? '✅' : '❌';
      console.log(`${status} ${mat.color}-${mat.edgeColor} -> ${mat.image}`);
    }
    
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
      console.log('\n✅ Wszystkie pliki z różowym obszyciem istnieją!');
    } else {
      console.log('\n❌ Niektóre pliki z różowym obszyciem nie istnieją');
    }
    
  } catch (error) {
    console.error('Błąd podczas aktualizacji:', error);
  } finally {
    await prisma.$disconnect();
  }
}

forceUpdatePinkMats(); 