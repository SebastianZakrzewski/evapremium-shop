const { PrismaClient } = require('../src/generated/prisma/index.js');

const prisma = new PrismaClient();

async function removeMissingRedMats() {
  try {
    console.log('Usuwam brakujące dywaniki czerwone z bazy danych...\n');
    
    // Znajdź wszystkie dywaniki romby z czerwonym obszyciem
    const redMats = await prisma.mats.findMany({
      where: {
        type: 'classic',
        cellType: 'diamonds',
        edgeColor: 'red'
      },
      select: {
        id: true,
        color: true,
        edgeColor: true,
        image: true
      }
    });
    
    console.log(`Znaleziono ${redMats.length} dywaników z czerwonym obszyciem do usunięcia:`);
    
    let deletedCount = 0;
    
    for (const mat of redMats) {
      try {
        await prisma.mats.delete({
          where: { id: mat.id }
        });
        
        console.log(`Usunięto: ${mat.color}-${mat.edgeColor} (ID: ${mat.id})`);
        deletedCount++;
        
      } catch (error) {
        console.error(`Błąd podczas usuwania ${mat.id}:`, error.message);
      }
    }
    
    console.log(`\n=== PODSUMOWANIE ===`);
    console.log(`Usunięto: ${deletedCount} rekordów`);
    console.log(`Błąd: ${redMats.length - deletedCount} rekordów`);
    
    // Sprawdź końcowy stan
    const remainingMats = await prisma.mats.findMany({
      where: {
        type: 'classic',
        cellType: 'diamonds'
      }
    });
    
    console.log(`\nPozostało dywaników romby w bazie: ${remainingMats.length}`);
    
  } catch (error) {
    console.error('Błąd podczas usuwania:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeMissingRedMats(); 