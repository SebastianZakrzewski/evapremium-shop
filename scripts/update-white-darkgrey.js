const { PrismaClient } = require('../src/generated/prisma/index.js');

const prisma = new PrismaClient();

async function updateWhiteDarkgrey() {
  try {
    console.log('Aktualizuję encję white-darkgrey...\n');
    
    // Znajdź obecny rekord
    const existingMat = await prisma.mats.findFirst({
      where: {
        type: 'classic',
        cellType: 'diamonds',
        color: 'white',
        edgeColor: 'darkgrey'
      },
      select: {
        id: true,
        color: true,
        edgeColor: true,
        image: true
      }
    });
    
    if (!existingMat) {
      console.log('Nie znaleziono rekordu white-darkgrey. Tworzę nowy...');
      
      try {
        await prisma.mats.create({
          data: {
            type: 'classic',
            cellType: 'diamonds',
            color: 'white',
            edgeColor: 'darkgrey',
            image: '/images/konfigurator/dywaniki/klasyczne/romby/romby ciemnoszare/5os-classic-diamonds-white-darkgrey.webp'
          }
        });
        
        console.log('✅ Utworzono nowy rekord white-darkgrey');
        
      } catch (error) {
        console.error('Błąd podczas tworzenia rekordu:', error.message);
      }
    } else {
      console.log(`Znaleziono istniejący rekord (ID: ${existingMat.id})`);
      console.log(`Obecna ścieżka: ${existingMat.image}`);
      
      const newImagePath = '/images/konfigurator/dywaniki/klasyczne/romby/romby ciemnoszare/5os-classic-diamonds-white-darkgrey.webp';
      
      if (existingMat.image !== newImagePath) {
        try {
          await prisma.mats.update({
            where: { id: existingMat.id },
            data: {
              image: newImagePath
            }
          });
          
          console.log('✅ Zaktualizowano ścieżkę obrazu');
          console.log(`Nowa ścieżka: ${newImagePath}`);
          
        } catch (error) {
          console.error('Błąd podczas aktualizacji:', error.message);
        }
      } else {
        console.log('✅ Ścieżka jest już poprawna');
      }
    }
    
    // Sprawdź końcowy stan
    const finalMat = await prisma.mats.findFirst({
      where: {
        type: 'classic',
        cellType: 'diamonds',
        color: 'white',
        edgeColor: 'darkgrey'
      }
    });
    
    if (finalMat) {
      console.log('\n=== KOŃCOWY STAN ===');
      console.log(`ID: ${finalMat.id}`);
      console.log(`Kolor: ${finalMat.color}`);
      console.log(`Obszycie: ${finalMat.edgeColor}`);
      console.log(`Ścieżka: ${finalMat.image}`);
    }
    
  } catch (error) {
    console.error('Błąd podczas aktualizacji:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateWhiteDarkgrey(); 