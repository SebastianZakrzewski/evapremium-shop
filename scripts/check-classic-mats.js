const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkClassicMats() {
  try {
    console.log('Sprawdzanie dywaników klasycznych z czarnym obszyciem...');
    
    // Sprawdź dywaniki klasyczne z czarnym obszyciem
    const classicMats = await prisma.mats.findMany({
      where: {
        type: 'classic',
        edgeColor: 'black'
      }
    });
    
    console.log(`Znaleziono ${classicMats.length} dywaników klasycznych z czarnym obszyciem:`);
    
    classicMats.forEach(mat => {
      console.log(`- ID: ${mat.id}, Kolor: ${mat.color}, Typ: ${mat.type}, Obszycie: ${mat.edgeColor}`);
    });
    
    // Sprawdź wszystkie dywaniki klasyczne
    const allClassicMats = await prisma.mats.findMany({
      where: {
        type: 'classic'
      }
    });
    
    console.log(`\nWszystkich dywaników klasycznych: ${allClassicMats.length}`);
    
    // Sprawdź wszystkie dywaniki z czarnym obszyciem
    const allBlackEdgeMats = await prisma.mats.findMany({
      where: {
        edgeColor: 'black'
      }
    });
    
    console.log(`Wszystkich dywaników z czarnym obszyciem: ${allBlackEdgeMats.length}`);
    
  } catch (error) {
    console.error('Błąd podczas sprawdzania dywaników klasycznych:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkClassicMats(); 