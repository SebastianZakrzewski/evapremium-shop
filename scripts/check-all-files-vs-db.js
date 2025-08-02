const { PrismaClient } = require('../src/generated/prisma/index.js');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function checkAllFilesVsDb() {
  try {
    console.log('Sprawdzam wszystkie pliki vs bazę danych...\n');
    
    const basePath = path.join(__dirname, '../public/images/konfigurator/dywaniki/klasyczne/romby');
    
    // Mapowanie katalogów na kolory obszycia
    const folderToEdgeColorMapping = {
      'romby czarne': 'black',
      'romby bezowe': 'beige',
      'romby brazowe': 'brown',
      'romby bordowe': 'maroon',
      'romby ciemnoszare': 'darkgrey',
      'romby czerwone': 'red',
      'rmby fioletowe': 'purple',
      'romby granatowe': 'blue',
      'romby jasnoszare': 'lightgrey',
      'romby niebieskie': 'darkblue',
      'romby pomaranczowe': 'orange',
      'romby rozowe': 'pink',
      'romby zielone': 'green',
      'romby zolte': 'yellow'
    };
    
    let totalFiles = 0;
    const fileEntries = [];
    const missingInDb = [];
    const missingFiles = [];
    
    // Sprawdź wszystkie pliki w katalogach
    for (const [folderName, edgeColor] of Object.entries(folderToEdgeColorMapping)) {
      const folderPath = path.join(basePath, folderName);
      
      if (!fs.existsSync(folderPath)) {
        console.log(`Katalog nie istnieje: ${folderName}`);
        continue;
      }
      
      const files = fs.readdirSync(folderPath);
      const webpFiles = files.filter(file => file.endsWith('.webp'));
      
      console.log(`\nKatalog: ${folderName} (obszycie: ${edgeColor})`);
      console.log(`Pliki: ${webpFiles.length}`);
      
      for (const filename of webpFiles) {
        totalFiles++;
        
        const colorMatch = filename.match(/5os-classic-diamonds-(\w+)-(\w+)\.webp/);
        if (!colorMatch) {
          console.log(`Nieprawidłowa nazwa pliku: ${filename}`);
          continue;
        }
        
        const matColor = colorMatch[1];
        const fileEdgeColor = colorMatch[2];
        
        if (fileEdgeColor !== edgeColor) {
          console.log(`Niezgodność: ${filename} - plik ma ${fileEdgeColor}, katalog to ${edgeColor}`);
          continue;
        }
        
        const imagePath = `/images/konfigurator/dywaniki/klasyczne/romby/${folderName}/${filename}`;
        fileEntries.push({
          color: matColor,
          edgeColor: edgeColor,
          image: imagePath,
          filename: filename
        });
        
        console.log(`  ${matColor}-${edgeColor} -> ${filename}`);
      }
    }
    
    console.log(`\n=== PODSUMOWANIE PLIKÓW ===`);
    console.log(`Łączna liczba plików: ${totalFiles}`);
    console.log(`Poprawnych plików: ${fileEntries.length}`);
    
    // Sprawdź bazę danych
    const dbMats = await prisma.mats.findMany({
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
    
    console.log(`\n=== BAZA DANYCH ===`);
    console.log(`Rekordów w bazie: ${dbMats.length}`);
    
    // Znajdź brakujące w bazie danych
    for (const fileEntry of fileEntries) {
      const existsInDb = dbMats.find(dbMat => 
        dbMat.color === fileEntry.color && 
        dbMat.edgeColor === fileEntry.edgeColor
      );
      
      if (!existsInDb) {
        missingInDb.push(fileEntry);
      }
    }
    
    // Znajdź brakujące pliki
    for (const dbMat of dbMats) {
      const existsInFiles = fileEntries.find(fileEntry => 
        fileEntry.color === dbMat.color && 
        fileEntry.edgeColor === dbMat.edgeColor
      );
      
      if (!existsInFiles) {
        missingFiles.push(dbMat);
      }
    }
    
    console.log(`\n=== ANALIZA ===`);
    console.log(`Brakujące w bazie danych: ${missingInDb.length}`);
    console.log(`Brakujące pliki: ${missingFiles.length}`);
    
    if (missingInDb.length > 0) {
      console.log('\n=== BRAKUJĄCE W BAZIE DANYCH ===');
      missingInDb.forEach(entry => {
        console.log(`${entry.color}-${entry.edgeColor} -> ${entry.filename}`);
      });
    }
    
    if (missingFiles.length > 0) {
      console.log('\n=== BRAKUJĄCE PLIKI ===');
      missingFiles.forEach(entry => {
        console.log(`${entry.color}-${entry.edgeColor} -> ${entry.image}`);
      });
    }
    
    // Sprawdź statystyki według kolorów obszycia
    console.log('\n=== STATYSTYKI WEDŁUG KOLORÓW OBSZYCIA ===');
    const edgeColorStats = {};
    
    for (const [folderName, edgeColor] of Object.entries(folderToEdgeColorMapping)) {
      const filesInFolder = fileEntries.filter(entry => entry.edgeColor === edgeColor);
      const dbInFolder = dbMats.filter(entry => entry.edgeColor === edgeColor);
      
      edgeColorStats[edgeColor] = {
        files: filesInFolder.length,
        db: dbInFolder.length,
        folder: folderName
      };
    }
    
    Object.entries(edgeColorStats).forEach(([edgeColor, stats]) => {
      console.log(`${edgeColor} (${stats.folder}): ${stats.files} plików, ${stats.db} w bazie`);
    });
    
  } catch (error) {
    console.error('Błąd podczas sprawdzania:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllFilesVsDb(); 