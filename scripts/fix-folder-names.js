const { PrismaClient } = require('../src/generated/prisma/index.js');

const prisma = new PrismaClient();

async function fixFolderNames() {
  try {
    console.log('Naprawiam nazwy katalogów w ścieżkach...\n');
    
    // Mapowanie błędnych nazw na poprawne
    const folderMapping = {
      'romby beżowe': 'romby bezowe',
      'romby brązowe': 'romby brazowe',
      'romby pomarańczowe': 'romby pomaranczowe',
      'romby zółte': 'romby zolte'
    };
    
    let updatedCount = 0;
    
    for (const [wrongName, correctName] of Object.entries(folderMapping)) {
      console.log(`Naprawiam: "${wrongName}" -> "${correctName}"`);
      
      // Znajdź wszystkie rekordy z błędną nazwą katalogu
      const matsToUpdate = await prisma.mats.findMany({
        where: {
          type: 'classic',
          cellType: 'diamonds',
          image: {
            contains: wrongName
          }
        }
      });
      
      console.log(`Znaleziono ${matsToUpdate.length} rekordów do aktualizacji`);
      
      for (const mat of matsToUpdate) {
        const newPath = mat.image.replace(wrongName, correctName);
        
        try {
          await prisma.mats.update({
            where: { id: mat.id },
            data: { image: newPath }
          });
          
          console.log(`Zaktualizowano: ${mat.image} -> ${newPath}`);
          updatedCount++;
          
        } catch (error) {
          console.error(`Błąd podczas aktualizacji ${mat.id}:`, error.message);
        }
      }
    }
    
    console.log(`\nPodsumowanie:`);
    console.log(`- Zaktualizowano: ${updatedCount} rekordów`);
    
  } catch (error) {
    console.error('Błąd podczas naprawy nazw katalogów:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixFolderNames(); 