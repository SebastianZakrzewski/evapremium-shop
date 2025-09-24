# Mapowanie 1:1 między modelem Mats a tabelą CarMat

Ten dokument opisuje bezpieczne mapowanie danych między modelem Mats używanym w aplikacji a tabelą CarMat w bazie danych Supabase.

## Struktury danych

### Model Mats (aplikacja)
```typescript
interface MatsModel {
  id: number;           // ID jako liczba
  type: string;         // rodzaj dywanika
  color: string;        // kolor dywanika
  cellType: string;     // struktura komórek dywanika
  edgeColor: string;    // kolor obszycia dywanika
  image: string;        // ścieżka do zdjęcia dywanika
}
```

### Tabela CarMat (Supabase)
```typescript
interface CarMatRecord {
  id: string;                    // UUID w Supabase
  matType: string;               // typ maty
  materialColor: string;         // kolor materiału
  cellStructure: string;         // struktura komórek
  borderColor: string;           // kolor obszycia
  imagePath: string;             // ścieżka do obrazu
  createdAt?: string;            // data utworzenia
  updatedAt?: string;            // data aktualizacji
}
```

## Mapowanie pól

| Model Mats | Tabela CarMat | Opis |
|------------|---------------|------|
| `id` | `id` | Konwersja: number ↔ UUID |
| `type` | `matType` | Rodzaj dywanika |
| `color` | `materialColor` | Kolor materiału |
| `cellType` | `cellStructure` | Struktura komórek |
| `edgeColor` | `borderColor` | Kolor obszycia |
| `image` | `imagePath` | Ścieżka do obrazu |

## Funkcje mapowania

### `mapCarMatToMats(carMat: CarMatRecord): MatsModel`
Konwertuje rekord z tabeli CarMat na model Mats używany w aplikacji.

### `mapMatsToCarMat(mats: MatsModel): Omit<CarMatRecord, 'id' | 'createdAt' | 'updatedAt'>`
Konwertuje model Mats na rekord CarMat (bez id i timestampów).

### `mapCarMatArrayToMats(carMats: CarMatRecord[]): MatsModel[]`
Mapuje tablicę rekordów CarMat na tablicę modeli Mats.

### `mapMatsArrayToCarMat(matsArray: MatsModel[]): Omit<CarMatRecord, 'id' | 'createdAt' | 'updatedAt'>[]`
Mapuje tablicę modeli Mats na tablicę rekordów CarMat.

## Funkcje walidacji

### `validateCarMatRecord(record: Partial<CarMatRecord>): record is CarMatRecord`
Sprawdza czy rekord CarMat zawiera wszystkie wymagane pola.

### `validateMatsModel(model: Partial<MatsModel>): model is MatsModel`
Sprawdza czy model Mats zawiera wszystkie wymagane pola.

## Konwersja ID

### `convertIdToNumber(uuid: string): number`
Konwertuje UUID na liczbę używając pierwszych 8 znaków jako hex.

### `convertNumberToUuid(id: number): string`
Konwertuje liczbę na UUID format.

## Przykład użycia

```typescript
import { mapCarMatToMats, mapMatsToCarMat } from '@/lib/mapping/carmat-mapping';

// Pobieranie danych z Supabase
const { data: carMatData } = await supabase.from('CarMat').select('*');
const matsModels = mapCarMatArrayToMats(carMatData);

// Zapisywanie danych do Supabase
const newMats: MatsModel = {
  id: 1,
  type: '3d',
  color: 'czarny',
  cellType: 'rhombus',
  edgeColor: 'czarny',
  image: '/images/mats/3d-black-rhombus.jpg'
};

const carMatRecord = mapMatsToCarMat(newMats);
const { data } = await supabase.from('CarMat').insert(carMatRecord);
```

## Bezpieczeństwo

- Wszystkie funkcje mapowania są type-safe
- Walidacja zapewnia poprawność danych
- Konwersja ID jest deterministyczna i odwracalna
- Brak utraty danych przy mapowaniu w obie strony

## Testy

Mapowanie jest w pełni przetestowane w pliku `src/lib/mapping/__tests__/carmat-mapping.test.ts`.

Uruchom testy:
```bash
npm test carmat-mapping
```
