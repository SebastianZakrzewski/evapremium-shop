const { PrismaClient } = require('../src/generated/prisma/index.js');

const prisma = new PrismaClient();

async function removeMissingMats() {
  try {
    console.log('Usuwam brakujące dywaniki z bazy danych...\n');
    
    // Lista kolorów obszycia, które nie mają katalogów
    const missingEdgeColors = ['red'];
    
    let totalDeleted = 0;
    
    for (const edgeColor of missingEdgeColors) {
      console.log(`Usuwam dywaniki z obszyciem: ${edgeColor}`);
      
      // Znajdź wszystkie dywaniki romby z tym obszyciem
      const matsToDelete = await prisma.mats.findMany({
        where: {
          type: 'classic',
          cellType: 'diamonds',
          edgeColor: edgeColor
        },
        select: {
          id: true,
          color: true,
          edgeColor: true,
          image: true
        }
      });
      
      console.log(`Znaleziono ${matsToDelete.length} dywaników do usunięcia`);
      
      let deletedCount = 0;
      
      for (const mat of matsToDelete) {
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
      
      console.log(`Usunięto: ${deletedCount}/${matsToDelete.length} dywaników z obszyciem ${edgeColor}\n`);
      totalDeleted += deletedCount;
    }
    
    console.log(`\n=== PODSUMOWANIE ===`);
    console.log(`Łącznie usunięto: ${totalDeleted} rekordów`);
    
    // Sprawdź końcowy stan
    const remainingMats = await prisma.mats.findMany({
      where: {
        type: 'classic',
        cellType: 'diamonds'
      }
    });
    
    console.log(`\nPozostało dywaników romby w bazie: ${remainingMats.length}`);
    
    // Sprawdź statystyki według kolorów obszycia
    const edgeColorStats = {};
    remainingMats.forEach(mat => {
      if (!edgeColorStats[mat.edgeColor]) {
        edgeColorStats[mat.edgeColor] = 0;
      }
      edgeColorStats[mat.edgeColor]++;
    });
    
    console.log('\n=== STATYSTYKI PO USUNIĘCIU ===');
    Object.entries(edgeColorStats).forEach(([edgeColor, count]) => {
      console.log(`${edgeColor}: ${count} dywaników`);
    });
    
  } catch (error) {
    console.error('Błąd podczas usuwania:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeMissingMats(); 