const fs = require('fs');

try {
  // Wczytaj dane z pliku JSON
  const data = JSON.parse(fs.readFileSync('mapped-dywaniki.json', 'utf8'));

  console.log('=== SZCZEGÓŁOWA ANALIZA KOLORÓW I WZORÓW DYWANIKÓW ===\n');
  console.log('Łączna liczba rekordów:', data.records.length);
  console.log('');

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

  // Wyświetl wyniki dla każdej struktury
  Object.keys(grouped).forEach(cellType => {
    console.log(`=== ${cellType.toUpperCase()} (ROMBY/PLASTER MIODU) ===`);
    console.log('Typy mat:', [...grouped[cellType].types].join(', '));
    console.log('');
    
    const materialColors = [...grouped[cellType].materialColors].sort();
    console.log(`Kolory materiału (${materialColors.length}):`);
    materialColors.forEach((color, index) => {
      console.log(`  ${index + 1}. ${color}`);
    });
    console.log('');
    
    const borderColors = [...grouped[cellType].borderColors].sort();
    console.log(`Kolory obszycia (${borderColors.length}):`);
    borderColors.forEach((color, index) => {
      console.log(`  ${index + 1}. ${color}`);
    });
    console.log('');
  });

  // Sprawdź różnice między wzorami
  console.log('=== RÓŻNICE MIĘDZY WZORAMI ===');
  const diamonds = grouped['diamonds'];
  const honey = grouped['honey'];

  console.log('\nKolory materiału dostępne tylko w DIAMONDS (romby):');
  const onlyDiamonds = [...diamonds.materialColors].filter(color => !honey.materialColors.has(color));
  if (onlyDiamonds.length > 0) {
    onlyDiamonds.forEach((color, index) => {
      console.log(`  ${index + 1}. ${color}`);
    });
  } else {
    console.log('  Brak - wszystkie kolory są dostępne w obu wzorach');
  }

  console.log('\nKolory materiału dostępne tylko w HONEY (plaster miodu):');
  const onlyHoney = [...honey.materialColors].filter(color => !diamonds.materialColors.has(color));
  if (onlyHoney.length > 0) {
    onlyHoney.forEach((color, index) => {
      console.log(`  ${index + 1}. ${color}`);
    });
  } else {
    console.log('  Brak - wszystkie kolory są dostępne w obu wzorach');
  }

  console.log('\nKolory obszycia dostępne tylko w DIAMONDS (romby):');
  const onlyDiamondsBorder = [...diamonds.borderColors].filter(color => !honey.borderColors.has(color));
  if (onlyDiamondsBorder.length > 0) {
    onlyDiamondsBorder.forEach((color, index) => {
      console.log(`  ${index + 1}. ${color}`);
    });
  } else {
    console.log('  Brak - wszystkie kolory są dostępne w obu wzorach');
  }

  console.log('\nKolory obszycia dostępne tylko w HONEY (plaster miodu):');
  const onlyHoneyBorder = [...honey.borderColors].filter(color => !diamonds.borderColors.has(color));
  if (onlyHoneyBorder.length > 0) {
    onlyHoneyBorder.forEach((color, index) => {
      console.log(`  ${index + 1}. ${color}`);
    });
  } else {
    console.log('  Brak - wszystkie kolory są dostępne w obu wzorach');
  }

  // Sprawdź mapowanie kolorów
  console.log('\n=== MAPOWANIE KOLORÓW ===');
  console.log('Wszystkie unikalne kolory materiału w systemie:');
  const allMaterialColors = new Set();
  data.records.forEach(record => allMaterialColors.add(record.color));
  [...allMaterialColors].sort().forEach((color, index) => {
    console.log(`  ${index + 1}. ${color}`);
  });

  console.log('\nWszystkie unikalne kolory obszycia w systemie:');
  const allBorderColors = new Set();
  data.records.forEach(record => allBorderColors.add(record.edgeColor));
  [...allBorderColors].sort().forEach((color, index) => {
    console.log(`  ${index + 1}. ${color}`);
  });

} catch (error) {
  console.error('Błąd:', error);
}
