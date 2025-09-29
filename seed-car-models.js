/**
 * Skrypt seed danych z pliku marki_modele_generacje_nadwozia.json do Supabase
 * Uruchom: node seed-car-models.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Konfiguracja Supabase - używamy poprawnych danych
const supabaseUrl = 'https://kmepxyervpeujwvgdqtm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZXB4eWVydnBldWp3dmdkcXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzUwOTQyNSwiZXhwIjoyMDczMDg1NDI1fQ.sr3YFtozFZCJpTKTfjX7180oI_fjT0rxG0sx2i0YKlI';

const supabase = createClient(supabaseUrl, supabaseKey);

// Funkcja do parsowania generacji i wyciągnięcia lat
function parseGeneration(generation) {
  if (!generation) return { yearFrom: null, yearTo: null, isCurrentlyProduced: false };
  
  const cleanGen = generation.trim();
  
  // Sprawdź czy zawiera "+" (nadal produkowany)
  if (cleanGen.includes('+')) {
    const year = parseInt(cleanGen.replace('+', ''));
    return {
      yearFrom: year,
      yearTo: null,
      isCurrentlyProduced: true
    };
  }
  
  // Sprawdź czy zawiera zakres lat (np. "2001-2006")
  if (cleanGen.includes('-')) {
    const [from, to] = cleanGen.split('-').map(y => parseInt(y.trim()));
    return {
      yearFrom: from,
      yearTo: to,
      isCurrentlyProduced: false
    };
  }
  
  // Tylko jeden rok (np. "2005")
  const year = parseInt(cleanGen);
  if (!isNaN(year)) {
    return {
      yearFrom: year,
      yearTo: year,
      isCurrentlyProduced: false
    };
  }
  
  // Nie można sparsować - zwróć null
  return {
    yearFrom: null,
    yearTo: null,
    isCurrentlyProduced: false
  };
}

// Funkcja do normalizacji nazwy marki
function normalizeBrandName(brandName) {
  if (!brandName) return 'Nieznana marka';
  return brandName.trim();
}

// Funkcja do normalizacji nazwy modelu
function normalizeModelName(modelName) {
  if (!modelName) return 'Nieznany model';
  return modelName.trim();
}

// Funkcja do normalizacji typu nadwozia
function normalizeBodyType(bodyType) {
  if (!bodyType) {
    return 'nieznany';
  }
  return bodyType.trim();
}

// Główna funkcja seed
async function seedCarModels() {
  try {
    console.log('🚀 Rozpoczynam seed danych samochodów...');
    
    // Wczytaj plik JSON
    const jsonPath = path.join(process.cwd(), 'marki_modele_generacje_nadwozia.json');
    
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`Plik ${jsonPath} nie istnieje!`);
    }
    
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`📁 Wczytano dane z pliku JSON`);
    
    // Sprawdź połączenie z Supabase
    console.log('🔍 Sprawdzam połączenie z Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('car_models_extended')
      .select('id')
      .limit(1);
    
    if (testError) {
      throw new Error(`Błąd połączenia z Supabase: ${testError.message}`);
    }
    console.log('✅ Połączenie z Supabase działa');
    
    // Przygotuj dane do wstawienia
    const recordsToInsert = [];
    let totalRecords = 0;
    let warningsCount = 0;
    
    for (const [brandName, models] of Object.entries(jsonData)) {
      const normalizedBrand = normalizeBrandName(brandName);
      
      for (const [modelName, generations] of Object.entries(models)) {
        const normalizedModel = normalizeModelName(modelName);
        
        for (const generationData of generations) {
          const { yearFrom, yearTo, isCurrentlyProduced } = parseGeneration(generationData.generacja);
          const normalizedBodyType = normalizeBodyType(generationData.typ_nadwozia);
          
          if (!generationData.typ_nadwozia) {
            warningsCount++;
          }
          
          recordsToInsert.push({
            brand_name: normalizedBrand,
            model_name: normalizedModel,
            generation: generationData.generacja || 'nieznana',
            body_type: normalizedBodyType,
            year_from: yearFrom,
            year_to: yearTo,
            is_currently_produced: isCurrentlyProduced
          });
          
          totalRecords++;
        }
      }
    }
    
    console.log(`📊 Przygotowano ${totalRecords} rekordów do wstawienia`);
    if (warningsCount > 0) {
      console.log(`⚠️  ${warningsCount} rekordów bez typu nadwozia (zostanie użyty domyślny)`);
    }
    
    // Wyczyść istniejące dane
    console.log('🧹 Czyszczenie istniejących danych...');
    const { error: deleteError } = await supabase
      .from('car_models_extended')
      .delete()
      .neq('id', 0); // Usuń wszystkie rekordy
    
    if (deleteError) {
      console.warn('⚠️  Ostrzeżenie podczas czyszczenia:', deleteError.message);
    } else {
      console.log('✅ Dane zostały wyczyszczone');
    }
    
    // Wstaw dane w partiach (Supabase ma limit 1000 rekordów na request)
    const batchSize = 1000;
    let insertedCount = 0;
    
    for (let i = 0; i < recordsToInsert.length; i += batchSize) {
      const batch = recordsToInsert.slice(i, i + batchSize);
      
      console.log(`📤 Wstawiam partię ${Math.floor(i / batchSize) + 1}/${Math.ceil(recordsToInsert.length / batchSize)} (${batch.length} rekordów)...`);
      
      const { data, error } = await supabase
        .from('car_models_extended')
        .insert(batch);
      
      if (error) {
        console.error('❌ Błąd podczas wstawiania partii:', error);
        throw error;
      }
      
      insertedCount += batch.length;
      console.log(`✅ Wstawiono ${insertedCount}/${totalRecords} rekordów`);
    }
    
    // Sprawdź wyniki
    const { data: countData, error: countError } = await supabase
      .from('car_models_extended')
      .select('id', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Błąd podczas sprawdzania liczby rekordów:', countError);
    } else {
      console.log(`🎉 Seed zakończony! Wstawiono ${countData?.length || 0} rekordów`);
    }
    
    // Pokaż statystyki
    const { data: stats } = await supabase
      .from('car_models_extended')
      .select('brand_name')
      .order('brand_name');
    
    const uniqueBrands = [...new Set(stats?.map(r => r.brand_name) || [])];
    console.log(`📈 Statystyki:`);
    console.log(`   - Unikalne marki: ${uniqueBrands.length}`);
    console.log(`   - Wszystkich rekordów: ${insertedCount}`);
    
    // Pokaż przykładowe dane
    console.log('\n📋 Przykładowe dane:');
    const { data: sampleData } = await supabase
      .from('car_models_extended')
      .select('brand_name, model_name, generation, body_type, year_from, year_to')
      .limit(5);
    
    sampleData?.forEach((record, index) => {
      console.log(`   ${index + 1}. ${record.brand_name} ${record.model_name} (${record.generation}) - ${record.body_type}`);
    });
    
  } catch (error) {
    console.error('❌ Błąd podczas seed:', error);
    process.exit(1);
  }
}

// Uruchom seed
if (require.main === module) {
  seedCarModels();
}

module.exports = { seedCarModels };
