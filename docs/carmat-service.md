# CarMatService - Dokumentacja

## Opis

`CarMatService` to serwis do zarządzania rekordami z tabeli `CarMat` w Supabase. Wykorzystuje wcześniej zbudowany model mapowania do konwersji danych między formatem Supabase a formatem aplikacji.

## Instalacja

```typescript
import { CarMatService } from '@/lib/services/carmat-service';
```

## Konfiguracja

Serwis wymaga następujących zmiennych środowiskowych:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Interfejsy

### CarMatFilters

```typescript
interface CarMatFilters {
  type?: string;        // Typ maty (np. '3d-with-rims')
  color?: string;       // Kolor materiału
  cellType?: string;    // Struktura komórek (np. 'rhombus', 'honeycomb')
  edgeColor?: string;   // Kolor obszycia
  limit?: number;       // Limit wyników
  offset?: number;      // Przesunięcie dla paginacji
}
```

### CarMatServiceResponse

```typescript
interface CarMatServiceResponse<T> {
  success: boolean;
  data: T;
  count?: number;       // Liczba rekordów (dla zapytań z count)
  error?: string;       // Komunikat błędu
}
```

## Metody

### 1. Pobieranie danych

#### `getAllMats(filters?: CarMatFilters)`

Pobiera wszystkie rekordy z tabeli CarMat z opcjonalnymi filtrami.

```typescript
// Pobierz wszystkie maty
const result = await CarMatService.getAllMats();

// Pobierz maty z filtrami
const result = await CarMatService.getAllMats({
  type: '3d-with-rims',
  color: 'czarny',
  limit: 10
});
```

#### `getMatById(id: number)`

Pobiera rekord po ID.

```typescript
const result = await CarMatService.getMatById(3410383687);
if (result.success && result.data) {
  console.log(result.data.type); // '3d-with-rims'
}
```

#### `get3DMats(filters?: Omit<CarMatFilters, 'type'>)`

Pobiera tylko maty 3D (z ramkami).

```typescript
const result = await CarMatService.get3DMats({ limit: 5 });
```

#### `getClassicMats(filters?: Omit<CarMatFilters, 'type'>)`

Pobiera tylko maty klasyczne (bez ramek).

```typescript
const result = await CarMatService.getClassicMats({ limit: 5 });
```

### 2. Filtrowanie i wyszukiwanie

#### `getMatsByCellType(cellType: string, filters?: Omit<CarMatFilters, 'cellType'>)`

Pobiera maty z określoną strukturą komórek.

```typescript
const result = await CarMatService.getMatsByCellType('rhombus');
```

#### `getMatsByColor(color: string, filters?: Omit<CarMatFilters, 'color'>)`

Pobiera maty z określonym kolorem materiału.

```typescript
const result = await CarMatService.getMatsByColor('czarny');
```

#### `getMatsByEdgeColor(edgeColor: string, filters?: Omit<CarMatFilters, 'edgeColor'>)`

Pobiera maty z określonym kolorem obszycia.

```typescript
const result = await CarMatService.getMatsByEdgeColor('czarny');
```

#### `searchMats(query: string, filters?: CarMatFilters)`

Wyszukuje maty na podstawie zapytania tekstowego.

```typescript
const result = await CarMatService.searchMats('czarny');
```

### 3. Pobieranie unikalnych wartości

#### `getUniqueValues(field: keyof CarMatRecord)`

Pobiera unikalne wartości dla określonego pola.

```typescript
const result = await CarMatService.getUniqueValues('materialColor');
```

#### `getUniqueColors()`

Pobiera unikalne kolory materiału.

```typescript
const result = await CarMatService.getUniqueColors();
// result.data = ['czarny', 'beżowy', 'niebieski', ...]
```

#### `getUniqueEdgeColors()`

Pobiera unikalne kolory obszycia.

```typescript
const result = await CarMatService.getUniqueEdgeColors();
```

#### `getUniqueTypes()`

Pobiera unikalne typy mat.

```typescript
const result = await CarMatService.getUniqueTypes();
// result.data = ['3d-with-rims', '3d-without-rims']
```

#### `getUniqueCellTypes()`

Pobiera unikalne struktury komórek.

```typescript
const result = await CarMatService.getUniqueCellTypes();
// result.data = ['rhombus', 'honeycomb']
```

### 4. Operacje CRUD

#### `createMat(matData: MatsModel)`

Tworzy nowy rekord w tabeli CarMat.

```typescript
const newMat: MatsModel = {
  id: 1234567890,
  type: '3d-with-rims',
  color: 'czarny',
  cellType: 'rhombus',
  edgeColor: 'czarny',
  image: '/test/image.webp'
};

const result = await CarMatService.createMat(newMat);
```

#### `updateMat(id: number, matData: Partial<MatsModel>)`

Aktualizuje istniejący rekord.

```typescript
const result = await CarMatService.updateMat(3410383687, {
  color: 'czarny',
  edgeColor: 'czarny'
});
```

#### `deleteMat(id: number)`

Usuwa rekord z tabeli.

```typescript
const result = await CarMatService.deleteMat(3410383687);
```

### 5. Statystyki

#### `getStats()`

Pobiera statystyki tabeli CarMat.

```typescript
const result = await CarMatService.getStats();
if (result.success) {
  console.log(`Łączna liczba: ${result.data.totalCount}`);
  console.log(`Typy:`, result.data.typeCounts);
  console.log(`Kolory:`, result.data.colorCounts);
}
```

## Przykłady użycia

### Pobieranie mat do konfiguratora

```typescript
// Pobierz maty 3D z określonymi kolorami
const mats3D = await CarMatService.get3DMats({
  color: 'czarny',
  cellType: 'rhombus',
  limit: 20
});

if (mats3D.success) {
  console.log(`Znaleziono ${mats3D.data.length} mat 3D`);
}
```

### Filtrowanie w interfejsie użytkownika

```typescript
// Pobierz unikalne kolory do selecta
const colors = await CarMatService.getUniqueColors();
const edgeColors = await CarMatService.getUniqueEdgeColors();

// Filtruj maty na podstawie wyboru użytkownika
const filteredMats = await CarMatService.getAllMats({
  type: selectedType,
  color: selectedColor,
  cellType: selectedCellType,
  edgeColor: selectedEdgeColor
});
```

### Wyszukiwanie

```typescript
// Wyszukaj maty zawierające określony tekst
const searchResults = await CarMatService.searchMats('czarny', {
  type: '3d-with-rims',
  limit: 10
});
```

### Paginacja

```typescript
// Pobierz drugą stronę wyników
const page2 = await CarMatService.getAllMats({
  limit: 20,
  offset: 20
});
```

## Obsługa błędów

Wszystkie metody zwracają obiekt `CarMatServiceResponse` z informacją o powodzeniu operacji:

```typescript
const result = await CarMatService.getAllMats();

if (result.success) {
  // Operacja zakończona pomyślnie
  console.log(result.data);
  console.log(`Liczba rekordów: ${result.count}`);
} else {
  // Wystąpił błąd
  console.error('Błąd:', result.error);
}
```

## Mapowanie danych

Serwis automatycznie konwertuje dane między formatem Supabase a formatem aplikacji:

- **Supabase → Aplikacja**: `mapCarMatArrayToMats()`
- **Aplikacja → Supabase**: `mapMatsToCarMat()`

## Walidacja

Serwis automatycznie waliduje dane przed operacjami CRUD:

- **Model Mats**: `validateMatsModel()`
- **Rekord CarMat**: `validateCarMatRecord()`

## Testy

Serwis zawiera kompleksowe testy jednostkowe:

```bash
# Uruchom testy serwisu
node scripts/test-carmat-service.js
```

## Zależności

- `@supabase/supabase-js` - Klient Supabase
- `@/lib/mapping/carmat-mapping` - Funkcje mapowania
- `dotenv` - Zmienne środowiskowe

## Uwagi

1. **ID**: Serwis automatycznie konwertuje ID między formatem number (aplikacja) a UUID (Supabase)
2. **Filtry**: Wszystkie filtry są opcjonalne
3. **Paginacja**: Użyj `limit` i `offset` do implementacji paginacji
4. **Błędy**: Zawsze sprawdzaj `result.success` przed użyciem `result.data`
5. **Wydajność**: Użyj `limit` do ograniczenia liczby wyników w zapytaniach
