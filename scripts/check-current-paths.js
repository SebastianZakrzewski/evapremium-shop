const { PrismaClient } = require('../src/generated/prisma/index.js');

const prisma = new PrismaClient();

async function checkCurrentPaths() {
  try {
    console.log('Sprawdzam obecne ścieżki obrazów dla dywaników romby...\n');
    
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
      },
      orderBy: {
        color: 'asc'
      }
    });
    
    console.log(`Znaleziono ${diamondsMats.length} dywaników romby\n`);
    
    // Sprawdź różne wzorce ścieżek
    const pathPatterns = {};
    
    diamondsMats.forEach(mat => {
      const path = mat.image;
      if (!pathPatterns[path]) {
        pathPatterns[path] = 0;
      }
      pathPatterns[path]++;
    });
    
    console.log('Wzorce ścieżek:');
    Object.entries(pathPatterns).forEach(([path, count]) => {
      console.log(`- ${path}: ${count} dywaników`);
    });
    
    // Sprawdź przykładowe rekordy
    console.log('\nPrzykładowe rekordy:');
    diamondsMats.slice(0, 10).forEach(mat => {
      console.log(`ID: ${mat.id}, Kolor: ${mat.color}, Obszycie: ${mat.edgeColor}, Ścieżka: ${mat.image}`);
    });
    
  } catch (error) {
    console.error('Błąd podczas sprawdzania ścieżek:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentPaths(); 