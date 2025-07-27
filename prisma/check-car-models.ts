import { PrismaClient } from '../src/generated/prisma';
const prisma = new PrismaClient();

async function main() {
  const carModels = await prisma.carModel.findMany({
    include: {
      carBrand: true
    }
  });
  console.log('Zawartość tabeli CarModel:', carModels);
}

main().finally(() => prisma.$disconnect()); 