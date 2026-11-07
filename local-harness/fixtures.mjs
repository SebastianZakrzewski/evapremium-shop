/** Atrapa katalogu i cen. Nie łączy się z bazą. Ceny nie są cennikiem produkcyjnym. */

export const brands = [
  { key: "hyundai", name: "Hyundai", displayName: "Hyundai" },
  { key: "bmw", name: "BMW", displayName: "BMW" },
]

export const catalogModels = {
  hyundai: [
    {
      brand: "Hyundai",
      brandDisplay: "Hyundai",
      model: "Tucson",
      modelDisplay: "Tucson",
      modelFamilyKey: "tucson",
      modelImage: null,
      bodyTypes: ["suv", "kombi"],
      bodyTypesDisplay: ["SUV", "Kombi"],
      years: [2020, 2026],
      isCurrentlyProduced: true,
      generations: [
        {
          generation: "2020-2026",
          generationDisplay: "2020–2026",
          modelKey: "tucson",
          matTemplateId: "fixture-tucson-suv",
          modelImage: "/images/fixtures/model-preview.webp",
          bodyType: "suv",
          bodyTypeDisplay: "SUV",
          yearFrom: 2020,
          yearTo: 2026,
          isCurrentlyProduced: true,
        },
        {
          generation: "2015-2020",
          generationDisplay: "2015–2020",
          modelKey: "tucson",
          matTemplateId: "fixture-tucson-kombi",
          modelImage: "/images/fixtures/model-preview.webp",
          bodyType: "kombi",
          bodyTypeDisplay: "Kombi",
          yearFrom: 2015,
          yearTo: 2020,
          isCurrentlyProduced: false,
        },
      ],
    },
    {
      brand: "Hyundai",
      brandDisplay: "Hyundai",
      model: "i30",
      modelDisplay: "i30",
      modelFamilyKey: "i30",
      modelImage: null,
      bodyTypes: ["hatchback"],
      bodyTypesDisplay: ["Hatchback"],
      years: [2017, 2024],
      isCurrentlyProduced: true,
      generations: [
        {
          generation: "2017-2024",
          generationDisplay: "2017–2024",
          modelKey: "i30",
          matTemplateId: "fixture-i30",
          modelImage: "/images/fixtures/model-preview.webp",
          bodyType: "hatchback",
          bodyTypeDisplay: "Hatchback",
          yearFrom: 2017,
          yearTo: 2024,
          isCurrentlyProduced: true,
        },
      ],
    },
  ],
  bmw: [
    {
      brand: "BMW",
      brandDisplay: "BMW",
      model: "X5",
      modelDisplay: "X5",
      modelFamilyKey: "x5",
      modelImage: null,
      bodyTypes: ["suv"],
      bodyTypesDisplay: ["SUV"],
      years: [2018, 2026],
      isCurrentlyProduced: true,
      generations: [
        {
          generation: "2018-2026",
          generationDisplay: "2018–2026",
          modelKey: "x5",
          matTemplateId: "fixture-x5",
          modelImage: "/images/fixtures/model-preview.webp",
          bodyType: "suv",
          bodyTypeDisplay: "SUV",
          yearFrom: 2018,
          yearTo: 2026,
          isCurrentlyProduced: true,
        },
      ],
    },
  ],
}

export const vehicleTemplate = (brandKey, family, name, bodyType, bodyLabel) => ({
  id: `fixture-${family}`,
  recordKey: `fixture-${brandKey}-${family}`,
  modelKey: family,
  modelName: name,
  modelNameDisplay: name,
  generation: "2020-2026",
  generationDisplay: "2020–2026",
  generationNumberDisplay: null,
  yearFrom: 2020,
  yearTo: 2026,
  isOpenEnded: false,
  bodyTypes: [{ key: bodyType, label: bodyLabel, displayLabel: bodyLabel }],
  bodyTypeKey: bodyType,
  bodyTypeDisplay: bodyLabel,
  pricingCategoryKey: "passenger_car",
})

/** Klucze z prezentacji pasażerskiej tej wersji: front = „Przód”, basic = „Przód + tył”. */
export const pricingVariants = [
  { key: "front", label: "Przód", basePrice: 399, priceAfterDiscount: 319, discount: 80 },
  { key: "basic", label: "Przód + tył", basePrice: 699, priceAfterDiscount: 559, discount: 140 },
]
