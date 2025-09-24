const { createClient } = require('@supabase/supabase-js');

// Konfiguracja Supabase
const supabaseUrl = 'https://diqbnsinhsedmvvstvvc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpcWJuc2luaHNlZG12dnN0dnZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5NzQ4MDAsImV4cCI6MjA1MTU1MDgwMH0.8K8Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function pobierzWszystkieDywanki() {
  try {
    console.log('🔍 Pobieranie wszystkich dywaników z tabeli CarMat...\n');
    
    // Pobierz wszystkie dane z tabeli CarMat
    const { data, error } = await supabase
      .from('CarMat')
      .select('*')
      .order('createdAt', { ascending: true });

    if (error) {
      console.error('❌ Błąd podczas pobierania danych:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.log('⚠️  Brak danych w tabeli CarMat');
      return;
    }

    console.log(`✅ Pobrano ${data.length} rekordów z tabeli CarMat\n`);
    
    // Wyświetl wszystkie rekordy
    console.log('📋 WSZYSTKIE REKORDY Z TABELI CarMat:');
    console.log('=' .repeat(80));
    data.forEach((record, index) => {
      console.log(`\n${index + 1}. ID: ${record.id}`);
      console.log(`   Typ dywanika: ${record.matType}`);
      console.log(`   Struktura komórek: ${record.cellStructure}`);
      console.log(`   Kolor materiału: ${record.materialColor}`);
      console.log(`   Kolor obszycia: ${record.borderColor}`);
      console.log(`   Ścieżka obrazu: ${record.imagePath}`);
      console.log(`   Utworzono: ${record.createdAt}`);
    });

    // Analiza kombinacji
    console.log('\n\n🔍 ANALIZA KOMBINACJI DYWANIKÓW:');
    console.log('=' .repeat(80));

    // Grupowanie według różnych atrybutów
    const wedlugTypu = {};
    const wedlugStruktury = {};
    const wedlugKoloruMaterialu = {};
    const wedlugKoloruObszycia = {};
    const wedlugKombinacji = {};

    data.forEach(record => {
      // Grupuj według typu dywanika
      if (!wedlugTypu[record.matType]) wedlugTypu[record.matType] = [];
      wedlugTypu[record.matType].push(record);

      // Grupuj według struktury komórek
      if (!wedlugStruktury[record.cellStructure]) wedlugStruktury[record.cellStructure] = [];
      wedlugStruktury[record.cellStructure].push(record);

      // Grupuj według koloru materiału
      if (!wedlugKoloruMaterialu[record.materialColor]) wedlugKoloruMaterialu[record.materialColor] = [];
      wedlugKoloruMaterialu[record.materialColor].push(record);

      // Grupuj według koloru obszycia
      if (!wedlugKoloruObszycia[record.borderColor]) wedlugKoloruObszycia[record.borderColor] = [];
      wedlugKoloruObszycia[record.borderColor].push(record);

      // Grupuj według pełnej kombinacji
      const kombinacja = `${record.matType} + ${record.cellStructure} + ${record.materialColor} + ${record.borderColor}`;
      if (!wedlugKombinacji[kombinacja]) wedlugKombinacji[kombinacja] = [];
      wedlugKombinacji[kombinacja].push(record);
    });

    // Wyświetl wyniki analizy
    console.log('\n📊 PODZIAŁ WEDŁUG TYPU DYWANIKA:');
    Object.keys(wedlugTypu).forEach(typ => {
      console.log(`   ${typ}: ${wedlugTypu[typ].length} rekordów`);
    });

    console.log('\n📊 PODZIAŁ WEDŁUG STRUKTURY KOMÓREK:');
    Object.keys(wedlugStruktury).forEach(struktura => {
      console.log(`   ${struktura}: ${wedlugStruktury[struktura].length} rekordów`);
    });

    console.log('\n📊 PODZIAŁ WEDŁUG KOLORU MATERIAŁU:');
    Object.keys(wedlugKoloruMaterialu).forEach(kolor => {
      console.log(`   ${kolor}: ${wedlugKoloruMaterialu[kolor].length} rekordów`);
    });

    console.log('\n📊 PODZIAŁ WEDŁUG KOLORU OBSZYCIA:');
    Object.keys(wedlugKoloruObszycia).forEach(kolor => {
      console.log(`   ${kolor}: ${wedlugKoloruObszycia[kolor].length} rekordów`);
    });

    console.log('\n🎯 WSZYSTKIE UNIKALNE KOMBINACJE:');
    Object.keys(wedlugKombinacji).forEach(kombinacja => {
      console.log(`   ${kombinacja}: ${wedlugKombinacji[kombinacja].length} rekordów`);
    });

    // Znajdź najczęściej występujące kombinacje
    console.log('\n🏆 NAJCZĘŚCIEJ WYSTĘPUJĄCE KOMBINACJE:');
    const posortowaneKombinacje = Object.entries(wedlugKombinacji)
      .sort(([,a], [,b]) => b.length - a.length);
    
    posortowaneKombinacje.forEach(([kombinacja, rekordy], index) => {
      console.log(`   ${index + 1}. ${kombinacja} (${rekordy.length} rekordów)`);
    });

    // Statystyki
    console.log('\n📈 STATYSTYKI:');
    console.log(`   Łączna liczba rekordów: ${data.length}`);
    console.log(`   Liczba unikalnych typów dywaników: ${Object.keys(wedlugTypu).length}`);
    console.log(`   Liczba unikalnych struktur komórek: ${Object.keys(wedlugStruktury).length}`);
    console.log(`   Liczba unikalnych kolorów materiału: ${Object.keys(wedlugKoloruMaterialu).length}`);
    console.log(`   Liczba unikalnych kolorów obszycia: ${Object.keys(wedlugKoloruObszycia).length}`);
    console.log(`   Liczba unikalnych kombinacji: ${Object.keys(wedlugKombinacji).length}`);

  } catch (error) {
    console.error('❌ Błąd podczas wykonywania skryptu:', error);
  }
}

// Uruchom skrypt
pobierzWszystkieDywanki();
