const { PrismaClient } = require('./src/generated/prisma/index.js');
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
      console.log(`${index + 1}. ID: ${mat.id}, Kolor: ${mat.color}, Typ: ${mat.type}, Komórki: ${mat.cellType}, Obszycie: ${mat.edgeColor}`);
    });
    
    // Sprawdź unikalne kolory
    const colors = await prisma.mats.findMany({
      select: {
        color: true
      },
      distinct: ['color']
    });
    
    console.log('\nDostępne kolory:');
    colors.forEach(color => {
      console.log(`- ${color.color}`);
    });

    // Sprawdź unikalne typy
    const types = await prisma.mats.findMany({
      select: {
        type: true
      },
      distinct: ['type']
    });
    
    console.log('\nDostępne typy:');
    types.forEach(type => {
      console.log(`- ${type.type}`);
    });

    // Sprawdź dywaniki klasyczne
    const classicMats = await prisma.mats.findMany({
      where: {
        type: 'classic'
      }
    });
    
    console.log(`\nLiczba dywaników klasycznych: ${classicMats.length}`);
    if (classicMats.length > 0) {
      console.log('Przykładowe dywaniki klasyczne:');
      classicMats.slice(0, 5).forEach((mat, index) => {
        console.log(`${index + 1}. ID: ${mat.id}, Kolor: ${mat.color}, Typ: ${mat.type}, Komórki: ${mat.cellType}, Obszycie: ${mat.edgeColor}`);
      });
    }

    // Sprawdź kolory obszycia dla dywaników klasycznych
    const classicEdgeColors = await prisma.mats.findMany({
      where: {
        type: 'classic'
      },
      select: {
        edgeColor: true
      },
      distinct: ['edgeColor']
    });
    
    console.log('\nKolory obszycia dla dywaników klasycznych:');
    classicEdgeColors.forEach(edge => {
      console.log(`- ${edge.edgeColor}`);
    });
    
  } catch (error) {
    console.error('Błąd podczas sprawdzania danych:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMats(); 