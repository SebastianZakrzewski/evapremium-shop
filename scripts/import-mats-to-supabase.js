const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env' });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration!');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Load mapped data
const mappedDataPath = path.join(__dirname, '..', 'mapped-dywaniki.json');

if (!fs.existsSync(mappedDataPath)) {
  console.error('❌ File mapped-dywaniki.json not found!');
  console.error('Please run map-dywaniki-to-mats.js first.');
  process.exit(1);
}

const mappedData = JSON.parse(fs.readFileSync(mappedDataPath, 'utf8'));

console.log('🚀 Starting import to Supabase...');
console.log(`📊 Total records to import: ${mappedData.records.length}`);
console.log(`🔗 Supabase URL: ${supabaseUrl}`);

// Function to import records in batches
async function importRecords() {
  const batchSize = 100; // Import in batches of 100
  const totalRecords = mappedData.records.length;
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  console.log(`\n📦 Importing in batches of ${batchSize}...`);

  for (let i = 0; i < totalRecords; i += batchSize) {
    const batch = mappedData.records.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(totalRecords / batchSize);

    console.log(`\n🔄 Processing batch ${batchNumber}/${totalBatches} (${batch.length} records)...`);

    try {
      // Transform data to match Supabase schema
      const transformedBatch = batch.map(record => ({
        matType: record.type,
        cellStructure: record.cellType,
        materialColor: record.color,
        borderColor: record.edgeColor,
        imagePath: record.image
      }));

      const { data, error } = await supabase
        .from('Mats')
        .insert(transformedBatch);

      if (error) {
        console.error(`❌ Error in batch ${batchNumber}:`, error.message);
        errorCount += batch.length;
        errors.push({
          batch: batchNumber,
          error: error.message,
          records: batch.length
        });
      } else {
        console.log(`✅ Batch ${batchNumber} imported successfully!`);
        successCount += batch.length;
      }

      // Progress indicator
      const progress = Math.round((i + batch.length) / totalRecords * 100);
      console.log(`📈 Progress: ${progress}% (${i + batch.length}/${totalRecords})`);

    } catch (err) {
      console.error(`💥 Exception in batch ${batchNumber}:`, err.message);
      errorCount += batch.length;
      errors.push({
        batch: batchNumber,
        error: err.message,
        records: batch.length
      });
    }

    // Small delay between batches to avoid rate limiting
    if (i + batchSize < totalRecords) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return { successCount, errorCount, errors };
}

// Function to verify import
async function verifyImport() {
  console.log('\n🔍 Verifying import...');
  
  try {
    const { data, error } = await supabase
      .from('Mats')
      .select('*', { count: 'exact' });

    if (error) {
      console.error('❌ Error verifying import:', error.message);
      return;
    }

    console.log(`✅ Verification successful!`);
    console.log(`📊 Total records in database: ${data.length}`);
    
    // Show some sample records
    if (data.length > 0) {
      console.log('\n📋 Sample records:');
      data.slice(0, 3).forEach((record, index) => {
        console.log(`  ${index + 1}. ${record.type} - ${record.color} - ${record.cellType} - ${record.edgeColor}`);
      });
    }

  } catch (err) {
    console.error('💥 Exception during verification:', err.message);
  }
}

// Main execution
async function main() {
  try {
    console.log('🧪 Testing connection first...');
    
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('Mats')
      .select('*')
      .limit(1);

    if (testError) {
      console.error('❌ Connection test failed:', testError.message);
      process.exit(1);
    }

    console.log('✅ Connection test successful!');

    // Import records
    const { successCount, errorCount, errors } = await importRecords();

    // Summary
    console.log('\n📊 IMPORT SUMMARY:');
    console.log(`✅ Successfully imported: ${successCount} records`);
    console.log(`❌ Failed to import: ${errorCount} records`);
    console.log(`📈 Success rate: ${Math.round(successCount / (successCount + errorCount) * 100)}%`);

    if (errors.length > 0) {
      console.log('\n❌ ERRORS:');
      errors.forEach(error => {
        console.log(`  Batch ${error.batch}: ${error.error} (${error.records} records)`);
      });
    }

    // Verify import
    await verifyImport();

    console.log('\n🎉 Import process completed!');

  } catch (err) {
    console.error('💥 Fatal error:', err.message);
    process.exit(1);
  }
}

// Run the import
main();

