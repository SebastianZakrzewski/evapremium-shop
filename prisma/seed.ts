import { PrismaClient } from '../src/generated/prisma/index.js';
const prisma = new PrismaClient();

const matsData = [
  { color: "white",      image: "/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-white-black.webp" },
  { color: "pink",       image: "/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-pink-black.webp" },
  { color: "ivory",      image: "/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-ivory-black.webp" },
  { color: "orange",     image: "/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-orange-black.webp" },
  { color: "yellow",     image: "/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-yellow-black.webp" },
  { color: "lime",       image: "/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-lime-black.webp" },
  { color: "purple",     image: "/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-purple-black.webp" },
  { color: "beige",      image: "/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-beige-black.webp" },
  { color: "lightbeige", image: "/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-lightbeige-black.webp" },
  { color: "maroon",     image: "/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-maroon-black.webp" },
  { color: "red",        image: "/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-red-black.webp" },
  { color: "darkgreen",  image: "/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-darkgreen-black.webp" },
  { color: "blue",       image: "/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-blue-black.webp" },
  { color: "darkblue",   image: "/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-darkblue-black.webp" },
  { color: "darkgrey",   image: "/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-darkgrey-black.webp" },
  { color: "brown",      image: "/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-brown-black.webp" },
  { color: "black",      image: "/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-black-black (1).webp" },
  { color: "maroon",     image: "/images/konfigurator/dywaniki/3d/romby/czarne/5os-3d-diamonds-maroon-black copy.webp" },
];

async function main() {
  for (const mat of matsData) {
    await prisma.mats.create({
      data: {
        matType: "3d",
        materialColor: mat.color,
        cellStructure: "diamond",
        borderColor: "black",
        imagePath: mat.image,
      }
    });
  }
  console.log("Dodano wszystkie warianty dywaników!");
}

main().finally(() => prisma.$disconnect()); 