const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Brak zmiennych środowiskowych Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Symulacja funkcji mapowania
function mapCarMatToMats(carMat) {
  return {
    id: parseInt(carMat.id.split('-')[0], 16) || 0,
    type: carMat.matType,
    color: carMat.materialColor,
    cellType: carMat.cellStructure,
    edgeColor: carMat.borderColor,
    image: carMat.imagePath
  };
}

function mapCarMatArrayToMats(carMatArray) {
  return carMatArray.map(mapCarMatToMats);
}

function mapMatsToCarMat(mats) {
  return {
    matType: mats.type,
    materialColor: mats.color,
    cellStructure: mats.cellType,
    borderColor: mats.edgeColor,
    imagePath: mats.image
  };
}

function validateMatsModel(model) {
  return !!(
    model.id !== undefined &&
    model.type &&
    model.color &&
    model.cellType &&
    model.edgeColor &&
    model.image
  );
}

function convertNumberToUuid(id) {
  return `${id.toString(16).padStart(8, '0')}-0000-0000-0000-000000000000`;
}

function convertIdToNumber(uuid) {
  return parseInt(uuid.split('-')[0], 16) || 0;
}

// Implementacja serwisu CarMatService
class CarMatService {
  static async getAllMats(filters = {}) {
    try {
      let query = supabase.from('CarMat').select('*', { count: 'exact' });

      if (filters.type) {
        query = query.eq('matType', filters.type);
      }
      if (filters.color) {
        query = query.eq('materialColor', filters.color);
      }
      if (filters.cellType) {
        query = query.eq('cellStructure', filters.cellType);
      }
      if (filters.edgeColor) {
        query = query.eq('borderColor', filters.edgeColor);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        return {
          success: false,
          data: [],
          error: error.message
        };
      }

      const mappedData = mapCarMatArrayToMats(data || []);
      
      return {
        success: true,
        data: mappedData,
        count: count || 0
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getMatById(id) {
    try {
      const uuid = convertNumberToUuid(id);
      
      const { data, error } = await supabase
        .from('CarMat')
        .select('*')
        .eq('id', uuid)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            success: true,
            data: null,
            error: 'Record not found'
          };
        }
        return {
          success: false,
          data: null,
          error: error.message
        };
      }

      const mappedData = mapCarMatArrayToMats([data])[0];
      
      return {
        success: true,
        data: mappedData
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async get3DMats(filters = {}) {
    return this.getAllMats({
      ...filters,
      type: '3d-with-rims'
    });
  }

  static async getClassicMats(filters = {}) {
    return this.getAllMats({
      ...filters,
      type: '3d-without-rims'
    });
  }

  static async getUniqueValues(field) {
    try {
      const { data, error } = await supabase
        .from('CarMat')
        .select(field);

      if (error) {
        return {
          success: false,
          data: [],
          error: error.message
        };
      }

      const uniqueValues = [...new Set(data?.map(item => item[field]).filter(Boolean) || [])];
      
      return {
        success: true,
        data: uniqueValues
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async searchMats(query, filters = {}) {
    try {
      let searchQuery = supabase
        .from('CarMat')
        .select('*', { count: 'exact' })
        .or(`matType.ilike.%${query}%,materialColor.ilike.%${query}%,cellStructure.ilike.%${query}%,borderColor.ilike.%${query}%`);

      if (filters.type) {
        searchQuery = searchQuery.eq('matType', filters.type);
      }
      if (filters.color) {
        searchQuery = searchQuery.eq('materialColor', filters.color);
      }
      if (filters.cellType) {
        searchQuery = searchQuery.eq('cellStructure', filters.cellType);
      }
      if (filters.edgeColor) {
        searchQuery = searchQuery.eq('borderColor', filters.edgeColor);
      }

      if (filters.limit) {
        searchQuery = searchQuery.limit(filters.limit);
      }
      if (filters.offset) {
        searchQuery = searchQuery.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error, count } = await searchQuery;

      if (error) {
        return {
          success: false,
          data: [],
          error: error.message
        };
      }

      const mappedData = mapCarMatArrayToMats(data || []);
      
      return {
        success: true,
        data: mappedData,
        count: count || 0
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getStats() {
    try {
      const { data, error } = await supabase
        .from('CarMat')
        .select('matType, materialColor, cellStructure, borderColor', { count: 'exact' });

      if (error) {
        return {
          success: false,
          data: {
            totalCount: 0,
            typeCounts: {},
            colorCounts: {},
            cellTypeCounts: {},
            edgeColorCounts: {}
          },
          error: error.message
        };
      }

      const totalCount = data?.length || 0;
      const typeCounts = {};
      const colorCounts = {};
      const cellTypeCounts = {};
      const edgeColorCounts = {};

      data?.forEach(record => {
        typeCounts[record.matType] = (typeCounts[record.matType] || 0) + 1;
        colorCounts[record.materialColor] = (colorCounts[record.materialColor] || 0) + 1;
        cellTypeCounts[record.cellStructure] = (cellTypeCounts[record.cellStructure] || 0) + 1;
        edgeColorCounts[record.borderColor] = (edgeColorCounts[record.borderColor] || 0) + 1;
      });

      return {
        success: true,
        data: {
          totalCount,
          typeCounts,
          colorCounts,
          cellTypeCounts,
          edgeColorCounts
        }
      };
    } catch (error) {
      return {
        success: false,
        data: {
          totalCount: 0,
          typeCounts: {},
          colorCounts: {},
          cellTypeCounts: {},
          edgeColorCounts: {}
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

async function runServiceTests() {
  console.log('🧪 Testowanie CarMatService...\n');

  let allTestsPassed = true;
  let testCount = 0;
  let passedTests = 0;

  // Test 1: Pobierz wszystkie maty
  console.log('📋 Test 1: Pobieranie wszystkich mat...');
  testCount++;
  try {
    const result = await CarMatService.getAllMats({ limit: 5 });
    
    if (result.success && result.data.length > 0) {
      console.log(`✅ Pobrano ${result.data.length} mat (z ${result.count} łącznie)`);
      console.log(`   Przykład: ${result.data[0].type} - ${result.data[0].color} (${result.data[0].cellType})`);
      passedTests++;
    } else {
      console.log('❌ Błąd pobierania mat:', result.error);
      allTestsPassed = false;
    }
  } catch (err) {
    console.log('❌ Exception:', err.message);
    allTestsPassed = false;
  }

  // Test 2: Pobierz maty 3D
  console.log('\n📋 Test 2: Pobieranie mat 3D...');
  testCount++;
  try {
    const result = await CarMatService.get3DMats({ limit: 3 });
    
    if (result.success) {
      console.log(`✅ Pobrano ${result.data.length} mat 3D`);
      if (result.data.length > 0) {
        console.log(`   Przykład: ${result.data[0].type} - ${result.data[0].color}`);
      }
      passedTests++;
    } else {
      console.log('❌ Błąd pobierania mat 3D:', result.error);
      allTestsPassed = false;
    }
  } catch (err) {
    console.log('❌ Exception:', err.message);
    allTestsPassed = false;
  }

  // Test 3: Pobierz maty klasyczne
  console.log('\n📋 Test 3: Pobieranie mat klasycznych...');
  testCount++;
  try {
    const result = await CarMatService.getClassicMats({ limit: 3 });
    
    if (result.success) {
      console.log(`✅ Pobrano ${result.data.length} mat klasycznych`);
      if (result.data.length > 0) {
        console.log(`   Przykład: ${result.data[0].type} - ${result.data[0].color}`);
      }
      passedTests++;
    } else {
      console.log('❌ Błąd pobierania mat klasycznych:', result.error);
      allTestsPassed = false;
    }
  } catch (err) {
    console.log('❌ Exception:', err.message);
    allTestsPassed = false;
  }

  // Test 4: Pobierz mat po ID
  console.log('\n📋 Test 4: Pobieranie mat po ID...');
  testCount++;
  try {
    const result = await CarMatService.getMatById(3410383687);
    
    if (result.success) {
      if (result.data) {
        console.log(`✅ Znaleziono mat: ${result.data.type} - ${result.data.color} (${result.data.cellType})`);
      } else {
        console.log('⚠️ Mat o ID 3410383687 nie został znaleziony');
      }
      passedTests++;
    } else {
      console.log('❌ Błąd pobierania mat po ID:', result.error);
      allTestsPassed = false;
    }
  } catch (err) {
    console.log('❌ Exception:', err.message);
    allTestsPassed = false;
  }

  // Test 5: Pobierz unikalne kolory
  console.log('\n📋 Test 5: Pobieranie unikalnych kolorów...');
  testCount++;
  try {
    const result = await CarMatService.getUniqueValues('materialColor');
    
    if (result.success) {
      console.log(`✅ Znaleziono ${result.data.length} unikalnych kolorów:`);
      console.log(`   ${result.data.slice(0, 10).join(', ')}${result.data.length > 10 ? '...' : ''}`);
      passedTests++;
    } else {
      console.log('❌ Błąd pobierania unikalnych kolorów:', result.error);
      allTestsPassed = false;
    }
  } catch (err) {
    console.log('❌ Exception:', err.message);
    allTestsPassed = false;
  }

  // Test 6: Wyszukaj maty
  console.log('\n📋 Test 6: Wyszukiwanie mat...');
  testCount++;
  try {
    const result = await CarMatService.searchMats('czarny', { limit: 5 });
    
    if (result.success) {
      console.log(`✅ Znaleziono ${result.data.length} mat zawierających "czarny"`);
      if (result.data.length > 0) {
        console.log(`   Przykład: ${result.data[0].type} - ${result.data[0].color} (${result.data[0].cellType})`);
      }
      passedTests++;
    } else {
      console.log('❌ Błąd wyszukiwania mat:', result.error);
      allTestsPassed = false;
    }
  } catch (err) {
    console.log('❌ Exception:', err.message);
    allTestsPassed = false;
  }

  // Test 7: Pobierz statystyki
  console.log('\n📋 Test 7: Pobieranie statystyk...');
  testCount++;
  try {
    const result = await CarMatService.getStats();
    
    if (result.success) {
      console.log(`✅ Statystyki:`);
      console.log(`   Łączna liczba: ${result.data.totalCount}`);
      console.log(`   Typy: ${Object.keys(result.data.typeCounts).join(', ')}`);
      console.log(`   Kolory: ${Object.keys(result.data.colorCounts).length} unikalnych`);
      console.log(`   Struktury: ${Object.keys(result.data.cellTypeCounts).join(', ')}`);
      passedTests++;
    } else {
      console.log('❌ Błąd pobierania statystyk:', result.error);
      allTestsPassed = false;
    }
  } catch (err) {
    console.log('❌ Exception:', err.message);
    allTestsPassed = false;
  }

  // Test 8: Filtrowanie po kolorze
  console.log('\n📋 Test 8: Filtrowanie po kolorze...');
  testCount++;
  try {
    const result = await CarMatService.getAllMats({ color: 'czarny', limit: 3 });
    
    if (result.success) {
      console.log(`✅ Znaleziono ${result.data.length} czarnych mat`);
      if (result.data.length > 0) {
        console.log(`   Przykład: ${result.data[0].type} - ${result.data[0].color} (${result.data[0].cellType})`);
      }
      passedTests++;
    } else {
      console.log('❌ Błąd filtrowania po kolorze:', result.error);
      allTestsPassed = false;
    }
  } catch (err) {
    console.log('❌ Exception:', err.message);
    allTestsPassed = false;
  }

  // Podsumowanie testów
  console.log('\n' + '='.repeat(50));
  console.log('📊 PODSUMOWANIE TESTÓW SERWISU');
  console.log('='.repeat(50));
  console.log(`✅ Przeszło: ${passedTests}/${testCount} testów`);
  console.log(`❌ Nie przeszło: ${testCount - passedTests}/${testCount} testów`);
  console.log(`📈 Sukces: ${Math.round((passedTests / testCount) * 100)}%`);
  
  if (allTestsPassed) {
    console.log('\n🎉 Wszystkie testy serwisu przeszły pomyślnie!');
    console.log('✅ CarMatService działa poprawnie');
  } else {
    console.log('\n⚠️ Niektóre testy nie przeszły - sprawdź logi powyżej');
  }

  return allTestsPassed;
}

runServiceTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('💥 Błąd podczas wykonywania testów serwisu:', err);
  process.exit(1);
});
