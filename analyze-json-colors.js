const fs = require('fs');

try {
  // Wczytaj dane z pliku JSON
  const data = JSON.parse(fs.readFileSync('mapped-dywaniki.json', 'utf8'));

  console.log('=== ANALIZA KOLORÓW I WZORÓW DYWANIKÓW ===\n');
  console.log('Łączna liczba rekordów:', data.records.length);

// Grupuj według struktury komórek
const grouped = {};
data.records.forEach(record => {
  if (!grouped[record.cellType]) {
    grouped[record.cellType] = {
      materialColors: new Set(),
      borderColors: new Set(),
      types: new Set()
    };
  }
  grouped[record.cellType].materialColors.add(record.color);
  grouped[record.cellType].borderColors.add(record.edgeColor);
  grouped[record.cellType].types.add(record.type);
});

// Wyświetl wyniki
Object.keys(grouped).forEach(cellType => {
  console.log(`=== ${cellType.toUpperCase()} ===`);
  console.log('Typy mat:', [...grouped[cellType].types].join(', '));
  console.log('Kolory materiału (' + grouped[cellType].materialColors.size + '):', [...grouped[cellType].materialColors].sort().join(', '));
  console.log('Kolory obszycia (' + grouped[cellType].borderColors.size + '):', [...grouped[cellType].borderColors].sort().join(', '));
  console.log('');
});

console.log('=== PODSUMOWANIE ===');
console.log('Łączna liczba mat:', data.records.length);
console.log('Struktury komórek:', Object.keys(grouped).join(', '));

// Sprawdź różnice między wzorami
console.log('\n=== RÓŻNICE MIĘDZY WZORAMI ===');
const diamonds = grouped['diamonds'];
const honey = grouped['honey'];

console.log('Kolory materiału dostępne tylko w diamonds:');
const onlyDiamonds = [...diamonds.materialColors].filter(color => !honey.materialColors.has(color));
console.log(onlyDiamonds.join(', '));

console.log('\nKolory materiału dostępne tylko w honey:');
const onlyHoney = [...honey.materialColors].filter(color => !diamonds.materialColors.has(color));
console.log(onlyHoney.join(', '));

console.log('\nKolory obszycia dostępne tylko w diamonds:');
const onlyDiamondsBorder = [...diamonds.borderColors].filter(color => !honey.borderColors.has(color));
console.log(onlyDiamondsBorder.join(', '));

console.log('\nKolory obszycia dostępne tylko w honey:');
const onlyHoneyBorder = [...honey.borderColors].filter(color => !diamonds.borderColors.has(color));
console.log(onlyHoneyBorder.join(', '));

} catch (error) {
  console.error('Błąd:', error);
}
