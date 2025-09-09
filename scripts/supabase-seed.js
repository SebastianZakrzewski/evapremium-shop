const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://diqbnsinhsedmvvstvvc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseKey) {
  console.error('❌ Missing Supabase key. Please set SUPABASE_SERVICE_ROLE_KEY environment variable.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample data for seeding
const sampleMats = [
  {
    type: '3d',
    color: 'black',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/3d-black-diamonds-black-edge.webp'
  },
  {
    type: '3d',
    color: 'grey',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/3d-grey-diamonds-black-edge.webp'
  },
  {
    type: 'classic',
    color: 'black',
    cellType: 'squares',
    edgeColor: 'black',
    image: '/images/konfigurator/classic-black-squares-black-edge.webp'
  }
];

const sampleCarBrands = [
  {
    name: 'BMW',
    displayName: 'BMW',
    logo: '/images/logos/bmw.png',
    description: 'Bayerische Motoren Werke GmbH',
    website: 'https://www.bmw.com',
    isActive: true
  },
  {
    name: 'AUDI',
    displayName: 'Audi',
    logo: '/images/logos/audi.png',
    description: 'Audi AG',
    website: 'https://www.audi.com',
    isActive: true
  }
];

const sampleCarModels = [
  {
    name: 'X5',
    displayName: 'BMW X5',
    yearFrom: 2019,
    yearTo: 2024,
    generation: 'G05',
    bodyType: 'SUV',
    engineType: 'Petrol',
    isActive: true,
    carBrandId: 1
  },
  {
    name: 'A4',
    displayName: 'Audi A4',
    yearFrom: 2016,
    yearTo: 2023,
    generation: 'B9',
    bodyType: 'Sedan',
    engineType: 'Petrol',
    isActive: true,
    carBrandId: 2
  }
];

async function clearTables() {
  console.log('🧹 Clearing existing data...');
  
  try {
    // Delete in order due to foreign key constraints
    await supabase.from('car_models').delete().neq('id', 0);
    await supabase.from('car_brands').delete().neq('id', 0);
    await supabase.from('mats').delete().neq('id', 0);
    
    console.log('✅ Tables cleared');
  } catch (error) {
    console.error('❌ Error clearing tables:', error);
    throw error;
  }
}

async function seedMats() {
  console.log('🌱 Seeding mats...');
  
  try {
    const { error } = await supabase
      .from('mats')
      .insert(sampleMats);
    
    if (error) throw error;
    console.log(`✅ Seeded ${sampleMats.length} mats`);
  } catch (error) {
    console.error('❌ Error seeding mats:', error);
    throw error;
  }
}

async function seedCarBrands() {
  console.log('🌱 Seeding car brands...');
  
  try {
    const { data, error } = await supabase
      .from('car_brands')
      .insert(sampleCarBrands)
      .select();
    
    if (error) throw error;
    console.log(`✅ Seeded ${data.length} car brands`);
    return data;
  } catch (error) {
    console.error('❌ Error seeding car brands:', error);
    throw error;
  }
}

async function seedCarModels(carBrands) {
  console.log('🌱 Seeding car models...');
  
  try {
    // Update car model brand IDs based on inserted brands
    const updatedCarModels = sampleCarModels.map(model => {
      const brand = carBrands.find(b => b.name === (model.carBrandId === 1 ? 'BMW' : 'AUDI'));
      return {
        ...model,
        carBrandId: brand.id
      };
    });
    
    const { error } = await supabase
      .from('car_models')
      .insert(updatedCarModels);
    
    if (error) throw error;
    console.log(`✅ Seeded ${updatedCarModels.length} car models`);
  } catch (error) {
    console.error('❌ Error seeding car models:', error);
    throw error;
  }
}

async function verifySeed() {
  console.log('🔍 Verifying seed data...');
  
  try {
    const [matsResult, carBrandsResult, carModelsResult] = await Promise.all([
      supabase.from('mats').select('*', { count: 'exact', head: true }),
      supabase.from('car_brands').select('*', { count: 'exact', head: true }),
      supabase.from('car_models').select('*', { count: 'exact', head: true })
    ]);
    
    console.log(`📊 Seed verification:`);
    console.log(`   Mats: ${matsResult.count || 0}`);
    console.log(`   Car Brands: ${carBrandsResult.count || 0}`);
    console.log(`   Car Models: ${carModelsResult.count || 0}`);
    
    console.log('✅ Seed verification completed');
  } catch (error) {
    console.error('❌ Error verifying seed:', error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting Supabase seeding...');
  console.log(`Supabase URL: ${supabaseUrl}`);
  
  try {
    await clearTables();
    await seedMats();
    const carBrands = await seedCarBrands();
    await seedCarModels(carBrands);
    await verifySeed();
    
    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  }
}

main();
