import { Brand, Model, CarouselItem } from '../types/carousel';

// Marki samochodów z rzeczywistymi zdjęciami
export const brands: Brand[] = [
  {
    id: 1,
    name: "Audi",
    logo: "/images/products/audi.jpg",
    description: "Niemiecka marka premium"
  },
  {
    id: 2,
    name: "BMW",
    logo: "/images/products/bmw.png", 
    description: "Niemiecka marka sportowa"
  },
  {
    id: 3,
    name: "Mercedes",
    logo: "/images/products/mercedes.jpg",
    description: "Niemiecka marka luksusowa"
  },
  {
    id: 4,
    name: "Tesla",
    logo: "/images/products/tesla.avif",
    description: "Amerykańska marka elektryczna"
  },
  {
    id: 5,
    name: "Porsche",
    logo: "/images/products/porsche.png",
    description: "Niemiecka marka sportowa"
  },
  {
    id: 6,
    name: "Acura",
    logo: "/images/products/acura.avif",
    description: "Japońska marka premium"
  },
  {
    id: 7,
    name: "Alfa Romeo",
    logo: "/images/products/alfa_romeo.jpg",
    description: "Włoska marka sportowa"
  },
  {
    id: 8,
    name: "Aston Martin",
    logo: "/images/products/aston_martin.avif",
    description: "Brytyjska marka luksusowa"
  },
  {
    id: 9,
    name: "BAIC",
    logo: "/images/products/baic2.webp",
    description: "Chińska marka samochodowa"
  }
];

// Modele samochodów pogrupowane według marek z rzeczywistymi zdjęciami
export const modelsByBrand: Record<string, Model[]> = {
  "Audi": [
    {
      id: 1,
      name: "A4",
      brand: "Audi",
      year: 2025,
      imageSrc: "/images/products/audi.jpg",
      price: "180,000 PLN",
      description: "Nowoczesny sedan premium"
    },
    {
      id: 2,
      name: "A6",
      brand: "Audi", 
      year: 2024,
      imageSrc: "/images/products/audi.jpg",
      price: "250,000 PLN",
      description: "Luksusowy sedan"
    },
    {
      id: 3,
      name: "Q5",
      brand: "Audi",
      year: 2024,
      imageSrc: "/images/products/audi.jpg",
      price: "220,000 PLN",
      description: "SUV premium"
    }
  ],
  "BMW": [
    {
      id: 4,
      name: "X5",
      brand: "BMW",
      year: 2024,
      imageSrc: "/images/products/bmw.png",
      price: "320,000 PLN",
      description: "Luksusowy SUV"
    },
    {
      id: 5,
      name: "X3",
      brand: "BMW",
      year: 2024,
      imageSrc: "/images/products/bmw.png",
      price: "280,000 PLN",
      description: "Kompaktowy SUV"
    },
    {
      id: 6,
      name: "3 Series",
      brand: "BMW",
      year: 2024,
      imageSrc: "/images/products/bmw.png",
      price: "200,000 PLN",
      description: "Sportowy sedan"
    }
  ],
  "Mercedes-Benz": [
    {
      id: 7,
      name: "C-Class",
      brand: "Mercedes-Benz",
      year: 2024,
      imageSrc: "/images/products/mercedes.jpg",
      price: "220,000 PLN",
      description: "Elegancki sedan"
    },
    {
      id: 8,
      name: "E-Class",
      brand: "Mercedes-Benz",
      year: 2024,
      imageSrc: "/images/products/mercedes.jpg",
      price: "350,000 PLN",
      description: "Luksusowy sedan"
    }
  ],
  "Tesla": [
    {
      id: 9,
      name: "Model 3",
      brand: "Tesla",
      year: 2024,
      imageSrc: "/images/products/tesla.avif",
      price: "280,000 PLN",
      description: "Elektryczny sedan"
    },
    {
      id: 10,
      name: "Model Y",
      brand: "Tesla",
      year: 2024,
      imageSrc: "/images/products/tesla.avif",
      price: "320,000 PLN",
      description: "Elektryczny SUV"
    }
  ],
  "Porsche": [
    {
      id: 11,
      name: "911",
      brand: "Porsche",
      year: 2024,
      imageSrc: "/images/products/porsche.png",
      price: "450,000 PLN",
      description: "Legendarny sportowy"
    },
    {
      id: 12,
      name: "Cayenne",
      brand: "Porsche",
      year: 2024,
      imageSrc: "/images/products/porsche.png",
      price: "380,000 PLN",
      description: "Sportowy SUV"
    }
  ],
  "Acura": [
    {
      id: 13,
      name: "TLX",
      brand: "Acura",
      year: 2024,
      imageSrc: "/images/products/acura.avif",
      price: "180,000 PLN",
      description: "Luksusowy sedan"
    },
    {
      id: 14,
      name: "RDX",
      brand: "Acura",
      year: 2024,
      imageSrc: "/images/products/acura.avif",
      price: "220,000 PLN",
      description: "Kompaktowy SUV premium"
    },
    {
      id: 15,
      name: "MDX",
      brand: "Acura",
      year: 2024,
      imageSrc: "/images/products/acura.avif",
      price: "280,000 PLN",
      description: "Luksusowy SUV"
    }
  ],
  "Alfa Romeo": [
    {
      id: 16,
      name: "Giulia",
      brand: "Alfa Romeo",
      year: 2024,
      imageSrc: "/images/products/alfa_romeo.jpg",
      price: "200,000 PLN",
      description: "Sportowy sedan"
    },
    {
      id: 17,
      name: "Stelvio",
      brand: "Alfa Romeo",
      year: 2024,
      imageSrc: "/images/products/alfa_romeo.jpg",
      price: "250,000 PLN",
      description: "Sportowy SUV"
    },
    {
      id: 18,
      name: "Tonale",
      brand: "Alfa Romeo",
      year: 2024,
      imageSrc: "/images/products/alfa_romeo.jpg",
      price: "180,000 PLN",
      description: "Kompaktowy SUV"
    }
  ],
  "Aston Martin": [
    {
      id: 19,
      name: "DB11",
      brand: "Aston Martin",
      year: 2024,
      imageSrc: "/images/products/aston_martin.avif",
      price: "800,000 PLN",
      description: "Luksusowy grand tourer"
    },
    {
      id: 20,
      name: "Vantage",
      brand: "Aston Martin",
      year: 2024,
      imageSrc: "/images/products/aston_martin.avif",
      price: "600,000 PLN",
      description: "Sportowy coupe"
    },
    {
      id: 21,
      name: "DBX",
      brand: "Aston Martin",
      year: 2024,
      imageSrc: "/images/products/aston_martin.avif",
      price: "900,000 PLN",
      description: "Luksusowy SUV"
    }
  ],
  "BAIC": [
    {
      id: 22,
      name: "EU5",
      brand: "BAIC",
      year: 2024,
      imageSrc: "/images/products/baic2.webp",
      price: "120,000 PLN",
      description: "Elektryczny sedan"
    },
    {
      id: 23,
      name: "EX5",
      brand: "BAIC",
      year: 2024,
      imageSrc: "/images/products/baic2.webp",
      price: "140,000 PLN",
      description: "Elektryczny SUV"
    },
    {
      id: 24,
      name: "EU7",
      brand: "BAIC",
      year: 2024,
      imageSrc: "/images/products/baic2.webp",
      price: "160,000 PLN",
      description: "Luksusowy sedan elektryczny"
    }
  ]
};

// Funkcje pomocnicze
export const getModelsByBrand = (brandName: string): Model[] => {
  return modelsByBrand[brandName] || [];
};

export const getBrandByName = (brandName: string): Brand | undefined => {
  return brands.find(brand => brand.name === brandName);
};

export const getAllModels = (): Model[] => {
  return Object.values(modelsByBrand).flat();
}; 