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
  },
  {
    id: 10,
    name: "Bentley",
    logo: "/images/products/bentley.webp",
    description: "Brytyjska marka luksusowa"
  },
  {
    id: 11,
    name: "Bugatti",
    logo: "/images/products/bugatti.jpg",
    description: "Francuska marka supersportowa"
  },
  {
    id: 12,
    name: "Buick",
    logo: "/images/products/buick.avif",
    description: "Amerykańska marka premium"
  },
  {
    id: 13,
    name: "Cadillac",
    logo: "/images/products/cadilac.jpeg",
    description: "Amerykańska marka luksusowa"
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
  ],
  "Bentley": [
    {
      id: 25,
      name: "Continental GT",
      brand: "Bentley",
      year: 2024,
      imageSrc: "/images/products/bentley.webp",
      price: "1,200,000 PLN",
      description: "Luksusowy grand tourer"
    },
    {
      id: 26,
      name: "Bentayga",
      brand: "Bentley",
      year: 2024,
      imageSrc: "/images/products/bentley.webp",
      price: "1,500,000 PLN",
      description: "Luksusowy SUV"
    },
    {
      id: 27,
      name: "Flying Spur",
      brand: "Bentley",
      year: 2024,
      imageSrc: "/images/products/bentley.webp",
      price: "1,800,000 PLN",
      description: "Luksusowy sedan"
    }
  ],
  "Bugatti": [
    {
      id: 28,
      name: "Chiron",
      brand: "Bugatti",
      year: 2024,
      imageSrc: "/images/products/bugatti.jpg",
      price: "15,000,000 PLN",
      description: "Supersportowy hypercar"
    },
    {
      id: 29,
      name: "Veyron",
      brand: "Bugatti",
      year: 2024,
      imageSrc: "/images/products/bugatti.jpg",
      price: "12,000,000 PLN",
      description: "Legendarny supersportowy"
    },
    {
      id: 30,
      name: "Divo",
      brand: "Bugatti",
      year: 2024,
      imageSrc: "/images/products/bugatti.jpg",
      price: "18,000,000 PLN",
      description: "Track-focused hypercar"
    }
  ],
  "Buick": [
    {
      id: 31,
      name: "Enclave",
      brand: "Buick",
      year: 2024,
      imageSrc: "/images/products/buick.avif",
      price: "200,000 PLN",
      description: "Luksusowy SUV"
    },
    {
      id: 32,
      name: "Encore",
      brand: "Buick",
      year: 2024,
      imageSrc: "/images/products/buick.avif",
      price: "150,000 PLN",
      description: "Kompaktowy SUV"
    },
    {
      id: 33,
      name: "LaCrosse",
      brand: "Buick",
      year: 2024,
      imageSrc: "/images/products/buick.avif",
      price: "180,000 PLN",
      description: "Luksusowy sedan"
    }
  ],
  "Cadillac": [
    {
      id: 34,
      name: "Escalade",
      brand: "Cadillac",
      year: 2024,
      imageSrc: "/images/products/cadilac.jpeg",
      price: "400,000 PLN",
      description: "Luksusowy SUV"
    },
    {
      id: 35,
      name: "CT5",
      brand: "Cadillac",
      year: 2024,
      imageSrc: "/images/products/cadilac.jpeg",
      price: "250,000 PLN",
      description: "Sportowy sedan"
    },
    {
      id: 36,
      name: "XT6",
      brand: "Cadillac",
      year: 2024,
      imageSrc: "/images/products/cadilac.jpeg",
      price: "300,000 PLN",
      description: "Luksusowy crossover"
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