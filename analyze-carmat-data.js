const { createClient } = require('@supabase/supabase-js');

// Konfiguracja Supabase
const supabaseUrl = 'https://diqbnsinhsedmvvstvvc.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('Błąd: Brak klucza Supabase. Ustaw zmienną środowiskową SUPABASE_KEY lub SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeCarMatData() {
  try {
    console.log('🔍 Pobieranie danych z tabeli CarMat...\n');
    
    // Pobierz wszystkie rekordy z tabeli CarMat
    const { data: carMats, error } = await supabase
      .from('CarMat')
      .select('*')
      .order('createdAt', { ascending: true });

    if (error) {
      console.error('❌ Błąd podczas pobierania danych:', error);
      return;
    }

    if (!carMats || carMats.length === 0) {
      console.log('⚠️ Brak danych w tabeli CarMat');
      return;
    }

    console.log(`✅ Pobrano ${carMats.length} rekordów z tabeli CarMat\n`);

    // Analiza typów dywaników
    console.log('📊 ANALIZA TYPÓW DYWANIKÓW:');
    console.log('=' .repeat(50));
    const matTypes = [...new Set(carMats.map(mat => mat.matType))];
    matTypes.forEach(type => {
      const count = carMats.filter(mat => mat.matType === type).length;
      const displayName = type === '3d-with-rims' ? '3D z rantami' : '3D bez rantów';
      console.log(`• ${displayName}: ${count} rekordów`);
    });

    // Analiza struktur komórek
    console.log('\n📊 ANALIZA STRUKTUR KOMÓREK:');
    console.log('=' .repeat(50));
    const cellStructures = [...new Set(carMats.map(mat => mat.cellStructure))];
    cellStructures.forEach(structure => {
      const count = carMats.filter(mat => mat.cellStructure === structure).length;
      const displayName = structure === 'rhombus' ? 'Romb' : 'Plaster miodu';
      console.log(`• ${displayName}: ${count} rekordów`);
    });

    // Analiza kolorów materiału
    console.log('\n📊 ANALIZA KOLORÓW MATERIAŁU:');
    console.log('=' .repeat(50));
    const materialColors = [...new Set(carMats.map(mat => mat.materialColor))];
    materialColors.forEach(color => {
      const count = carMats.filter(mat => mat.materialColor === color).length;
      console.log(`• ${color}: ${count} rekordów`);
    });

    // Analiza kolorów obszycia
    console.log('\n📊 ANALIZA KOLORÓW OBSZYCIA:');
    console.log('=' .repeat(50));
    const borderColors = [...new Set(carMats.map(mat => mat.borderColor))];
    borderColors.forEach(color => {
      const count = carMats.filter(mat => mat.borderColor === color).length;
      console.log(`• ${color}: ${count} rekordów`);
    });

    // Analiza kombinacji kolorów
    console.log('\n📊 ANALIZA KOMBINACJI KOLORÓW:');
    console.log('=' .repeat(50));
    const colorCombinations = [...new Set(carMats.map(mat => `${mat.materialColor} + ${mat.borderColor}`))];
    colorCombinations.forEach(combination => {
      const count = carMats.filter(mat => `${mat.materialColor} + ${mat.borderColor}` === combination).length;
      console.log(`• ${combination}: ${count} rekordów`);
    });

    // Analiza wszystkich możliwych kombinacji
    console.log('\n📊 ANALIZA WSZYSTKICH KOMBINACJI:');
    console.log('=' .repeat(50));
    const allCombinations = [...new Set(carMats.map(mat => 
      `${mat.matType} | ${mat.cellStructure} | ${mat.materialColor} | ${mat.borderColor}`
    ))];
    
    allCombinations.forEach(combination => {
      const count = carMats.filter(mat => 
        `${mat.matType} | ${mat.cellStructure} | ${mat.materialColor} | ${mat.borderColor}` === combination
      ).length;
      console.log(`• ${combination}: ${count} rekordów`);
    });

    // Szczegółowe dane
    console.log('\n📋 SZCZEGÓŁOWE DANE:');
    console.log('=' .repeat(50));
    carMats.forEach((mat, index) => {
      console.log(`\n${index + 1}. ID: ${mat.id}`);
      console.log(`   Typ dywanika: ${mat.matType === '3d-with-rims' ? '3D z rantami' : '3D bez rantów'}`);
      console.log(`   Struktura komórek: ${mat.cellStructure === 'rhombus' ? 'Romb' : 'Plaster miodu'}`);
      console.log(`   Kolor materiału: ${mat.materialColor}`);
      console.log(`   Kolor obszycia: ${mat.borderColor}`);
      console.log(`   Ścieżka obrazu: ${mat.imagePath}`);
      console.log(`   Data utworzenia: ${new Date(mat.createdAt).toLocaleString('pl-PL')}`);
    });

    // Statystyki końcowe
    console.log('\n📈 STATYSTYKI KOŃCOWE:');
    console.log('=' .repeat(50));
    console.log(`• Łączna liczba rekordów: ${carMats.length}`);
    console.log(`• Liczba typów dywaników: ${matTypes.length}`);
    console.log(`• Liczba struktur komórek: ${cellStructures.length}`);
    console.log(`• Liczba kolorów materiału: ${materialColors.length}`);
    console.log(`• Liczba kolorów obszycia: ${borderColors.length}`);
    console.log(`• Liczba kombinacji kolorów: ${colorCombinations.length}`);
    console.log(`• Liczba wszystkich kombinacji: ${allCombinations.length}`);

  } catch (error) {
    console.error('❌ Błąd podczas analizy danych:', error);
  }
}

// Uruchom analizę
analyzeCarMatData();
