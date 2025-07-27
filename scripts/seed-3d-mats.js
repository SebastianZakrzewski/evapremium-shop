const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const threeDMatsData = [
  {
    type: '3d',
    color: 'blue',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-blue-black.webp'
  },
  {
    type: '3d',
    color: 'red',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-red-black.webp'
  },
  {
    type: '3d',
    color: 'yellow',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-yellow-black.webp'
  },
  {
    type: '3d',
    color: 'ivory',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-ivory-black.webp'
  },
  {
    type: '3d',
    color: 'darkblue',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-darkblue-black.webp'
  },
  {
    type: '3d',
    color: 'maroon',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-maroon-black.webp'
  },
  {
    type: '3d',
    color: 'orange',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-orange-black.webp'
  },
  {
    type: '3d',
    color: 'lightbeige',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-lightbeige-black.webp'
  },
  {
    type: '3d',
    color: 'darkgrey',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-darkgrey-black.webp'
  },
  {
    type: '3d',
    color: 'purple',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-purple-black.webp'
  },
  {
    type: '3d',
    color: 'lime',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-lime-black.webp'
  },
  {
    type: '3d',
    color: 'beige',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-beige-black.webp'
  },
  {
    type: '3d',
    color: 'pink',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-pink-black.webp'
  },
  {
    type: '3d',
    color: 'black',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-black-black (1).webp'
  },
  {
    type: '3d',
    color: 'darkgreen',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-darkgreen-black.webp'
  },
  {
    type: '3d',
    color: 'brown',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-brown-black.webp'
  },
  {
    type: '3d',
    color: 'white',
    cellType: 'diamonds',
    edgeColor: 'black',
    image: '/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-white-black.webp'
  }
];

async function seedThreeDMats() {
  try {
    console.log('Seeding 3D mats data...');
    
    // Clear existing 3D mats
    await prisma.mats.deleteMany({
      where: {
        type: '3d',
        edgeColor: 'black'
      }
    });
    
    // Insert new 3D mats
    const createdMats = await prisma.mats.createMany({
      data: threeDMatsData
    });
    
    console.log(`Successfully seeded ${createdMats.count} 3D mats`);
    
    // Verify the data
    const count = await prisma.mats.count({
      where: {
        type: '3d',
        edgeColor: 'black'
      }
    });
    
    console.log(`Total 3D mats with black edging: ${count}`);
    
  } catch (error) {
    console.error('Error seeding 3D mats:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedThreeDMats(); 