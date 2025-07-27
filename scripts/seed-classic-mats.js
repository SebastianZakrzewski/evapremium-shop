const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const classicMatsData = [
  {
    type: 'classic',
    color: 'blue',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/dywaniki/klasyczne/czarne obszycie/5os-classic-diamonds-blue-black.webp'
  },
  {
    type: 'classic',
    color: 'red',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/dywaniki/klasyczne/czarne obszycie/5os-classic-diamonds-red-black.webp'
  },
  {
    type: 'classic',
    color: 'yellow',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/dywaniki/klasyczne/czarne obszycie/5os-classic-diamonds-yellow-black.webp'
  },
  {
    type: 'classic',
    color: 'ivory',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/dywaniki/klasyczne/czarne obszycie/5os-classic-diamonds-ivory-black.webp'
  },
  {
    type: 'classic',
    color: 'darkblue',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/dywaniki/klasyczne/czarne obszycie/5os-classic-diamonds-darkblue-black.webp'
  },
  {
    type: 'classic',
    color: 'maroon',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/dywaniki/klasyczne/czarne obszycie/5os-classic-diamonds-maroon-black.webp'
  },
  {
    type: 'classic',
    color: 'orange',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/dywaniki/klasyczne/czarne obszycie/5os-classic-diamonds-orange-black.webp'
  },
  {
    type: 'classic',
    color: 'lightbeige',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/dywaniki/klasyczne/czarne obszycie/5os-classic-diamonds-lightbeige-black.webp'
  },
  {
    type: 'classic',
    color: 'darkgrey',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/dywaniki/klasyczne/czarne obszycie/5os-classic-diamonds-darkgrey-black.webp'
  },
  {
    type: 'classic',
    color: 'purple',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/dywaniki/klasyczne/czarne obszycie/5os-classic-diamonds-purple-black.webp'
  },
  {
    type: 'classic',
    color: 'lime',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/dywaniki/klasyczne/czarne obszycie/5os-classic-diamonds-lime-black.webp'
  },
  {
    type: 'classic',
    color: 'beige',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/dywaniki/klasyczne/czarne obszycie/5os-classic-diamonds-beige-black.webp'
  },
  {
    type: 'classic',
    color: 'pink',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/dywaniki/klasyczne/czarne obszycie/5os-classic-diamonds-pink-black.webp'
  },
  {
    type: 'classic',
    color: 'black',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/dywaniki/klasyczne/czarne obszycie/5os-classic-diamonds-black-black (1).webp'
  },
  {
    type: 'classic',
    color: 'darkgreen',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/dywaniki/klasyczne/czarne obszycie/5os-classic-diamonds-darkgreen-black.webp'
  },
  {
    type: 'classic',
    color: 'brown',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/dywaniki/klasyczne/czarne obszycie/5os-classic-diamonds-brown-black.webp'
  },
  {
    type: 'classic',
    color: 'white',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/dywaniki/klasyczne/czarne obszycie/5os-classic-diamonds-white-black.webp'
  }
];

async function seedClassicMats() {
  try {
    console.log('Seeding classic mats data...');
    
    // Clear existing classic mats with black edging
    await prisma.mats.deleteMany({
      where: {
        type: 'classic',
        edgeColor: 'black'
      }
    });
    
    // Insert new classic mats
    const createdMats = await prisma.mats.createMany({
      data: classicMatsData
    });
    
    console.log(`Successfully seeded ${createdMats.count} classic mats`);
    
    // Verify the data
    const count = await prisma.mats.count({
      where: {
        type: 'classic',
        edgeColor: 'black'
      }
    });
    
    console.log(`Total classic mats with black edging: ${count}`);
    
  } catch (error) {
    console.error('Error seeding classic mats:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedClassicMats(); 