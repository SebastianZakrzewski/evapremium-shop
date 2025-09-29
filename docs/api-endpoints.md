# API Endpoints - Samochody

## Przegląd

Nowe API zostało zreorganizowane w bardziej logiczną strukturę z oddzielnymi endpointami dla modeli, generacji i typów nadwozia.

## Endpointy

### 1. Marki samochodów
**GET** `/api/car-brands`

Pobiera listę wszystkich dostępnych marek samochodów.

**Odpowiedź:**
```json
[
  {
    "id": 1,
    "name": "BMW",
    "logo": "/images/brands/bmw.png",
    "description": "Dywaniki samochodowe dla marki BMW"
  }
]
```

### 2. Modele samochodów
**GET** `/api/models`

Pobiera wszystkie modele samochodów z opcjonalnymi filtrami.

**Parametry zapytania:**
- `brand` (string, opcjonalny) - filtr po marce
- `bodyType` (string, opcjonalny) - filtr po typie nadwozia
- `yearFrom` (number, opcjonalny) - filtr po roku rozpoczęcia produkcji
- `yearTo` (number, opcjonalny) - filtr po roku zakończenia produkcji
- `isCurrentlyProduced` (boolean, opcjonalny) - filtr po aktualnie produkowanych

**Przykład:** `/api/models?brand=BMW&isCurrentlyProduced=true`

**Odpowiedź:**
```json
[
  {
    "brand": "BMW",
    "model": "Seria 3",
    "generations": [...],
    "bodyTypes": ["sedan", "kombi"],
    "years": [2023, 2022, 2021],
    "isCurrentlyProduced": true
  }
]
```

**GET** `/api/models/[brand]`

Pobiera modele dla konkretnej marki.

**Parametry:**
- `brand` (string) - nazwa marki (URL encoded)

**Przykład:** `/api/models/BMW`

### 3. Generacje samochodów
**GET** `/api/generations`

Pobiera wszystkie generacje samochodów z opcjonalnymi filtrami.

**Parametry zapytania:**
- `brand` (string, opcjonalny) - filtr po marce
- `model` (string, opcjonalny) - filtr po modelu
- `bodyType` (string, opcjonalny) - filtr po typie nadwozia
- `yearFrom` (number, opcjonalny) - filtr po roku rozpoczęcia produkcji
- `yearTo` (number, opcjonalny) - filtr po roku zakończenia produkcji
- `isCurrentlyProduced` (boolean, opcjonalny) - filtr po aktualnie produkowanych

**Przykład:** `/api/generations?brand=BMW&model=Seria 3`

**Odpowiedź:**
```json
[
  {
    "brand": "BMW",
    "model": "Seria 3",
    "generation": "G20",
    "yearFrom": 2019,
    "yearTo": 2023,
    "isCurrentlyProduced": false,
    "bodyTypes": ["sedan", "kombi"],
    "years": [2019, 2020, 2021, 2022, 2023]
  }
]
```

**GET** `/api/generations/[brand]/[model]`

Pobiera generacje dla konkretnego modelu.

**Parametry:**
- `brand` (string) - nazwa marki (URL encoded)
- `model` (string) - nazwa modelu (URL encoded)

**Przykład:** `/api/generations/BMW/Seria 3`

### 4. Typy nadwozia
**GET** `/api/body-types`

Pobiera listę wszystkich dostępnych typów nadwozia.

**Odpowiedź:**
```json
[
  {
    "id": 1,
    "name": "sedan",
    "category": "sedan",
    "description": "Sedan"
  },
  {
    "id": 2,
    "name": "hatchback 5drzwi",
    "category": "hatchback",
    "description": "Hatchback 5-drzwiowy"
  }
]
```

## Walidacja

Wszystkie endpointy używają Zod do walidacji parametrów wejściowych. Błędne parametry zwracają odpowiedź 400 z opisem błędu.

## Obsługa błędów

Wszystkie endpointy zwracają spójne odpowiedzi błędów:

```json
{
  "error": "Opis błędu"
}
```

Kody statusu:
- `200` - Sukces
- `400` - Błędne parametry
- `500` - Błąd serwera

## Przykłady użycia w komponencie

```typescript
// Pobieranie modeli dla marki
const fetchModels = async (brand: string) => {
  const response = await fetch(`/api/models/${encodeURIComponent(brand)}`);
  const data = await response.json();
  return data;
};

// Pobieranie generacji dla modelu
const fetchGenerations = async (brand: string, model: string) => {
  const response = await fetch(`/api/generations/${encodeURIComponent(brand)}/${encodeURIComponent(model)}`);
  const data = await response.json();
  return data;
};

// Pobieranie typów nadwozia
const fetchBodyTypes = async () => {
  const response = await fetch('/api/body-types');
  const data = await response.json();
  return data;
};
```

## Optymalizacje

1. **Indeksy bazy danych** - zoptymalizowane zapytania przez indeksy na kluczowych kolumnach
2. **Agregacja danych** - grupowanie i deduplikacja na poziomie API
3. **Walidacja parametrów** - walidacja wejściowa z użyciem Zod
4. **Spójne formaty odpowiedzi** - ujednolicone struktury danych
5. **Obsługa błędów** - centralna obsługa błędów z odpowiednimi kodami statusu
