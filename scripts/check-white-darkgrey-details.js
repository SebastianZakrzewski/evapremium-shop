const { PrismaClient } = require('../src/generated/prisma/index.js');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function checkWhiteDarkgreyDetails() {
  try {
    console.log('Sprawdzam szczegóły encji white-darkgrey...\n');
    
    // Znajdź rekord
    const mat = await prisma.mats.findFirst({
      where: {
        type: 'classic',
        cellType: 'diamonds',
        color: 'white',
        edgeColor: 'darkgrey'
      }
    });
    
    if (!mat) {
      console.log('❌ Nie znaleziono rekordu white-darkgrey!');
      return;
    }
    
    console.log('=== SZCZEGÓŁY ENCJI ===');
    console.log(`ID: ${mat.id}`);
    console.log(`Typ: ${mat.type}`);
    console.log(`Struktura: ${mat.cellType}`);
    console.log(`Kolor dywanika: ${mat.color}`);
    console.log(`Kolor obszycia: ${mat.edgeColor}`);
    console.log(`Ścieżka obrazu: ${mat.image}`);
    
    // Sprawdź czy plik istnieje
    const imagePath = path.join(__dirname, '../public', mat.image);
    const fileExists = fs.existsSync(imagePath);
    
    console.log(`\n=== WERYFIKACJA PLIKU ===`);
    console.log(`Ścieżka systemowa: ${imagePath}`);
    console.log(`Plik istnieje: ${fileExists ? '✅ TAK' : '❌ NIE'}`);
    
    if (fileExists) {
      const stats = fs.statSync(imagePath);
      console.log(`Rozmiar pliku: ${stats.size} bajtów`);
      console.log(`Data modyfikacji: ${stats.mtime}`);
    }
    
    // Sprawdź oczekiwaną ścieżkę
    const expectedPath = '/images/konfigurator/dywaniki/klasyczne/romby/romby ciemnoszare/5os-classic-diamonds-white-darkgrey.webp';
    const expectedSystemPath = path.join(__dirname, '../public', expectedPath);
    const expectedFileExists = fs.existsSync(expectedSystemPath);
    
    console.log(`\n=== OCZEKIWANA ŚCIEŻKA ===`);
    console.log(`Oczekiwana ścieżka: ${expectedPath}`);
    console.log(`Oczekiwana ścieżka systemowa: ${expectedSystemPath}`);
    console.log(`Oczekiwany plik istnieje: ${expectedFileExists ? '✅ TAK' : '❌ NIE'}`);
    
    if (expectedFileExists) {
      const expectedStats = fs.statSync(expectedSystemPath);
      console.log(`Rozmiar oczekiwanego pliku: ${expectedStats.size} bajtów`);
    }
    
    // Sprawdź czy ścieżki są identyczne
    const pathsMatch = mat.image === expectedPath;
    console.log(`\n=== PORÓWNANIE ===`);
    console.log(`Ścieżki są identyczne: ${pathsMatch ? '✅ TAK' : '❌ NIE'}`);
    
    if (!pathsMatch) {
      console.log(`Różnica:`);
      console.log(`  Obecna: ${mat.image}`);
      console.log(`  Oczekiwana: ${expectedPath}`);
    }
    
  } catch (error) {
    console.error('Błąd podczas sprawdzania:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWhiteDarkgreyDetails(); 