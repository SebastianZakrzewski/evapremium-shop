const { PrismaClient } = require('../src/generated/prisma/index.js');

const prisma = new PrismaClient();

async function finalCheckPaths() {
  try {
    console.log('Finalne sprawdzenie ścieżek dla dywaników romby...\n');
    
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
    
    console.log(`Znaleziono ${diamondsMats.length} dywaników romby\n`);
    
    // Sprawdź czy wszystkie ścieżki wskazują na katalog romby
    let correctPaths = 0;
    let incorrectPaths = 0;
    const incorrectPathsList = [];
    
    diamondsMats.forEach(mat => {
      const path = mat.image;
      
      // Sprawdź czy ścieżka zawiera '/romby/'
      if (path.includes('/romby/')) {
        correctPaths++;
      } else {
        incorrectPaths++;
        incorrectPathsList.push({
          id: mat.id,
          color: mat.color,
          edgeColor: mat.edgeColor,
          path: path
        });
      }
    });
    
    console.log(`✅ Poprawne ścieżki: ${correctPaths}`);
    console.log(`❌ Niepoprawne ścieżki: ${incorrectPaths}`);
    
    if (incorrectPaths > 0) {
      console.log('\nNiepoprawne ścieżki:');
      incorrectPathsList.forEach(item => {
        console.log(`ID: ${item.id}, Kolor: ${item.color}, Obszycie: ${item.edgeColor}`);
        console.log(`Ścieżka: ${item.path}\n`);
      });
    } else {
      console.log('\n🎉 Wszystkie ścieżki są poprawnie zaktualizowane!');
    }
    
    // Sprawdź czy wszystkie pliki istnieją
    const fs = require('fs');
    const path = require('path');
    
    console.log('\nSprawdzanie istnienia plików...');
    let existingFiles = 0;
    let missingFiles = 0;
    const missingFilesList = [];
    
    for (const mat of diamondsMats) {
      const filePath = path.join(__dirname, '../public', mat.image);
      if (fs.existsSync(filePath)) {
        existingFiles++;
      } else {
        missingFiles++;
        missingFilesList.push({
          id: mat.id,
          color: mat.color,
          edgeColor: mat.edgeColor,
          path: mat.image
        });
      }
    }
    
    console.log(`✅ Istniejące pliki: ${existingFiles}`);
    console.log(`❌ Brakujące pliki: ${missingFiles}`);
    
    if (missingFiles > 0) {
      console.log('\nBrakujące pliki:');
      missingFilesList.forEach(item => {
        console.log(`ID: ${item.id}, Kolor: ${item.color}, Obszycie: ${item.edgeColor}`);
        console.log(`Ścieżka: ${item.path}\n`);
      });
    } else {
      console.log('\n🎉 Wszystkie pliki istnieją!');
    }
    
  } catch (error) {
    console.error('Błąd podczas finalnego sprawdzenia:', error);
  } finally {
    await prisma.$disconnect();
  }
}

finalCheckPaths(); 