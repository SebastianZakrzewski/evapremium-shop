const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function analyzeMats() {
  try {
    // Pobierz wszystkie maty
    const mats = await prisma.mats.findMany({
      select: {
        matType: true,
        cellStructure: true,
        materialColor: true,
        borderColor: true
      }
    });

    console.log('=== ANALIZA DOSTĘPNYCH KOLORÓW I WZORÓW ===\n');
    
    // Grupuj według struktury komórek
    const grouped = {};
    mats.forEach(mat => {
      if (!grouped[mat.cellStructure]) {
        grouped[mat.cellStructure] = {
          materialColors: new Set(),
          borderColors: new Set(),
          matTypes: new Set()
        };
      }
      grouped[mat.cellStructure].materialColors.add(mat.materialColor);
      grouped[mat.cellStructure].borderColors.add(mat.borderColor);
      grouped[mat.cellStructure].matTypes.add(mat.matType);
    });

    // Wyświetl wyniki
    Object.keys(grouped).forEach(structure => {
      console.log(`=== ${structure.toUpperCase()} ===`);
      console.log('Typy mat:', [...grouped[structure].matTypes].join(', '));
      console.log('Kolory materiału (' + grouped[structure].materialColors.size + '):', [...grouped[structure].materialColors].sort().join(', '));
      console.log('Kolory obszycia (' + grouped[structure].borderColors.size + '):', [...grouped[structure].borderColors].sort().join(', '));
      console.log('');
    });

    console.log('=== PODSUMOWANIE ===');
    console.log('Łączna liczba mat:', mats.length);
    console.log('Struktury komórek:', Object.keys(grouped).join(', '));
    
  } catch (error) {
    console.error('Błąd:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeMats();
