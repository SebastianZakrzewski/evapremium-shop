import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding car brands...');

  const carBrands = [
    {
      name: 'audi',
      displayName: 'Audi',
      logo: '/images/products/audi.jpg',
      description: 'German luxury car manufacturer',
      website: 'https://www.audi.com',
      isActive: true
    },
    {
      name: 'bmw',
      displayName: 'BMW',
      logo: '/images/products/bmw.png',
      description: 'German luxury car manufacturer',
      website: 'https://www.bmw.com',
      isActive: true
    },
    {
      name: 'mercedes',
      displayName: 'Mercedes-Benz',
      logo: '/images/products/mercedes.jpg',
      description: 'German luxury car manufacturer',
      website: 'https://www.mercedes-benz.com',
      isActive: true
    },
    {
      name: 'porsche',
      displayName: 'Porsche',
      logo: '/images/products/porsche.png',
      description: 'German sports car manufacturer',
      website: 'https://www.porsche.com',
      isActive: true
    },
    {
      name: 'tesla',
      displayName: 'Tesla',
      logo: '/images/products/tesla.avif',
      description: 'American electric vehicle manufacturer',
      website: 'https://www.tesla.com',
      isActive: true
    }
  ];

  for (const carBrand of carBrands) {
    try {
      await prisma.carBrand.upsert({
        where: { name: carBrand.name },
        update: carBrand,
        create: carBrand
      });
      console.log(`✅ Created/Updated car brand: ${carBrand.displayName}`);
    } catch (error) {
      console.error(`❌ Error creating car brand ${carBrand.name}:`, error);
    }
  }

  console.log('✅ Car brands seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding car brands:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 