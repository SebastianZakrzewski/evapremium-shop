import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Najpierw pobierz istniejące marki aut
  const brands = await prisma.carBrand.findMany();
  
  if (brands.length === 0) {
    console.log('Brak marek aut w bazie danych. Najpierw uruchom seed-car-brands.ts');
    return;
  }

  // Przykładowe modele aut dla różnych marek
  const carModels = [
    // BMW
    {
      name: 'Seria 3',
      displayName: 'BMW Seria 3',
      yearFrom: 2019,
      yearTo: null,
      generation: 'G20',
      bodyType: 'sedan',
      engineType: 'petrol',
      carBrandId: brands.find(b => b.name === 'bmw')?.id
    },
    {
      name: 'X5',
      displayName: 'BMW X5',
      yearFrom: 2018,
      yearTo: null,
      generation: 'G05',
      bodyType: 'suv',
      engineType: 'petrol',
      carBrandId: brands.find(b => b.name === 'bmw')?.id
    },
    
    // Mercedes
    {
      name: 'Klasa C',
      displayName: 'Mercedes-Benz Klasa C',
      yearFrom: 2021,
      yearTo: null,
      generation: 'W206',
      bodyType: 'sedan',
      engineType: 'petrol',
      carBrandId: brands.find(b => b.name === 'mercedes')?.id
    },
    {
      name: 'GLE',
      displayName: 'Mercedes-Benz GLE',
      yearFrom: 2019,
      yearTo: null,
      generation: 'W167',
      bodyType: 'suv',
      engineType: 'petrol',
      carBrandId: brands.find(b => b.name === 'mercedes')?.id
    },
    
    // Audi
    {
      name: 'A4',
      displayName: 'Audi A4',
      yearFrom: 2020,
      yearTo: null,
      generation: 'B9',
      bodyType: 'sedan',
      engineType: 'petrol',
      carBrandId: brands.find(b => b.name === 'audi')?.id
    },
    {
      name: 'Q5',
      displayName: 'Audi Q5',
      yearFrom: 2017,
      yearTo: null,
      generation: 'FY',
      bodyType: 'suv',
      engineType: 'petrol',
      carBrandId: brands.find(b => b.name === 'audi')?.id
    },
    
    // Porsche
    {
      name: '911',
      displayName: 'Porsche 911',
      yearFrom: 2019,
      yearTo: null,
      generation: '992',
      bodyType: 'coupe',
      engineType: 'petrol',
      carBrandId: brands.find(b => b.name === 'porsche')?.id
    },
    {
      name: 'Cayenne',
      displayName: 'Porsche Cayenne',
      yearFrom: 2018,
      yearTo: null,
      generation: 'E3',
      bodyType: 'suv',
      engineType: 'petrol',
      carBrandId: brands.find(b => b.name === 'porsche')?.id
    },
    
    // Tesla
    {
      name: 'Model 3',
      displayName: 'Tesla Model 3',
      yearFrom: 2017,
      yearTo: null,
      generation: '1',
      bodyType: 'sedan',
      engineType: 'electric',
      carBrandId: brands.find(b => b.name === 'tesla')?.id
    },
    {
      name: 'Model Y',
      displayName: 'Tesla Model Y',
      yearFrom: 2020,
      yearTo: null,
      generation: '1',
      bodyType: 'suv',
      engineType: 'electric',
      carBrandId: brands.find(b => b.name === 'tesla')?.id
    }
  ];

  // Filtruj modele, które mają przypisaną markę
  const validModels = carModels.filter(model => model.carBrandId);

  for (const model of validModels) {
    try {
      await prisma.carModel.upsert({
        where: {
          name_carBrandId_yearFrom: {
            name: model.name,
            carBrandId: model.carBrandId!,
            yearFrom: model.yearFrom!
          }
        },
        update: model,
        create: model
      });
      console.log(`Dodano/zaktualizowano model: ${model.displayName}`);
    } catch (error) {
      console.error(`Błąd podczas dodawania modelu ${model.displayName}:`, error);
    }
  }

  console.log('Seedowanie modeli aut zakończone!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 