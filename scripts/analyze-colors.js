const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Brak zmiennych środowiskowych Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeColors() {
  try {
    console.log('🔍 Analiza kolorów materiału i obszycia w tabeli CarMat...\n');

    // Pobierz wszystkie unikalne kombinacje
    const { data: allData, error: allError } = await supabase
      .from('CarMat')
      .select('matType, cellStructure, materialColor, borderColor')
      .order('matType')
      .order('cellStructure')
      .order('materialColor')
      .order('borderColor');

    if (allError) {
      console.error('❌ Błąd pobierania danych:', allError);
      return;
    }

    console.log(`📊 Łącznie znaleziono ${allData.length} rekordów\n`);

    // Grupuj dane według struktury komórek
    const groupedByStructure = {};
    
    allData.forEach(item => {
      const structure = item.cellStructure;
      if (!groupedByStructure[structure]) {
        groupedByStructure[structure] = {
          matTypes: new Set(),
          materialColors: new Set(),
          borderColors: new Set(),
          combinations: []
        };
      }
      
      groupedByStructure[structure].matTypes.add(item.matType);
      groupedByStructure[structure].materialColors.add(item.materialColor);
      groupedByStructure[structure].borderColors.add(item.borderColor);
      groupedByStructure[structure].combinations.push({
        matType: item.matType,
        materialColor: item.materialColor,
        borderColor: item.borderColor
      });
    });

    // Analiza dla każdej struktury
    Object.keys(groupedByStructure).forEach(structure => {
      const data = groupedByStructure[structure];
      console.log(`\n🎨 === STRUKTURA: ${structure.toUpperCase()} ===`);
      console.log(`📦 Typy mat: ${Array.from(data.matTypes).join(', ')}`);
      console.log(`🎨 Kolory materiału (${data.materialColors.size}): ${Array.from(data.materialColors).sort().join(', ')}`);
      console.log(`🔲 Kolory obszycia (${data.borderColors.size}): ${Array.from(data.borderColors).sort().join(', ')}`);
      
      // Sprawdź unikalne kombinacje kolorów
      const uniqueCombinations = new Set();
      data.combinations.forEach(combo => {
        uniqueCombinations.add(`${combo.materialColor} + ${combo.borderColor}`);
      });
      
      console.log(`\n🔗 Dostępne kombinacje kolorów (${uniqueCombinations.size}):`);
      Array.from(uniqueCombinations).sort().forEach(combo => {
        console.log(`   • ${combo}`);
      });
    });

    // Sprawdź czy są kolory dostępne tylko w jednej strukturze
    console.log('\n\n🔍 === ANALIZA RÓŻNIC MIĘDZY STRUKTURAMI ===');
    
    const rhombusColors = groupedByStructure['rhombus'] || { materialColors: new Set(), borderColors: new Set() };
    const honeycombColors = groupedByStructure['honeycomb'] || { materialColors: new Set(), borderColors: new Set() };
    
    const rhombusOnlyMaterials = [...rhombusColors.materialColors].filter(color => !honeycombColors.materialColors.has(color));
    const honeycombOnlyMaterials = [...honeycombColors.materialColors].filter(color => !rhombusColors.materialColors.has(color));
    
    const rhombusOnlyBorders = [...rhombusColors.borderColors].filter(color => !honeycombColors.borderColors.has(color));
    const honeycombOnlyBorders = [...honeycombColors.borderColors].filter(color => !rhombusColors.borderColors.has(color));
    
    if (rhombusOnlyMaterials.length > 0) {
      console.log(`\n🎨 Kolory materiału dostępne TYLKO w romby: ${rhombusOnlyMaterials.join(', ')}`);
    }
    
    if (honeycombOnlyMaterials.length > 0) {
      console.log(`\n🎨 Kolory materiału dostępne TYLKO w plaster miodu: ${honeycombOnlyMaterials.join(', ')}`);
    }
    
    if (rhombusOnlyBorders.length > 0) {
      console.log(`\n🔲 Kolory obszycia dostępne TYLKO w romby: ${rhombusOnlyBorders.join(', ')}`);
    }
    
    if (honeycombOnlyBorders.length > 0) {
      console.log(`\n🔲 Kolory obszycia dostępne TYLKO w plaster miodu: ${honeycombOnlyBorders.join(', ')}`);
    }

    // Wspólne kolory
    const commonMaterials = [...rhombusColors.materialColors].filter(color => honeycombColors.materialColors.has(color));
    const commonBorders = [...rhombusColors.borderColors].filter(color => honeycombColors.borderColors.has(color));
    
    console.log(`\n🤝 Wspólne kolory materiału: ${commonMaterials.join(', ')}`);
    console.log(`🤝 Wspólne kolory obszycia: ${commonBorders.join(', ')}`);

    // Generuj dane dla konfiguratora
    console.log('\n\n📋 === DANE DLA KONFIGURATORA ===');
    
    const configuratorData = {};
    Object.keys(groupedByStructure).forEach(structure => {
      const data = groupedByStructure[structure];
      configuratorData[structure] = {
        materialColors: Array.from(data.materialColors).sort(),
        borderColors: Array.from(data.borderColors).sort(),
        matTypes: Array.from(data.matTypes)
      };
    });
    
    console.log('Dane do zaktualizowania w konfiguratorze:');
    console.log(JSON.stringify(configuratorData, null, 2));

  } catch (error) {
    console.error('💥 Błąd:', error);
  }
}

analyzeColors();
