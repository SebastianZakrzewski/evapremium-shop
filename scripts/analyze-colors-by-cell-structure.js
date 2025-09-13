const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Brak zmiennych środowiskowych Supabase');
  console.log('Sprawdzam dostępne zmienne:');
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeColorsByCellStructure() {
  try {
    console.log('🔍 Analiza kolorów według struktury komórek...\n');
    
    // Pobierz wszystkie rekordy z tabeli Mats
    const { data: carMats, error } = await supabase
      .from('Mats')
      .select('cellStructure, materialColor, borderColor')
      .order('cellStructure', { ascending: true });

    if (error) {
      console.error('❌ Błąd podczas pobierania danych:', error);
      return;
    }

    if (!carMats || carMats.length === 0) {
      console.log('⚠️ Brak danych w tabeli Mats');
      return;
    }

    console.log(`✅ Pobrano ${carMats.length} rekordów z tabeli Mats\n`);

    // Grupuj dane według struktury komórek
    const groupedData = carMats.reduce((acc, mat) => {
      const structure = mat.cellStructure;
      if (!acc[structure]) {
        acc[structure] = {
          materialColors: new Set(),
          borderColors: new Set(),
          count: 0
        };
      }
      acc[structure].materialColors.add(mat.materialColor);
      acc[structure].borderColors.add(mat.borderColor);
      acc[structure].count++;
      return acc;
    }, {});

    // Wyświetl wyniki dla każdej struktury komórek
    Object.entries(groupedData).forEach(([structure, data]) => {
      const structureName = structure === 'rhombus' ? 'Romby' : structure === 'honeycomb' ? 'Plaster miodu' : structure;
      
      console.log(`\n🔷 === ${structureName.toUpperCase()} (${structure}) ===`);
      console.log(`📊 Liczba rekordów: ${data.count}`);
      
      const materialColorsArray = Array.from(data.materialColors).sort();
      const borderColorsArray = Array.from(data.borderColors).sort();
      
      console.log(`\n🎨 Kolory materiału (${materialColorsArray.length}):`);
      materialColorsArray.forEach(color => {
        console.log(`   • ${color}`);
      });
      
      console.log(`\n🔲 Kolory obszycia (${borderColorsArray.length}):`);
      borderColorsArray.forEach(color => {
        console.log(`   • ${color}`);
      });
    });

    // Porównaj różnice między strukturami
    console.log('\n\n🔍 === ANALIZA RÓŻNIC ===');
    
    const structures = Object.keys(groupedData);
    if (structures.length >= 2) {
      const [structure1, structure2] = structures;
      const data1 = groupedData[structure1];
      const data2 = groupedData[structure2];
      
      const materialColors1 = Array.from(data1.materialColors);
      const materialColors2 = Array.from(data2.materialColors);
      const borderColors1 = Array.from(data1.borderColors);
      const borderColors2 = Array.from(data2.borderColors);
      
      const onlyInStructure1Materials = materialColors1.filter(color => !materialColors2.includes(color));
      const onlyInStructure2Materials = materialColors2.filter(color => !materialColors1.includes(color));
      const onlyInStructure1Borders = borderColors1.filter(color => !borderColors2.includes(color));
      const onlyInStructure2Borders = borderColors2.filter(color => !borderColors1.includes(color));
      
      console.log(`\n🎨 Kolory materiału TYLKO w ${structure1}:`);
      if (onlyInStructure1Materials.length > 0) {
        onlyInStructure1Materials.forEach(color => console.log(`   • ${color}`));
      } else {
        console.log('   (brak różnic)');
      }
      
      console.log(`\n🎨 Kolory materiału TYLKO w ${structure2}:`);
      if (onlyInStructure2Materials.length > 0) {
        onlyInStructure2Materials.forEach(color => console.log(`   • ${color}`));
      } else {
        console.log('   (brak różnic)');
      }
      
      console.log(`\n🔲 Kolory obszycia TYLKO w ${structure1}:`);
      if (onlyInStructure1Borders.length > 0) {
        onlyInStructure1Borders.forEach(color => console.log(`   • ${color}`));
      } else {
        console.log('   (brak różnic)');
      }
      
      console.log(`\n🔲 Kolory obszycia TYLKO w ${structure2}:`);
      if (onlyInStructure2Borders.length > 0) {
        onlyInStructure2Borders.forEach(color => console.log(`   • ${color}`));
      } else {
        console.log('   (brak różnic)');
      }
    }

    // Generuj kod TypeScript dla mapowania kolorów
    console.log('\n\n💻 === KOD TYPESCRIPT ===');
    console.log('// Mapowanie kolorów na podstawie analizy bazy danych');
    console.log('export const availableColorsByCellStructure = {');
    
    Object.entries(groupedData).forEach(([structure, data]) => {
      const materialColorsArray = Array.from(data.materialColors).sort();
      const borderColorsArray = Array.from(data.borderColors).sort();
      
      console.log(`  '${structure}': {`);
      console.log(`    materialColors: [`);
      materialColorsArray.forEach(color => {
        console.log(`      '${color}',`);
      });
      console.log(`    ],`);
      console.log(`    borderColors: [`);
      borderColorsArray.forEach(color => {
        console.log(`      '${color}',`);
      });
      console.log(`    ]`);
      console.log(`  },`);
    });
    
    console.log('};');

  } catch (error) {
    console.error('❌ Błąd podczas analizy:', error);
  }
}

// Uruchom analizę
analyzeColorsByCellStructure();
