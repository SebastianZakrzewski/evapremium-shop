import { config } from 'dotenv';

config();

// Import funkcji z głównego skryptu
function fixBMWGenerationCode(modelName: string, brandName: string): string {
  if (brandName.toLowerCase() !== 'bmw') return modelName;
  
  // Znajdź i popraw błędne kody Gt* → (G*)
  return modelName.replace(/\s*Gt([0-9]+)/gi, ' (G$1)');
}

function normalizeGenerationCode(modelName: string): string {
  // Znajdź kody generacji bez nawiasów i dodaj je (obsługuje E-90, F40, G70, itp.)
  return modelName.replace(/\s+([EFGU][-]?[0-9]{2,3})\b(?!\))/gi, ' ($1)');
}

function cleanBMWModel(modelName: string): string {
  let cleaned = modelName;
  
  // 1. Popraw błędne kody Gt* → (G*)
  cleaned = cleaned.replace(/\s*Gt([0-9]+)/gi, ' (G$1)');
  
  // 2. Normalizuj kody bez nawiasów (obsługuje E-90, F40, G70, itp.)
  cleaned = cleaned.replace(/\s+([EFGU][-]?[0-9]{2,3})\b(?!\))/gi, ' ($1)');
  
  return cleaned;
}

// Test cases
const testCases = [
  "7 Gt2 ławka",
  "7 Gt70", 
  "M6 F06 Gran Coupe",
  "7 Gt2 long",
  "7 Gt2 zwykla",
  "2 Gran Coupe F44",
  "2 Active Tourer F45",
  "3 Gran Tourismo F34",
  "4 F32 Coupe",
  "5 F07 Gran Turismo",
  "1 F40", // już prawidłowy
  "3 E-90", // już prawidłowy
];

console.log('🧪 Testowanie funkcji poprawiania kodów BMW:\n');

testCases.forEach(testCase => {
  const bmwFixed = fixBMWGenerationCode(testCase, 'BMW');
  const normalized = normalizeGenerationCode(bmwFixed);
  const bmwCleaned = cleanBMWModel(testCase);
  
  console.log(`"${testCase}"`);
  console.log(`  BMW fix: "${bmwFixed}"`);
  console.log(`  Normalized: "${normalized}"`);
  console.log(`  BMW cleaned: "${bmwCleaned}"`);
  console.log('');
});
