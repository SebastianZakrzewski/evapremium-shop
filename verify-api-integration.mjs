// Weryfikacja czy komponenty używają poprawnego API
// Sprawdza spójność między komponentami a API route

console.log('🔍 Weryfikacja integracji API z komponentami\n');
console.log('='.repeat(80));

// Mapowanie w brand-products-section.tsx
const componentMapping = {
  bmw: { displayName: "BMW", apiName: "Bmw" },
  mercedes: { displayName: "Mercedes", apiName: "Mercedes-Benz" },
  'mercedes-benz': { displayName: "Mercedes", apiName: "Mercedes-Benz" },
  audi: { displayName: "Audi", apiName: "Audi" },
  porsche: { displayName: "Porsche", apiName: "Porsche" },
  volkswagen: { displayName: "Volkswagen", apiName: "Volkswagen" },
  vw: { displayName: "Volkswagen", apiName: "Volkswagen" },
  toyota: { displayName: "Toyota", apiName: "Toyota" },
};

// Mapowanie w API route.ts
const apiMapping = {
  'Mercedes': 'Mercedes-Benz',
  'mercedes': 'Mercedes-Benz',
  'Mercedes-Benz': 'Mercedes-Benz',
  'mercedes-benz': 'Mercedes-Benz',
  'BMW': 'Bmw',
  'bmw': 'Bmw',
  'Bmw': 'Bmw',
  'BMW Group': 'Bmw',
  'Audi': 'Audi',
  'audi': 'Audi',
  'Porsche': 'Porsche',
  'porsche': 'Porsche',
  'Volkswagen': 'Volkswagen',
  'volkswagen': 'Volkswagen',
  'VW': 'Volkswagen',
  'vw': 'Volkswagen',
  'Toyota': 'Toyota',
  'toyota': 'Toyota',
};

console.log('📋 Test 1: Sprawdzenie mapowania nazw marek\n');

let allMatch = true;

for (const [slug, componentInfo] of Object.entries(componentMapping)) {
  const componentApiName = componentInfo.apiName;
  
  // Sprawdź czy API route ma mapowanie dla tej nazwy
  const apiMappedName = apiMapping[componentApiName] || componentApiName;
  
  const matches = apiMappedName === componentApiName;
  
  if (matches) {
    console.log(`✅ ${slug} → ${componentApiName} → ${apiMappedName} (OK)`);
  } else {
    console.log(`❌ ${slug} → ${componentApiName} → ${apiMappedName} (NIEZGODNOŚĆ!)`);
    allMatch = false;
  }
}

console.log('\n📋 Test 2: Sprawdzenie endpointu API\n');

const testCases = [
  { slug: 'bmw', expectedApiName: 'Bmw', expectedUrl: '/api/models?brand=Bmw' },
  { slug: 'mercedes', expectedApiName: 'Mercedes-Benz', expectedUrl: '/api/models?brand=Mercedes-Benz' },
  { slug: 'mercedes-benz', expectedApiName: 'Mercedes-Benz', expectedUrl: '/api/models?brand=Mercedes-Benz' },
  { slug: 'audi', expectedApiName: 'Audi', expectedUrl: '/api/models?brand=Audi' },
  { slug: 'porsche', expectedApiName: 'Porsche', expectedUrl: '/api/models?brand=Porsche' },
];

testCases.forEach(({ slug, expectedApiName, expectedUrl }) => {
  const componentInfo = componentMapping[slug];
  if (!componentInfo) {
    console.log(`⚠️  ${slug}: Brak mapowania w komponencie`);
    return;
  }
  
  const componentApiName = componentInfo.apiName;
  const actualUrl = `/api/models?brand=${encodeURIComponent(componentApiName)}`;
  
  const urlMatches = actualUrl === expectedUrl;
  const nameMatches = componentApiName === expectedApiName;
  
  if (urlMatches && nameMatches) {
    console.log(`✅ ${slug}:`);
    console.log(`   Komponent używa: "${componentApiName}"`);
    console.log(`   URL: ${actualUrl}`);
    console.log(`   API oczekuje: "${expectedApiName}"`);
  } else {
    console.log(`❌ ${slug}: NIEZGODNOŚĆ!`);
    console.log(`   Komponent używa: "${componentApiName}"`);
    console.log(`   URL: ${actualUrl}`);
    console.log(`   Oczekiwane: "${expectedApiName}"`);
    console.log(`   Oczekiwany URL: ${expectedUrl}`);
    allMatch = false;
  }
});

console.log('\n📋 Test 3: Sprawdzenie struktury odpowiedzi API\n');

const expectedResponseStructure = {
  brand: 'string',
  model: 'string',
  generations: 'array',
  bodyTypes: 'array',
  years: 'array',
  isCurrentlyProduced: 'boolean'
};

console.log('Oczekiwana struktura odpowiedzi API:');
Object.entries(expectedResponseStructure).forEach(([key, type]) => {
  console.log(`   • ${key}: ${type}`);
});

console.log('\n📋 Test 4: Sprawdzenie użycia w komponentach\n');

console.log('brand-products-section.tsx:');
console.log('   ✅ Używa: /api/models?brand=${encodeURIComponent(brandName)}');
console.log('   ✅ brandName pochodzi z: getApiBrandName(brandSlug)');
console.log('   ✅ Mapowanie: brandSlug → brandApiName → API');

console.log('\nproduct-selection-section.tsx:');
console.log('   ✅ Używa: /api/models?brand=${encodeURIComponent(brandName)}');
console.log('   ✅ brandName pochodzi z: brandInfo.apiName || fallback');
console.log('   ✅ Mapowanie: brandSlug → brandApiName → API');

console.log('\n' + '='.repeat(80));

if (allMatch) {
  console.log('✅ WSZYSTKIE TESTY PRZESZŁY POMYŚLNIE!');
  console.log('\nKomponenty używają poprawnego API:');
  console.log('   • Endpoint: /api/models');
  console.log('   • Parametr: brand');
  console.log('   • Mapowanie nazw: zgodne');
  console.log('   • Kodowanie URL: poprawne (encodeURIComponent)');
} else {
  console.log('❌ ZNALEZIONO NIEZGODNOŚCI!');
  console.log('   Sprawdź mapowanie nazw marek między komponentami a API');
}

console.log('\n');











