import { PrismaClient } from './src/generated/src/generated/prisma/index.js';
const prisma = new PrismaClient();

async function checkMats() {
  try {
    // Sprawdź ile rekordów jest w tabeli Mats
    const count = await prisma.mats.count();
    console.log(`Liczba rekordów w tabeli Mats: ${count}`);
    
    // Pobierz pierwsze 5 rekordów jako przykład
    const mats = await prisma.mats.findMany({
      take: 5
    });
    
    console.log('\nPrzykładowe rekordy:');
    mats.forEach((mat, index) => {
      console.log(`${index + 1}. ID: ${mat.id}, Kolor: ${mat.materialColor}, Typ: ${mat.matType}, Komórki: ${mat.cellStructure}, Obszycie: ${mat.borderColor}`);
    });
    
    // Sprawdź unikalne kolory
    const colors = await prisma.mats.findMany({
      select: {
        materialColor: true
      },
      distinct: ['materialColor']
    });
    
    console.log('\nDostępne kolory:');
    colors.forEach(color => {
      console.log(`- ${color.materialColor}`);
    });

    // Sprawdź dywaniki z czarnym obszyciem
    const blackEdgeMats = await prisma.mats.findMany({
      where: {
        borderColor: 'black'
      }
    });
    
    console.log('\nDywaniki z czarnym obszyciem:');
    blackEdgeMats.forEach((mat, index) => {
      console.log(`${index + 1}. ID: ${mat.id}, Kolor: ${mat.materialColor}, Typ: ${mat.matType}, Komórki: ${mat.cellStructure}, Obszycie: ${mat.borderColor}`);
      console.log(`   Obraz: ${mat.imagePath}`);
    });

    // Sprawdź dywaniki klasyczne z czarnym obszyciem
    const classicBlackEdgeMats = await prisma.mats.findMany({
      where: {
        borderColor: 'black',
        matType: 'classic'
      }
    });
    
    console.log('\nDywaniki klasyczne z czarnym obszyciem:');
    classicBlackEdgeMats.forEach((mat, index) => {
      console.log(`${index + 1}. ID: ${mat.id}, Kolor: ${mat.materialColor}, Typ: ${mat.matType}, Komórki: ${mat.cellStructure}, Obszycie: ${mat.borderColor}`);
      console.log(`   Obraz: ${mat.imagePath}`);
    });

    // Sprawdź dywaniki 3D z czarnym obszyciem
    const threeDBlackEdgeMats = await prisma.mats.findMany({
      where: {
        borderColor: 'black',
        matType: '3d'
      }
    });
    
    console.log('\nDywaniki 3D z czarnym obszyciem:');
    threeDBlackEdgeMats.forEach((mat, index) => {
      console.log(`${index + 1}. ID: ${mat.id}, Kolor: ${mat.materialColor}, Typ: ${mat.matType}, Komórki: ${mat.cellStructure}, Obszycie: ${mat.borderColor}`);
      console.log(`   Obraz: ${mat.imagePath}`);
    });
    
  } catch (error) {
    console.error('Błąd podczas sprawdzania danych:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMats(); 