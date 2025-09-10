const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://diqbnsinhsedmvvstvvc.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('Missing Supabase key. Please set SUPABASE_KEY or SUPABASE_ANON_KEY environment variable.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchAllCarMatData() {
  try {
    console.log('🔍 Pobieranie wszystkich danych z tabeli CarMat...\n');
    
    // Fetch all data from CarMat table
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
    
    // Display all raw data
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
      console.log(`   Zaktualizowano: ${record.updatedAt}`);
    });

    // Analyze combinations
    console.log('\n\n🔍 ANALIZA KOMBINACJI DYWANIKÓW:');
    console.log('=' .repeat(80));

    // Group by different attributes
    const byMatType = {};
    const byCellStructure = {};
    const byMaterialColor = {};
    const byBorderColor = {};
    const byCombination = {};

    data.forEach(record => {
      // Group by mat type
      if (!byMatType[record.matType]) byMatType[record.matType] = [];
      byMatType[record.matType].push(record);

      // Group by cell structure
      if (!byCellStructure[record.cellStructure]) byCellStructure[record.cellStructure] = [];
      byCellStructure[record.cellStructure].push(record);

      // Group by material color
      if (!byMaterialColor[record.materialColor]) byMaterialColor[record.materialColor] = [];
      byMaterialColor[record.materialColor].push(record);

      // Group by border color
      if (!byBorderColor[record.borderColor]) byBorderColor[record.borderColor] = [];
      byBorderColor[record.borderColor].push(record);

      // Group by full combination
      const combination = `${record.matType} + ${record.cellStructure} + ${record.materialColor} + ${record.borderColor}`;
      if (!byCombination[combination]) byCombination[combination] = [];
      byCombination[combination].push(record);
    });

    // Display analysis results
    console.log('\n📊 PODZIAŁ WEDŁUG TYPU DYWANIKA:');
    Object.keys(byMatType).forEach(type => {
      console.log(`   ${type}: ${byMatType[type].length} rekordów`);
    });

    console.log('\n📊 PODZIAŁ WEDŁUG STRUKTURY KOMÓREK:');
    Object.keys(byCellStructure).forEach(structure => {
      console.log(`   ${structure}: ${byCellStructure[structure].length} rekordów`);
    });

    console.log('\n📊 PODZIAŁ WEDŁUG KOLORU MATERIAŁU:');
    Object.keys(byMaterialColor).forEach(color => {
      console.log(`   ${color}: ${byMaterialColor[color].length} rekordów`);
    });

    console.log('\n📊 PODZIAŁ WEDŁUG KOLORU OBSZYCIA:');
    Object.keys(byBorderColor).forEach(color => {
      console.log(`   ${color}: ${byBorderColor[color].length} rekordów`);
    });

    console.log('\n🎯 WSZYSTKIE UNIKALNE KOMBINACJE:');
    Object.keys(byCombination).forEach(combination => {
      console.log(`   ${combination}: ${byCombination[combination].length} rekordów`);
    });

    // Find most common combinations
    console.log('\n🏆 NAJCZĘŚCIEJ WYSTĘPUJĄCE KOMBINACJE:');
    const sortedCombinations = Object.entries(byCombination)
      .sort(([,a], [,b]) => b.length - a.length);
    
    sortedCombinations.forEach(([combination, records], index) => {
      console.log(`   ${index + 1}. ${combination} (${records.length} rekordów)`);
    });

    // Statistics
    console.log('\n📈 STATYSTYKI:');
    console.log(`   Łączna liczba rekordów: ${data.length}`);
    console.log(`   Liczba unikalnych typów dywaników: ${Object.keys(byMatType).length}`);
    console.log(`   Liczba unikalnych struktur komórek: ${Object.keys(byCellStructure).length}`);
    console.log(`   Liczba unikalnych kolorów materiału: ${Object.keys(byMaterialColor).length}`);
    console.log(`   Liczba unikalnych kolorów obszycia: ${Object.keys(byBorderColor).length}`);
    console.log(`   Liczba unikalnych kombinacji: ${Object.keys(byCombination).length}`);

  } catch (error) {
    console.error('❌ Błąd podczas wykonywania skryptu:', error);
  }
}

// Run the script
fetchAllCarMatData();
