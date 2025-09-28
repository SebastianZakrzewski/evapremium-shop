import { Accessory, AccessoryCategory } from '../types/accessory';

// Kategorie akcesoriów samochodowych
export const accessoryCategories: AccessoryCategory[] = [
  {
    id: 1,
    name: "Ochrona",
    description: "Akcesoria ochronne do wnętrza samochodu",
    icon: "🛡️"
  },
  {
    id: 2,
    name: "Organizacja",
    description: "Organizery i schowki do samochodu",
    icon: "📦"
  },
  {
    id: 3,
    name: "Elektronika",
    description: "Akcesoria elektroniczne i ładowarki",
    icon: "⚡"
  },
  {
    id: 4,
    name: "Komfort",
    description: "Akcesoria zwiększające komfort jazdy",
    icon: "🪑"
  },
  {
    id: 5,
    name: "Czyszczenie",
    description: "Środki i akcesoria do czyszczenia",
    icon: "🧽"
  },
  {
    id: 6,
    name: "Bezpieczeństwo",
    description: "Akcesoria bezpieczeństwa i ratunkowe",
    icon: "🚨"
  }
];

// Akcesoria samochodowe pogrupowane według kategorii
export const accessoriesByCategory: Record<string, Accessory[]> = {
  "Ochrona": [
    {
      id: 1,
      name: "Osłona na desce rozdzielczej",
      category: "Ochrona",
      price: "89.99 PLN",
      imageSrc: "/images/accessories/dashboard-cover.webp",
      description: "Ochronna osłona na deskę rozdzielczą, zapobiega blaknięciu i pękaniu",
      features: ["UV Protection", "Easy Installation", "Perfect Fit"],
      inStock: true,
      rating: 4.8
    },
    {
      id: 2,
      name: "Osłona na siedzenia",
      category: "Ochrona",
      price: "149.99 PLN",
      imageSrc: "/images/accessories/seat-covers.webp",
      description: "Wodoodporne osłony na siedzenia z materiału EVA",
      features: ["Waterproof", "Easy Clean", "Durable Material"],
      inStock: true,
      rating: 4.6
    },
    {
      id: 3,
      name: "Osłona na kierownicę",
      category: "Ochrona",
      price: "39.99 PLN",
      imageSrc: "/images/accessories/steering-cover.webp",
      description: "Skórzana osłona na kierownicę z antypoślizgowym materiałem",
      features: ["Anti-slip", "Leather Material", "Easy Grip"],
      inStock: true,
      rating: 4.5
    }
  ],
  "Organizacja": [
    {
      id: 4,
      name: "Organizer na konsolę",
      category: "Organizacja",
      price: "59.99 PLN",
      imageSrc: "/images/accessories/console-organizer.webp",
      description: "Praktyczny organizer na konsolę środkową z przegródkami",
      features: ["Multiple Compartments", "Non-slip Base", "Easy Access"],
      inStock: true,
      rating: 4.7
    },
    {
      id: 5,
      name: "Schowek na bagażnik",
      category: "Organizacja",
      price: "79.99 PLN",
      imageSrc: "/images/accessories/trunk-organizer.webp",
      description: "Elastyczny organizer do bagażnika z przegródkami",
      features: ["Collapsible", "Waterproof", "Multiple Pockets"],
      inStock: true,
      rating: 4.4
    },
    {
      id: 6,
      name: "Wieszak na ubrania",
      category: "Organizacja",
      price: "29.99 PLN",
      imageSrc: "/images/accessories/clothes-hanger.webp",
      description: "Elegancki wieszak na ubrania do samochodu",
      features: ["Sturdy Construction", "Easy Installation", "Space Saving"],
      inStock: true,
      rating: 4.3
    }
  ],
  "Elektronika": [
    {
      id: 7,
      name: "Ładowarka bezprzewodowa",
      category: "Elektronika",
      price: "129.99 PLN",
      imageSrc: "/images/accessories/wireless-charger.webp",
      description: "Szybka ładowarka bezprzewodowa z podkładką",
      features: ["Fast Charging", "Qi Compatible", "LED Indicator"],
      inStock: true,
      rating: 4.9
    },
    {
      id: 8,
      name: "Adapter USB-C",
      category: "Elektronika",
      price: "24.99 PLN",
      imageSrc: "/images/accessories/usb-adapter.webp",
      description: "Adapter USB-C z 3 portami do ładowania",
      features: ["3 USB Ports", "Fast Charging", "Compact Design"],
      inStock: true,
      rating: 4.6
    },
    {
      id: 9,
      name: "Kamera cofania",
      category: "Elektronika",
      price: "199.99 PLN",
      imageSrc: "/images/accessories/backup-camera.webp",
      description: "Kamera cofania z wyświetlaczem 7 cali",
      features: ["7-inch Display", "Night Vision", "Easy Installation"],
      inStock: true,
      rating: 4.7
    }
  ],
  "Komfort": [
    {
      id: 10,
      name: "Poduszka lędźwiowa",
      category: "Komfort",
      price: "49.99 PLN",
      imageSrc: "/images/accessories/lumbar-pillow.webp",
      description: "Ergonomiczna poduszka lędźwiowa z pamięcią kształtu",
      features: ["Memory Foam", "Ergonomic Design", "Removable Cover"],
      inStock: true,
      rating: 4.8
    },
    {
      id: 11,
      name: "Podkładka na siedzenie",
      category: "Komfort",
      price: "89.99 PLN",
      imageSrc: "/images/accessories/seat-cushion.webp",
      description: "Gelowa podkładka na siedzenie z efektem chłodzenia",
      features: ["Cooling Gel", "Non-slip", "Breathable"],
      inStock: true,
      rating: 4.5
    },
    {
      id: 12,
      name: "Podnóżek dla dzieci",
      category: "Komfort",
      price: "69.99 PLN",
      imageSrc: "/images/accessories/kids-footrest.webp",
      description: "Regulowany podnóżek dla dzieci z antypoślizgową powierzchnią",
      features: ["Adjustable Height", "Anti-slip", "Easy Clean"],
      inStock: true,
      rating: 4.6
    }
  ],
  "Czyszczenie": [
    {
      id: 13,
      name: "Zestaw do czyszczenia EVA",
      category: "Czyszczenie",
      price: "39.99 PLN",
      imageSrc: "/images/accessories/cleaning-kit.webp",
      description: "Profesjonalny zestaw do czyszczenia dywaników EVA",
      features: ["Specialized Brush", "Cleaning Solution", "Microfiber Cloth"],
      inStock: true,
      rating: 4.7
    },
    {
      id: 14,
      name: "Odświeżacz powietrza",
      category: "Czyszczenie",
      price: "19.99 PLN",
      imageSrc: "/images/accessories/air-freshener.webp",
      description: "Naturalny odświeżacz powietrza z olejkami eterycznymi",
      features: ["Natural Oils", "Long Lasting", "Pleasant Scent"],
      inStock: true,
      rating: 4.4
    },
    {
      id: 15,
      name: "Środek do czyszczenia skóry",
      category: "Czyszczenie",
      price: "29.99 PLN",
      imageSrc: "/images/accessories/leather-cleaner.webp",
      description: "Delikatny środek do czyszczenia skórzanych elementów",
      features: ["Leather Safe", "Moisturizing", "Easy Application"],
      inStock: true,
      rating: 4.6
    }
  ],
  "Bezpieczeństwo": [
    {
      id: 16,
      name: "Apteczka samochodowa",
      category: "Bezpieczeństwo",
      price: "79.99 PLN",
      imageSrc: "/images/accessories/first-aid-kit.webp",
      description: "Kompletna apteczka samochodowa zgodna z normami",
      features: ["Complete Kit", "Norm Compliant", "Compact Design"],
      inStock: true,
      rating: 4.8
    },
    {
      id: 17,
      name: "Gaśnica samochodowa",
      category: "Bezpieczeństwo",
      price: "59.99 PLN",
      imageSrc: "/images/accessories/fire-extinguisher.webp",
      description: "Gaśnica samochodowa 1kg z certyfikatem",
      features: ["1kg Capacity", "Certified", "Easy Mount"],
      inStock: true,
      rating: 4.9
    },
    {
      id: 18,
      name: "Trójkąt ostrzegawczy",
      category: "Bezpieczeństwo",
      price: "24.99 PLN",
      imageSrc: "/images/accessories/warning-triangle.webp",
      description: "Trójkąt ostrzegawczy z odblaskowymi elementami",
      features: ["Reflective", "Foldable", "Durable"],
      inStock: true,
      rating: 4.5
    }
  ]
};

// Funkcje pomocnicze
export const getAccessoriesByCategory = (categoryName: string): Accessory[] => {
  return accessoriesByCategory[categoryName] || [];
};

export const getCategoryByName = (categoryName: string): AccessoryCategory | undefined => {
  return accessoryCategories.find(category => category.name === categoryName);
};

export const getAllAccessories = (): Accessory[] => {
  return Object.values(accessoriesByCategory).flat();
};

export const getAccessoryById = (id: number): Accessory | undefined => {
  return getAllAccessories().find(accessory => accessory.id === id);
};
