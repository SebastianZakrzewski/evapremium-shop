const { PrismaClient } = require('./src/generated/prisma/index.js');

async function checkMatsData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Sprawdzanie danych dywaników w bazie danych...\n');
    
    // Sprawdź liczbę rekordów
    const count = await prisma.mats.count();
    console.log(`📊 Liczba rekordów w tabeli Mats: ${count}`);
    
    if (count === 0) {
      console.log('\n❌ Brak danych dywaników w bazie danych!');
      console.log('💡 Uruchom: npx prisma db seed');
      return;
    }
    
    // Pobierz pierwsze 5 rekordów
    const mats = await prisma.mats.findMany({
      take: 5
    });
    
    console.log('\n📋 Przykładowe rekordy:');
    mats.forEach((mat, index) => {
      console.log(`${index + 1}. ID: ${mat.id}`);
      console.log(`   Kolor: ${mat.color}`);
      console.log(`   Typ: ${mat.type}`);
      console.log(`   Komórki: ${mat.cellType}`);
      console.log(`   Obszycie: ${mat.edgeColor}`);
      console.log(`   Obraz: ${mat.image}`);
      console.log('');
    });
    
    // Sprawdź unikalne kolory
    const colors = await prisma.mats.findMany({
      select: { color: true },
      distinct: ['color']
    });
    
    console.log('🎨 Dostępne kolory:');
    colors.forEach(color => {
      console.log(`   - ${color.color}`);
    });
    
    // Sprawdź unikalne typy
    const types = await prisma.mats.findMany({
      select: { type: true },
      distinct: ['type']
    });
    
    console.log('\n🔧 Dostępne typy:');
    types.forEach(type => {
      console.log(`   - ${type.type}`);
    });
    
    // Sprawdź unikalne typy komórek
    const cellTypes = await prisma.mats.findMany({
      select: { cellType: true },
      distinct: ['cellType']
    });
    
    console.log('\n📐 Dostępne typy komórek:');
    cellTypes.forEach(cellType => {
      console.log(`   - ${cellType.cellType}`);
    });
    
    console.log('\n✅ Sprawdzanie zakończone!');
    
  } catch (error) {
    console.error('❌ Błąd podczas sprawdzania danych:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMatsData(); 