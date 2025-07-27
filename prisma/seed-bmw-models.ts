import { PrismaClient } from '../src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding BMW models...');

  // Najpierw pobierz BMW brand
  const bmwBrand = await prisma.carBrand.findUnique({
    where: { name: 'bmw' }
  });

  if (!bmwBrand) {
    console.log('❌ BMW brand not found. Please run seed-car-brands.ts first.');
    return;
  }

  const bmwModels = [
    // Seria 1
    {
      name: 'Seria 1',
      displayName: 'BMW Seria 1',
      yearFrom: 2004,
      yearTo: 2019,
      generation: 'E81/E82/E87/E88',
      bodyType: 'hatchback',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },
    {
      name: 'Seria 1',
      displayName: 'BMW Seria 1',
      yearFrom: 2019,
      yearTo: null,
      generation: 'F40',
      bodyType: 'hatchback',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },

    // Seria 2
    {
      name: 'Seria 2',
      displayName: 'BMW Seria 2',
      yearFrom: 2014,
      yearTo: 2021,
      generation: 'F22/F23',
      bodyType: 'coupe',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },
    {
      name: 'Seria 2',
      displayName: 'BMW Seria 2',
      yearFrom: 2021,
      yearTo: null,
      generation: 'G42/G43',
      bodyType: 'coupe',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },

    // Seria 3
    {
      name: 'Seria 3',
      displayName: 'BMW Seria 3',
      yearFrom: 2019,
      yearTo: null,
      generation: 'G20/G21',
      bodyType: 'sedan',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },

    // Seria 4
    {
      name: 'Seria 4',
      displayName: 'BMW Seria 4',
      yearFrom: 2013,
      yearTo: 2020,
      generation: 'F32/F33/F36',
      bodyType: 'coupe',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },
    {
      name: 'Seria 4',
      displayName: 'BMW Seria 4',
      yearFrom: 2020,
      yearTo: null,
      generation: 'G22/G23/G26',
      bodyType: 'coupe',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },

    // Seria 5
    {
      name: 'Seria 5',
      displayName: 'BMW Seria 5',
      yearFrom: 2017,
      yearTo: null,
      generation: 'G30/G31',
      bodyType: 'sedan',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },

    // Seria 6
    {
      name: 'Seria 6',
      displayName: 'BMW Seria 6',
      yearFrom: 2011,
      yearTo: 2018,
      generation: 'F06/F12/F13',
      bodyType: 'coupe',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },

    // Seria 7
    {
      name: 'Seria 7',
      displayName: 'BMW Seria 7',
      yearFrom: 2015,
      yearTo: 2022,
      generation: 'G11/G12',
      bodyType: 'sedan',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },
    {
      name: 'Seria 7',
      displayName: 'BMW Seria 7',
      yearFrom: 2022,
      yearTo: null,
      generation: 'G70',
      bodyType: 'sedan',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },

    // Seria 8
    {
      name: 'Seria 8',
      displayName: 'BMW Seria 8',
      yearFrom: 2018,
      yearTo: null,
      generation: 'G14/G15/G16',
      bodyType: 'coupe',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },

    // Modele i (elektryczne/hybrydowe)
    {
      name: 'i3',
      displayName: 'BMW i3',
      yearFrom: 2013,
      yearTo: 2022,
      generation: 'I01',
      bodyType: 'hatchback',
      engineType: 'electric',
      carBrandId: bmwBrand.id
    },

    {
      name: 'i4',
      displayName: 'BMW i4',
      yearFrom: 2021,
      yearTo: null,
      generation: 'G26',
      bodyType: 'sedan',
      engineType: 'electric',
      carBrandId: bmwBrand.id
    },

    {
      name: 'i5',
      displayName: 'BMW i5',
      yearFrom: 2023,
      yearTo: null,
      generation: 'G60',
      bodyType: 'sedan',
      engineType: 'electric',
      carBrandId: bmwBrand.id
    },

    {
      name: 'i7',
      displayName: 'BMW i7',
      yearFrom: 2022,
      yearTo: null,
      generation: 'G70',
      bodyType: 'sedan',
      engineType: 'electric',
      carBrandId: bmwBrand.id
    },

    {
      name: 'i8',
      displayName: 'BMW i8',
      yearFrom: 2014,
      yearTo: 2020,
      generation: 'I12',
      bodyType: 'coupe',
      engineType: 'hybrid',
      carBrandId: bmwBrand.id
    },

    {
      name: 'iX',
      displayName: 'BMW iX',
      yearFrom: 2021,
      yearTo: null,
      generation: 'I20',
      bodyType: 'suv',
      engineType: 'electric',
      carBrandId: bmwBrand.id
    },

    {
      name: 'iX1',
      displayName: 'BMW iX1',
      yearFrom: 2022,
      yearTo: null,
      generation: 'U11',
      bodyType: 'suv',
      engineType: 'electric',
      carBrandId: bmwBrand.id
    },

    {
      name: 'iX2',
      displayName: 'BMW iX2',
      yearFrom: 2024,
      yearTo: null,
      generation: 'U10',
      bodyType: 'suv',
      engineType: 'electric',
      carBrandId: bmwBrand.id
    },

    {
      name: 'iX3',
      displayName: 'BMW iX3',
      yearFrom: 2020,
      yearTo: null,
      generation: 'G08',
      bodyType: 'suv',
      engineType: 'electric',
      carBrandId: bmwBrand.id
    },

    // Modele M
    {
      name: 'M2',
      displayName: 'BMW M2',
      yearFrom: 2016,
      yearTo: 2020,
      generation: 'F87',
      bodyType: 'coupe',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },
    {
      name: 'M2',
      displayName: 'BMW M2',
      yearFrom: 2022,
      yearTo: null,
      generation: 'G87',
      bodyType: 'coupe',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },

    {
      name: 'M3',
      displayName: 'BMW M3',
      yearFrom: 2020,
      yearTo: null,
      generation: 'G80',
      bodyType: 'sedan',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },

    {
      name: 'M4',
      displayName: 'BMW M4',
      yearFrom: 2020,
      yearTo: null,
      generation: 'G82/G83',
      bodyType: 'coupe',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },

    {
      name: 'M5',
      displayName: 'BMW M5',
      yearFrom: 2017,
      yearTo: null,
      generation: 'F90',
      bodyType: 'sedan',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },

    {
      name: 'M6',
      displayName: 'BMW M6',
      yearFrom: 2012,
      yearTo: 2018,
      generation: 'F06/F12/F13',
      bodyType: 'coupe',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },

    {
      name: 'M8',
      displayName: 'BMW M8',
      yearFrom: 2019,
      yearTo: null,
      generation: 'F91/F92/F93',
      bodyType: 'coupe',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },

    // Modele X (SUV)
    {
      name: 'X1',
      displayName: 'BMW X1',
      yearFrom: 2009,
      yearTo: 2015,
      generation: 'E84',
      bodyType: 'suv',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },
    {
      name: 'X1',
      displayName: 'BMW X1',
      yearFrom: 2015,
      yearTo: 2022,
      generation: 'F48',
      bodyType: 'suv',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },
    {
      name: 'X1',
      displayName: 'BMW X1',
      yearFrom: 2022,
      yearTo: null,
      generation: 'U11',
      bodyType: 'suv',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },

    {
      name: 'X2',
      displayName: 'BMW X2',
      yearFrom: 2017,
      yearTo: 2023,
      generation: 'F39',
      bodyType: 'suv',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },
    {
      name: 'X2',
      displayName: 'BMW X2',
      yearFrom: 2023,
      yearTo: null,
      generation: 'U10',
      bodyType: 'suv',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },

    {
      name: 'X3',
      displayName: 'BMW X3',
      yearFrom: 2017,
      yearTo: null,
      generation: 'G01',
      bodyType: 'suv',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },

    {
      name: 'X4',
      displayName: 'BMW X4',
      yearFrom: 2014,
      yearTo: 2018,
      generation: 'F26',
      bodyType: 'suv',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },
    {
      name: 'X4',
      displayName: 'BMW X4',
      yearFrom: 2018,
      yearTo: null,
      generation: 'G02',
      bodyType: 'suv',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },

    {
      name: 'X5',
      displayName: 'BMW X5',
      yearFrom: 2018,
      yearTo: null,
      generation: 'G05',
      bodyType: 'suv',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },

    {
      name: 'X6',
      displayName: 'BMW X6',
      yearFrom: 2014,
      yearTo: 2019,
      generation: 'F16',
      bodyType: 'suv',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },
    {
      name: 'X6',
      displayName: 'BMW X6',
      yearFrom: 2019,
      yearTo: null,
      generation: 'G06',
      bodyType: 'suv',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },

    {
      name: 'X7',
      displayName: 'BMW X7',
      yearFrom: 2019,
      yearTo: null,
      generation: 'G07',
      bodyType: 'suv',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },

    // Modele XM
    {
      name: 'XM',
      displayName: 'BMW XM',
      yearFrom: 2022,
      yearTo: null,
      generation: 'G09',
      bodyType: 'suv',
      engineType: 'hybrid',
      carBrandId: bmwBrand.id
    },

    // Modele XM (M Performance)
    {
      name: 'X1M',
      displayName: 'BMW X1 M',
      yearFrom: 2022,
      yearTo: null,
      generation: 'U11',
      bodyType: 'suv',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },

    {
      name: 'X3M',
      displayName: 'BMW X3 M',
      yearFrom: 2019,
      yearTo: null,
      generation: 'F97',
      bodyType: 'suv',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },

    {
      name: 'X4M',
      displayName: 'BMW X4 M',
      yearFrom: 2019,
      yearTo: null,
      generation: 'F98',
      bodyType: 'suv',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },

    {
      name: 'X5M',
      displayName: 'BMW X5 M',
      yearFrom: 2019,
      yearTo: null,
      generation: 'F95',
      bodyType: 'suv',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },

    {
      name: 'X6M',
      displayName: 'BMW X6 M',
      yearFrom: 2019,
      yearTo: null,
      generation: 'F96',
      bodyType: 'suv',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },

    {
      name: 'X7M',
      displayName: 'BMW X7 M',
      yearFrom: 2020,
      yearTo: null,
      generation: 'F97',
      bodyType: 'suv',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },

    // Modele Z (roadster)
    {
      name: 'Z3',
      displayName: 'BMW Z3',
      yearFrom: 1995,
      yearTo: 2002,
      generation: 'E36/7',
      bodyType: 'roadster',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },

    {
      name: 'Z4',
      displayName: 'BMW Z4',
      yearFrom: 2002,
      yearTo: 2008,
      generation: 'E85/E86',
      bodyType: 'roadster',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },
    {
      name: 'Z4',
      displayName: 'BMW Z4',
      yearFrom: 2009,
      yearTo: 2016,
      generation: 'E89',
      bodyType: 'roadster',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    },
    {
      name: 'Z4',
      displayName: 'BMW Z4',
      yearFrom: 2018,
      yearTo: null,
      generation: 'G29',
      bodyType: 'roadster',
      engineType: 'petrol',
      carBrandId: bmwBrand.id
    }
  ];

  for (const model of bmwModels) {
    try {
      await prisma.carModel.upsert({
        where: {
          name_carBrandId_yearFrom: {
            name: model.name,
            carBrandId: model.carBrandId,
            yearFrom: model.yearFrom
          }
        },
        update: model,
        create: model
      });
      console.log(`✅ Created/Updated BMW model: ${model.displayName} (${model.generation})`);
    } catch (error) {
      console.error(`❌ Error creating BMW model ${model.displayName}:`, error);
    }
  }

  console.log('✅ BMW models seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding BMW models:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 