const { PrismaClient } = require('../src/generated/prisma/index.js');

const prisma = new PrismaClient();

async function checkMatsCount() {
  try {
    console.log('Sprawdzam liczbę dywaników w bazie danych...\n');
    
    // Sprawdź wszystkie dywaniki
    const allMats = await prisma.mats.findMany();
    console.log(`Łączna liczba dywaników: ${allMats.length}\n`);
    
    // Sprawdź według typu
    const classicMats = await prisma.mats.findMany({
      where: { type: 'classic' }
    });
    console.log(`Dywaniki klasyczne: ${classicMats.length}`);
    
    // Sprawdź według typu komórek
    const diamondsMats = await prisma.mats.findMany({
      where: { 
        type: 'classic',
        cellType: 'diamonds'
      }
    });
    console.log(`Dywaniki romby (diamonds): ${diamondsMats.length}`);
    
    const honeyMats = await prisma.mats.findMany({
      where: { 
        type: 'classic',
        cellType: 'honey'
      }
    });
    console.log(`Dywaniki plaster miodu (honey): ${honeyMats.length}\n`);
    
    // Sprawdź według kolorów obszycia
    const edgeColors = await prisma.mats.groupBy({
      by: ['edgeColor'],
      where: { type: 'classic' },
      _count: {
        edgeColor: true
      }
    });
    
    console.log('Liczba dywaników według kolorów obszycia:');
    edgeColors.forEach(edge => {
      console.log(`- ${edge.edgeColor}: ${edge._count.edgeColor}`);
    });
    
    console.log('\nLiczba dywaników według kolorów:');
    const colors = await prisma.mats.groupBy({
      by: ['color'],
      where: { type: 'classic' },
      _count: {
        color: true
      }
    });
    
    colors.forEach(color => {
      console.log(`- ${color.color}: ${color._count.color}`);
    });
    
  } catch (error) {
    console.error('Błąd podczas sprawdzania dywaników:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMatsCount(); 