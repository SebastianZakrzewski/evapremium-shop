const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const prisma = new PrismaClient();
const supabaseUrl = process.env.SUPABASE_URL || 'https://diqbnsinhsedmvvstvvc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseKey) {
  console.error('❌ Missing Supabase key. Please set SUPABASE_SERVICE_ROLE_KEY environment variable.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateMats() {
  console.log('🔄 Migrating mats...');
  
  try {
    const mats = await prisma.mats.findMany();
    console.log(`Found ${mats.length} mats to migrate`);
    
    if (mats.length === 0) {
      console.log('No mats to migrate');
      return;
    }

    // Insert mats in batches of 100
    const batchSize = 100;
    for (let i = 0; i < mats.length; i += batchSize) {
      const batch = mats.slice(i, i + batchSize);
      const { error } = await supabase
        .from('mats')
        .insert(batch);
      
      if (error) {
        console.error('Error inserting mats batch:', error);
        throw error;
      }
      
      console.log(`Migrated batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(mats.length / batchSize)}`);
    }
    
    console.log('✅ Mats migrated successfully');
  } catch (error) {
    console.error('❌ Error migrating mats:', error);
    throw error;
  }
}

async function migrateCarBrands() {
  console.log('🔄 Migrating car brands...');
  
  try {
    const carBrands = await prisma.carBrand.findMany();
    console.log(`Found ${carBrands.length} car brands to migrate`);
    
    if (carBrands.length === 0) {
      console.log('No car brands to migrate');
      return;
    }

    const { error } = await supabase
      .from('car_brands')
      .insert(carBrands);
    
    if (error) {
      console.error('Error inserting car brands:', error);
      throw error;
    }
    
    console.log('✅ Car brands migrated successfully');
  } catch (error) {
    console.error('❌ Error migrating car brands:', error);
    throw error;
  }
}

async function migrateCarModels() {
  console.log('🔄 Migrating car models...');
  
  try {
    const carModels = await prisma.carModel.findMany();
    console.log(`Found ${carModels.length} car models to migrate`);
    
    if (carModels.length === 0) {
      console.log('No car models to migrate');
      return;
    }

    const { error } = await supabase
      .from('car_models')
      .insert(carModels);
    
    if (error) {
      console.error('Error inserting car models:', error);
      throw error;
    }
    
    console.log('✅ Car models migrated successfully');
  } catch (error) {
    console.error('❌ Error migrating car models:', error);
    throw error;
  }
}

async function verifyMigration() {
  console.log('🔍 Verifying migration...');
  
  try {
    const [matsCount, carBrandsCount, carModelsCount] = await Promise.all([
      supabase.from('mats').select('*', { count: 'exact', head: true }),
      supabase.from('car_brands').select('*', { count: 'exact', head: true }),
      supabase.from('car_models').select('*', { count: 'exact', head: true })
    ]);
    
    console.log(`📊 Migration verification:`);
    console.log(`   Mats: ${matsCount.count || 0}`);
    console.log(`   Car Brands: ${carBrandsCount.count || 0}`);
    console.log(`   Car Models: ${carModelsCount.count || 0}`);
    
    console.log('✅ Migration verification completed');
  } catch (error) {
    console.error('❌ Error verifying migration:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting migration to Supabase...');
  console.log(`Supabase URL: ${supabaseUrl}`);
  
  try {
    await migrateMats();
    await migrateCarBrands();
    await migrateCarModels();
    await verifyMigration();
    
    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
