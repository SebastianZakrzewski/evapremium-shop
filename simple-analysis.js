const fs = require('fs');

const data = JSON.parse(fs.readFileSync('mapped-dywaniki.json', 'utf8'));

console.log('=== ANALIZA KOLORÓW DYWANIKÓW ===');
console.log('Liczba rekordów:', data.records.length);
console.log('');

// Grupuj według struktury komórek
const diamonds = { materialColors: new Set(), borderColors: new Set() };
const honey = { materialColors: new Set(), borderColors: new Set() };

data.records.forEach(record => {
  if (record.cellType === 'diamonds') {
    diamonds.materialColors.add(record.color);
    diamonds.borderColors.add(record.edgeColor);
  } else if (record.cellType === 'honey') {
    honey.materialColors.add(record.color);
    honey.borderColors.add(record.edgeColor);
  }
});

console.log('=== DIAMONDS (ROMBY) ===');
console.log('Kolory materiału (' + diamonds.materialColors.size + '):');
[...diamonds.materialColors].sort().forEach(color => console.log('  - ' + color));
console.log('');
console.log('Kolory obszycia (' + diamonds.borderColors.size + '):');
[...diamonds.borderColors].sort().forEach(color => console.log('  - ' + color));
console.log('');

console.log('=== HONEY (PLASTER MIODU) ===');
console.log('Kolory materiału (' + honey.materialColors.size + '):');
[...honey.materialColors].sort().forEach(color => console.log('  - ' + color));
console.log('');
console.log('Kolory obszycia (' + honey.borderColors.size + '):');
[...honey.borderColors].sort().forEach(color => console.log('  - ' + color));
console.log('');

console.log('=== RÓŻNICE ===');
const onlyDiamonds = [...diamonds.materialColors].filter(color => !honey.materialColors.has(color));
console.log('Kolory tylko w diamonds:', onlyDiamonds.join(', '));

const onlyHoney = [...honey.materialColors].filter(color => !diamonds.materialColors.has(color));
console.log('Kolory tylko w honey:', onlyHoney.join(', '));
