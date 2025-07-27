// Test mapowania modeli BMW
const testApiResponse = [
  {
    "id": 32,
    "name": "M2",
    "displayName": "BMW M2",
    "yearFrom": 2016,
    "yearTo": 2020,
    "generation": "F87",
    "bodyType": "coupe",
    "engineType": "petrol",
    "isActive": true,
    "carBrand": {
      "id": 2,
      "name": "bmw",
      "displayName": "BMW",
      "logo": "/images/products/bmw.png"
    }
  },
  {
    "id": 33,
    "name": "M2",
    "displayName": "BMW M2",
    "yearFrom": 2022,
    "yearTo": null,
    "generation": "G87",
    "bodyType": "coupe",
    "engineType": "petrol",
    "isActive": true,
    "carBrand": {
      "id": 2,
      "name": "bmw",
      "displayName": "BMW",
      "logo": "/images/products/bmw.png"
    }
  }
];

// Mapowanie modeli z API na format komponentu
const mappedModels = testApiResponse.map(model => ({
  id: model.id,
  name: model.displayName || model.name,
  brand: model.carBrand?.displayName || model.carBrand?.name || 'Unknown',
  year: model.yearFrom || 2024,
  imageSrc: model.carBrand?.logo || '/images/products/audi.jpg',
  price: '200,000 PLN',
  description: `${model.bodyType || 'Samochód'} ${model.engineType || 'silnik'}`
}));

console.log('Mapped BMW Models:');
console.log('==================');
mappedModels.forEach(model => {
  console.log(`- ${model.name} (${model.brand}) - ${model.description} [${model.year}]`);
});

console.log(`\nTotal mapped models: ${mappedModels.length}`); 