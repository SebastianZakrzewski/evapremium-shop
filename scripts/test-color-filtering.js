const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Brak zmiennych środowiskowych Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Mapowanie kolorów z bazy danych na kolory hex - używamy polskich nazw
const colorMapping = {
  'niebieski': { name: "Niebieski", color: "#0084d1" },
  'czerwony': { name: "Czerwony", color: "#d12d1c" },
  'żółty': { name: "Żółty", color: "#ffe100" },
  'kość słoniowa': { name: "Kość słoniowa", color: "#d9d7c7" },
  'ciemnoniebieski': { name: "Ciemnoniebieski", color: "#1a355b" },
  'bordowy': { name: "Bordowy", color: "#6d2635" },
  'pomarańczowy': { name: "Pomarańczowy", color: "#ff7b1c" },
  'jasnobeżowy': { name: "Jasnobeżowy", color: "#d1b48c" },
  'ciemnoszary': { name: "Ciemnoszary", color: "#4a4a4a" },
  'fioletowy': { name: "Fioletowy", color: "#7c4bc8" },
  'limonkowy': { name: "Limonkowy", color: "#8be000" },
  'beżowy': { name: "Beżowy", color: "#b48a5a" },
  'różowy': { name: "Różowy", color: "#ff7eb9" },
  'czarny': { name: "Czarny", color: "#222" },
  'ciemnozielony': { name: "Ciemnozielony", color: "#1b5e3c" },
  'brązowy': { name: "Brązowy", color: "#4b2e1e" },
  'biały': { name: "Biały", color: "#ffffff" },
  'jasnoszary': { name: "Jasnoszary", color: "#bdbdbd" },
  'lightgrey': { name: "Jasnoszary", color: "#bdbdbd" },
  'zielony': { name: "Zielony", color: "#4caf50" },
};

async function testColorFiltering() {
  try {
    console.log('🧪 Test dynamicznego filtrowania kolorów w konfiguratorze...\n');

    // Test dla struktury honeycomb (plaster miodu)
    console.log('🍯 === TEST: PLASTER MIODU (honeycomb) ===');
    const { data: honeycombData, error: honeycombError } = await supabase
      .from('CarMat')
      .select('materialColor, borderColor')
      .eq('cellStructure', 'honeycomb');

    if (honeycombError) {
      console.error('❌ Błąd pobierania danych honeycomb:', honeycombError);
      return;
    }

    const honeycombMaterialColors = [...new Set(honeycombData.map(item => item.materialColor))].sort();
    const honeycombBorderColors = [...new Set(honeycombData.map(item => item.borderColor))].sort();

    console.log(`📊 Kolory materiału w plaster miodu (${honeycombMaterialColors.length}):`);
    honeycombMaterialColors.forEach(color => {
      const colorInfo = colorMapping[color];
      if (colorInfo) {
        console.log(`   ✅ ${color} → ${colorInfo.name} (${colorInfo.color})`);
      } else {
        console.log(`   ⚠️  ${color} → BRAK MAPOWANIA`);
      }
    });

    console.log(`\n📊 Kolory obszycia w plaster miodu (${honeycombBorderColors.length}):`);
    honeycombBorderColors.forEach(color => {
      const colorInfo = colorMapping[color];
      if (colorInfo) {
        console.log(`   ✅ ${color} → ${colorInfo.name} (${colorInfo.color})`);
      } else {
        console.log(`   ⚠️  ${color} → BRAK MAPOWANIA`);
      }
    });

    // Test dla struktury rhombus (romby)
    console.log('\n\n🔷 === TEST: ROMBY (rhombus) ===');
    const { data: rhombusData, error: rhombusError } = await supabase
      .from('CarMat')
      .select('materialColor, borderColor')
      .eq('cellStructure', 'rhombus');

    if (rhombusError) {
      console.error('❌ Błąd pobierania danych rhombus:', rhombusError);
      return;
    }

    const rhombusMaterialColors = [...new Set(rhombusData.map(item => item.materialColor))].sort();
    const rhombusBorderColors = [...new Set(rhombusData.map(item => item.borderColor))].sort();

    console.log(`📊 Kolory materiału w romby (${rhombusMaterialColors.length}):`);
    rhombusMaterialColors.forEach(color => {
      const colorInfo = colorMapping[color];
      if (colorInfo) {
        console.log(`   ✅ ${color} → ${colorInfo.name} (${colorInfo.color})`);
      } else {
        console.log(`   ⚠️  ${color} → BRAK MAPOWANIA`);
      }
    });

    console.log(`\n📊 Kolory obszycia w romby (${rhombusBorderColors.length}):`);
    rhombusBorderColors.forEach(color => {
      const colorInfo = colorMapping[color];
      if (colorInfo) {
        console.log(`   ✅ ${color} → ${colorInfo.name} (${colorInfo.color})`);
      } else {
        console.log(`   ⚠️  ${color} → BRAK MAPOWANIA`);
      }
    });

    // Porównanie różnic
    console.log('\n\n🔍 === ANALIZA RÓŻNIC ===');
    
    const honeycombOnlyMaterials = honeycombMaterialColors.filter(color => !rhombusMaterialColors.includes(color));
    const rhombusOnlyMaterials = rhombusMaterialColors.filter(color => !honeycombMaterialColors.includes(color));
    
    const honeycombOnlyBorders = honeycombBorderColors.filter(color => !rhombusBorderColors.includes(color));
    const rhombusOnlyBorders = rhombusBorderColors.filter(color => !honeycombBorderColors.includes(color));

    if (honeycombOnlyMaterials.length > 0) {
      console.log(`\n🎨 Kolory materiału TYLKO w plaster miodu: ${honeycombOnlyMaterials.join(', ')}`);
    }
    
    if (rhombusOnlyMaterials.length > 0) {
      console.log(`\n🎨 Kolory materiału TYLKO w romby: ${rhombusOnlyMaterials.join(', ')}`);
    }
    
    if (honeycombOnlyBorders.length > 0) {
      console.log(`\n🔲 Kolory obszycia TYLKO w plaster miodu: ${honeycombOnlyBorders.join(', ')}`);
    }
    
    if (rhombusOnlyBorders.length > 0) {
      console.log(`\n🔲 Kolory obszycia TYLKO w romby: ${rhombusOnlyBorders.join(', ')}`);
    }

    // Test API endpoints
    console.log('\n\n🌐 === TEST API ENDPOINTS ===');
    
    // Test plaster miodu
    console.log('\n🍯 Test plaster miodu:');
    const testHoneycombColors = ['czarny', 'czerwony', 'niebieski'];
    for (const color of testHoneycombColors) {
      try {
        const response = await fetch(`http://localhost:3002/api/mats?type=3d-with-rims&cellType=honeycomb&edgeColor=czarny&color=${color}`);
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          console.log(`   ✅ ${color}: Znaleziono ${data.data.length} mat`);
        } else {
          console.log(`   ❌ ${color}: Brak mat`);
        }
      } catch (error) {
        console.log(`   ⚠️  ${color}: Błąd API - ${error.message}`);
      }
    }

    // Test romby
    console.log('\n🔷 Test romby:');
    const testRhombusColors = ['czarny', 'czerwony', 'niebieski', 'fioletowy', 'żółty'];
    for (const color of testRhombusColors) {
      try {
        const response = await fetch(`http://localhost:3002/api/mats?type=3d-with-rims&cellType=rhombus&edgeColor=czarny&color=${color}`);
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          console.log(`   ✅ ${color}: Znaleziono ${data.data.length} mat`);
        } else {
          console.log(`   ❌ ${color}: Brak mat`);
        }
      } catch (error) {
        console.log(`   ⚠️  ${color}: Błąd API - ${error.message}`);
      }
    }

    console.log('\n✅ Test zakończony pomyślnie!');

  } catch (error) {
    console.error('💥 Błąd podczas testowania:', error);
  }
}

testColorFiltering();

