const { PrismaClient } = require('../src/generated/prisma/index.js');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function checkAllRombyPaths() {
  try {
    console.log('Sprawdzam wszystkie ścieżki dywaników romby...\n');
    
    // Pobierz wszystkie dywaniki romby
    const diamondsMats = await prisma.mats.findMany({
      where: {
        type: 'classic',
        cellType: 'diamonds'
      },
      orderBy: [
        { color: 'asc' },
        { edgeColor: 'asc' }
      ]
    });
    
    console.log(`Znaleziono ${diamondsMats.length} dywaników romby\n`);
    
    const incorrectPaths = [];
    const correctPaths = [];
    
    for (const mat of diamondsMats) {
      const imagePath = mat.image;
      
      // Sprawdź czy ścieżka wskazuje na nowy katalog romby
      if (imagePath.includes('/romby/')) {
        correctPaths.push(mat);
      } else {
        incorrectPaths.push(mat);
      }
    }
    
    console.log(`=== PODSUMOWANIE ===`);
    console.log(`Poprawne ścieżki: ${correctPaths.length}`);
    console.log(`Niepoprawne ścieżki: ${incorrectPaths.length}`);
    
    if (incorrectPaths.length > 0) {
      console.log(`\n=== NIEPOPRAWNE ŚCIEŻKI (wymagają aktualizacji) ===`);
      for (const mat of incorrectPaths) {
        console.log(`${mat.color}-${mat.edgeColor} -> ${mat.image}`);
      }
    }
    
    // Sprawdź szczególnie problematyczne kombinacje
    console.log(`\n=== SZCZEGÓŁOWA ANALIZA ===`);
    
    // Sprawdź różowe obszycie z ciemnoszarym kolorem dywanika
    const pinkDarkgreyMat = diamondsMats.find(mat => 
      mat.edgeColor === 'pink' && mat.color === 'darkgrey'
    );
    
    if (pinkDarkgreyMat) {
      console.log(`\nRóżowe obszycie + ciemnoszary kolor:`);
      console.log(`Ścieżka: ${pinkDarkgreyMat.image}`);
      const isCorrect = pinkDarkgreyMat.image.includes('/romby/romby rozowe/');
      console.log(`Poprawna: ${isCorrect ? '✅ TAK' : '❌ NIE'}`);
    }
    
    // Sprawdź inne problematyczne kombinacje
    const problematicCombinations = [
      { color: 'darkgrey', edgeColor: 'pink' },
      { color: 'white', edgeColor: 'pink' },
      { color: 'black', edgeColor: 'pink' },
      { color: 'blue', edgeColor: 'pink' },
      { color: 'red', edgeColor: 'pink' }
    ];
    
    console.log(`\n=== SPRAWDZENIE PROBLEMATYCZNYCH KOMBINACJI ===`);
    for (const combo of problematicCombinations) {
      const mat = diamondsMats.find(m => 
        m.color === combo.color && m.edgeColor === combo.edgeColor
      );
      
      if (mat) {
        const isCorrect = mat.image.includes('/romby/');
        const status = isCorrect ? '✅' : '❌';
        console.log(`${status} ${combo.color}-${combo.edgeColor} -> ${mat.image}`);
      } else {
        console.log(`❓ ${combo.color}-${combo.edgeColor} -> BRAK REKORDU`);
      }
    }
    
  } catch (error) {
    console.error('Błąd podczas sprawdzania:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllRombyPaths(); 