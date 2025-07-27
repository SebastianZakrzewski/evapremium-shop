import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function checkBMWModels() {
  try {
    const bmwModels = await prisma.carModel.findMany({
      where: { 
        carBrand: { name: 'bmw' } 
      },
      include: { 
        carBrand: true 
      },
      orderBy: { 
        name: 'asc' 
      }
    });

    console.log('BMW Models in database:');
    console.log('========================');
    
    bmwModels.forEach(model => {
      const yearRange = model.yearTo ? `${model.yearFrom}-${model.yearTo}` : `${model.yearFrom}-present`;
      console.log(`- ${model.displayName} (${model.generation}) [${yearRange}] - ${model.bodyType}`);
    });

    console.log(`\nTotal BMW models: ${bmwModels.length}`);
    
    // Group by body type
    const bodyTypes = {};
    bmwModels.forEach(model => {
      if (!bodyTypes[model.bodyType]) {
        bodyTypes[model.bodyType] = [];
      }
      bodyTypes[model.bodyType].push(model.displayName);
    });

    console.log('\nModels by body type:');
    console.log('====================');
    Object.entries(bodyTypes).forEach(([bodyType, models]) => {
      console.log(`\n${bodyType.toUpperCase()}:`);
      models.forEach(model => console.log(`  - ${model}`));
    });

  } catch (error) {
    console.error('Error checking BMW models:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBMWModels(); 