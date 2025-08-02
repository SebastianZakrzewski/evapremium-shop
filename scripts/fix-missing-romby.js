const { PrismaClient } = require('../src/generated/prisma/index.js');

const prisma = new PrismaClient();

async function fixMissingRomby() {
  try {
    console.log('Naprawiam brakujący dywanik beige-black...\n');
    
    // Znajdź rekord z brakującym plikiem
    const missingMat = await prisma.mats.findFirst({
      where: {
        type: 'classic',
        cellType: 'diamonds',
        color: 'beige',
        edgeColor: 'black',
        image: {
          contains: '/czarne obszycie/'
        }
      }
    });
    
    if (!missingMat) {
      console.log('Nie znaleziono problematycznego rekordu.');
      return;
    }
    
    console.log(`Znaleziono problematyczny rekord: ID ${missingMat.id}`);
    console.log(`Obecna ścieżka: ${missingMat.image}`);
    
    // Sprawdź czy istnieje plik beige-black w nowym katalogu
    const fs = require('fs');
    const path = require('path');
    
    const newPath = '/images/konfigurator/dywaniki/klasyczne/romby/czarne obszycie/5os-classic-diamonds-beige-black.webp';
    const filePath = path.join(__dirname, '../public', newPath);
    
    if (fs.existsSync(filePath)) {
      // Plik istnieje, zaktualizuj ścieżkę
      await prisma.mats.update({
        where: { id: missingMat.id },
        data: { image: newPath }
      });
      console.log(`Zaktualizowano ścieżkę na: ${newPath}`);
    } else {
      // Plik nie istnieje, usuń rekord
      await prisma.mats.delete({
        where: { id: missingMat.id }
      });
      console.log('Usunięto rekord z brakującym plikiem.');
    }
    
    console.log('Naprawa zakończona.');
    
  } catch (error) {
    console.error('Błąd podczas naprawy:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMissingRomby(); 