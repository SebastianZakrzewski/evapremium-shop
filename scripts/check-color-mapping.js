const { PrismaClient } = require('../src/generated/prisma/index.js');

const prisma = new PrismaClient();

async function checkColorMapping() {
  try {
    console.log('Sprawdzam mapowanie kolorów dla dywaników romby...\n');
    
    // Pobierz wszystkie dywaniki romby
    const diamondsMats = await prisma.mats.findMany({
      where: {
        type: 'classic',
        cellType: 'diamonds'
      },
      select: {
        color: true,
        edgeColor: true,
        image: true
      },
      orderBy: [
        { color: 'asc' },
        { edgeColor: 'asc' }
      ]
    });
    
    console.log(`Znaleziono ${diamondsMats.length} dywaników romby\n`);
    
    // Grupuj według kolorów dywaników
    const colorGroups = {};
    diamondsMats.forEach(mat => {
      if (!colorGroups[mat.color]) {
        colorGroups[mat.color] = [];
      }
      colorGroups[mat.color].push(mat);
    });
    
    console.log('=== MAPOWANIE KOLORÓW ===');
    console.log('Format: Kolor dywanika -> [Kolory obszycia]');
    console.log('');
    
    Object.keys(colorGroups).sort().forEach(color => {
      const edgeColors = colorGroups[color].map(mat => mat.edgeColor).sort();
      console.log(`${color} -> [${edgeColors.join(', ')}]`);
    });
    
    console.log('\n=== SZCZEGÓŁOWE MAPOWANIE ===');
    console.log('Format: Kolor dywanika + Kolor obszycia -> Ścieżka');
    console.log('');
    
    diamondsMats.forEach(mat => {
      console.log(`${mat.color}-${mat.edgeColor} -> ${mat.image}`);
    });
    
    // Sprawdź statystyki
    const uniqueColors = [...new Set(diamondsMats.map(mat => mat.color))];
    const uniqueEdgeColors = [...new Set(diamondsMats.map(mat => mat.edgeColor))];
    
    console.log('\n=== STATYSTYKI ===');
    console.log(`Unikalne kolory dywaników: ${uniqueColors.length}`);
    console.log(`Unikalne kolory obszycia: ${uniqueEdgeColors.length}`);
    console.log(`Łączna liczba kombinacji: ${diamondsMats.length}`);
    
    console.log('\nKolory dywaników:');
    uniqueColors.sort().forEach(color => {
      const count = diamondsMats.filter(mat => mat.color === color).length;
      console.log(`- ${color}: ${count} kombinacji`);
    });
    
    console.log('\nKolory obszycia:');
    uniqueEdgeColors.sort().forEach(edgeColor => {
      const count = diamondsMats.filter(mat => mat.edgeColor === edgeColor).length;
      console.log(`- ${edgeColor}: ${count} kombinacji`);
    });
    
  } catch (error) {
    console.error('Błąd podczas sprawdzania mapowania kolorów:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkColorMapping(); 