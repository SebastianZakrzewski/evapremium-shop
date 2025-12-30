import { Accessory, AccessoryCategory } from '@/entities/product';

// Kategorie akcesoriów samochodowych
export const accessoryCategories: AccessoryCategory[] = [
  {
    id: 1,
    name: "Organizery do Bagażnika",
    description: "Praktyczne organizery i systemy do organizacji bagażnika",
    icon: "📦"
  },
  {
    id: 2,
    name: "Podpiętki",
    description: "Eleganckie podpiętki do dywaników samochodowych",
    icon: "🔗"
  }
];

// Akcesoria samochodowe pogrupowane według kategorii
export const accessoriesByCategory: Record<string, Accessory[]> = {
  "Organizery do Bagażnika": [
    {
      id: 1,
      name: "Organizer Bagażnikowy EVA",
      category: "Organizery do Bagażnika",
      price: "149.99 PLN",
      imageSrc: "/images/accessories/trunk-organizer-eva.webp",
      description: "Profesjonalny organizer do bagażnika wykonany z materiału EVA z przegródkami",
      features: ["Materiał EVA", "Wodoodporny", "Przegródki", "Łatwy montaż"],
      inStock: true,
      rating: 4.8
    },
    {
      id: 2,
      name: "System Organizacji Bagażnika",
      category: "Organizery do Bagażnika",
      price: "199.99 PLN",
      imageSrc: "/images/accessories/trunk-system.webp",
      description: "Kompletny system organizacji bagażnika z regulowanymi przegródkami",
      features: ["Regulowane przegródki", "Modularny", "Trwały", "Uniwersalny"],
      inStock: true,
      rating: 4.7
    },
    {
      id: 3,
      name: "Kosze Organizacyjne",
      category: "Organizery do Bagażnika",
      price: "89.99 PLN",
      imageSrc: "/images/accessories/trunk-baskets.webp",
      description: "Zestaw koszy organizacyjnych do bagażnika z antypoślizgowym dnem",
      features: ["Antypoślizgowe dno", "Zestaw 3 szt", "Łatwe czyszczenie", "Kompaktowe"],
      inStock: true,
      rating: 4.6
    },
    {
      id: 4,
      name: "Organizer na Narzędzia",
      category: "Organizery do Bagażnika",
      price: "79.99 PLN",
      imageSrc: "/images/accessories/tool-organizer.webp",
      description: "Specjalny organizer na narzędzia samochodowe z przegródkami",
      features: ["Przegródki na narzędzia", "Zamknięcie", "Trwały materiał", "Praktyczny"],
      inStock: true,
      rating: 4.5
    },
    {
      id: 5,
      name: "Organizer na Buty",
      category: "Organizery do Bagażnika",
      price: "59.99 PLN",
      imageSrc: "/images/accessories/shoe-organizer.webp",
      description: "Organizer na buty do bagażnika z wentylacją",
      features: ["Wentylacja", "Wodoodporny", "Łatwy montaż", "Pojemny"],
      inStock: true,
      rating: 4.4
    }
  ],
  "Podpiętki": [
    {
      id: 6,
      name: "Podpiętki EVA Premium",
      category: "Podpiętki",
      price: "29.99 PLN",
      imageSrc: "/images/accessories/eva-clips.webp",
      description: "Eleganckie podpiętki do dywaników EVA w kolorze czarnym",
      features: ["Materiał EVA", "Czarny kolor", "Zestaw 4 szt", "Trwałe"],
      inStock: true,
      rating: 4.9
    },
    {
      id: 7,
      name: "Podpiętki Metalowe",
      category: "Podpiętki",
      price: "39.99 PLN",
      imageSrc: "/images/accessories/metal-clips.webp",
      description: "Metalowe podpiętki do dywaników z chromowaną powierzchnią",
      features: ["Metal chromowany", "Zestaw 4 szt", "Eleganckie", "Trwałe"],
      inStock: true,
      rating: 4.8
    },
    {
      id: 8,
      name: "Podpiętki Kolorowe",
      category: "Podpiętki",
      price: "24.99 PLN",
      imageSrc: "/images/accessories/colored-clips.webp",
      description: "Kolorowe podpiętki do dywaników w różnych kolorach",
      features: ["Różne kolory", "Zestaw 6 szt", "Plastikowe", "Lekkie"],
      inStock: true,
      rating: 4.6
    },
    {
      id: 9,
      name: "Podpiętki Invisible",
      category: "Podpiętki",
      price: "34.99 PLN",
      imageSrc: "/images/accessories/invisible-clips.webp",
      description: "Niewidoczne podpiętki do dywaników - prawie niezauważalne",
      features: ["Niewidoczne", "Zestaw 4 szt", "Dyskretne", "Skuteczne"],
      inStock: true,
      rating: 4.7
    },
    {
      id: 10,
      name: "Podpiętki Uniwersalne",
      category: "Podpiętki",
      price: "19.99 PLN",
      imageSrc: "/images/accessories/universal-clips.webp",
      description: "Uniwersalne podpiętki pasujące do wszystkich typów dywaników",
      features: ["Uniwersalne", "Zestaw 8 szt", "Tanie", "Praktyczne"],
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