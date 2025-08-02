const { PrismaClient } = require('../src/generated/prisma/index.js');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function checkAllDarkgreyMats() {
  try {
    console.log('Sprawdzam wszystkie dywaniki z ciemnoszarym obszyciem...\n');
    
    // Znajdź wszystkie rekordy z ciemnoszarym obszyciem
    const darkgreyMats = await prisma.mats.findMany({
      where: {
        type: 'classic',
        cellType: 'diamonds',
        edgeColor: 'darkgrey'
      },
      orderBy: {
        color: 'asc'
      }
    });
    
    console.log(`Znaleziono ${darkgreyMats.length} dywaników z ciemnoszarym obszyciem:\n`);
    
    let allFilesExist = true;
    
    for (const mat of darkgreyMats) {
      const imagePath = path.join(__dirname, '../public', mat.image);
      const fileExists = fs.existsSync(imagePath);
      
      const status = fileExists ? '✅' : '❌';
      console.log(`${status} ${mat.color}-${mat.edgeColor} -> ${mat.image}`);
      
      if (!fileExists) {
        allFilesExist = false;
      }
    }
    
    console.log(`\n=== PODSUMOWANIE ===`);
    console.log(`Wszystkie pliki istnieją: ${allFilesExist ? '✅ TAK' : '❌ NIE'}`);
    
    if (allFilesExist) {
      console.log('✅ Wszystkie encje z ciemnoszarym obszyciem są poprawnie skonfigurowane!');
    } else {
      console.log('❌ Niektóre pliki nie istnieją - wymagana aktualizacja');
    }
    
    // Sprawdź szczególnie white-darkgrey
    const whiteDarkgrey = darkgreyMats.find(mat => mat.color === 'white');
    if (whiteDarkgrey) {
      console.log(`\n=== SZCZEGÓŁY WHITE-DARKGREY ===`);
      console.log(`ID: ${whiteDarkgrey.id}`);
      console.log(`Ścieżka: ${whiteDarkgrey.image}`);
      
      const whiteDarkgreyPath = path.join(__dirname, '../public', whiteDarkgrey.image);
      const whiteDarkgreyExists = fs.existsSync(whiteDarkgreyPath);
      console.log(`Plik istnieje: ${whiteDarkgreyExists ? '✅ TAK' : '❌ NIE'}`);
      
      if (whiteDarkgreyExists) {
        const stats = fs.statSync(whiteDarkgreyPath);
        console.log(`Rozmiar: ${stats.size} bajtów`);
      }
    }
    
  } catch (error) {
    console.error('Błąd podczas sprawdzania:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllDarkgreyMats(); 