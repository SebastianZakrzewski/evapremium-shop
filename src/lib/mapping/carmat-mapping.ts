/**
 * Mapowanie 1:1 między modelem Mats a tabelą CarMat w Supabase
 * 
 * Ten plik zawiera funkcje do bezpiecznego mapowania danych między:
 * - Modelem Mats (używanym w aplikacji)
 * - Tabelą CarMat (w bazie danych Supabase)
 */

export interface MatsModel {
  id: number;
  type: string;        // rodzaj dywanika
  color: string;       // kolor dywanika
  cellType: string;    // struktura komórek dywanika
  edgeColor: string;   // kolor obszycia dywanika
  image: string;       // ścieżka do zdjęcia dywanika
}

export interface CarMatRecord {
  id: string;                    // UUID w Supabase
  matType: string;               // typ maty
  materialColor: string;         // kolor materiału
  cellStructure: string;         // struktura komórek
  borderColor: string;           // kolor obszycia
  imagePath: string;             // ścieżka do obrazu
  createdAt?: string;            // data utworzenia
  updatedAt?: string;            // data aktualizacji
}

/**
 * Mapowanie z tabeli CarMat (Supabase) na model Mats (aplikacja)
 */
export function mapCarMatToMats(carMat: CarMatRecord): MatsModel {
  return {
    id: parseInt(carMat.id.split('-')[0], 16) || 0,  // Konwersja UUID na liczbę
    type: carMat.matType,
    color: carMat.materialColor,
    cellType: carMat.cellStructure,
    edgeColor: carMat.borderColor,
    image: carMat.imagePath
  };
}

/**
 * Mapowanie z modelu Mats (aplikacja) na tabelę CarMat (Supabase)
 */
export function mapMatsToCarMat(mats: MatsModel): Omit<CarMatRecord, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    matType: mats.type,
    materialColor: mats.color,
    cellStructure: mats.cellType,
    borderColor: mats.edgeColor,
    imagePath: mats.image
  };
}

/**
 * Mapowanie tablicy rekordów CarMat na tablicę modeli Mats
 */
export function mapCarMatArrayToMats(carMats: CarMatRecord[]): MatsModel[] {
  return carMats.map(mapCarMatToMats);
}

/**
 * Mapowanie tablicy modeli Mats na tablicę rekordów CarMat (bez id i timestampów)
 */
export function mapMatsArrayToCarMat(matsArray: MatsModel[]): Omit<CarMatRecord, 'id' | 'createdAt' | 'updatedAt'>[] {
  return matsArray.map(mapMatsToCarMat);
}

/**
 * Walidacja mapowania - sprawdza czy wszystkie wymagane pola są obecne
 */
export function validateCarMatRecord(record: Partial<CarMatRecord>): record is CarMatRecord {
  return !!(
    record.matType &&
    record.materialColor &&
    record.cellStructure &&
    record.borderColor &&
    record.imagePath
  );
}

/**
 * Walidacja modelu Mats - sprawdza czy wszystkie wymagane pola są obecne
 */
export function validateMatsModel(model: Partial<MatsModel>): model is MatsModel {
  return !!(
    model.id !== undefined &&
    model.type &&
    model.color &&
    model.cellType &&
    model.edgeColor &&
    model.image
  );
}

/**
 * Mapowanie kolumn tabeli CarMat na pola modelu Mats
 */
export const CARMAT_TO_MATS_MAPPING = {
  'id': 'id',                    // Konwersja UUID -> number
  'matType': 'type',
  'materialColor': 'color',
  'cellStructure': 'cellType',
  'borderColor': 'edgeColor',
  'imagePath': 'image'
} as const;

/**
 * Mapowanie pól modelu Mats na kolumny tabeli CarMat
 */
export const MATS_TO_CARMAT_MAPPING = {
  'id': 'id',                    // Konwersja number -> UUID
  'type': 'matType',
  'color': 'materialColor',
  'cellType': 'cellStructure',
  'edgeColor': 'borderColor',
  'image': 'imagePath'
} as const;

/**
 * Typy dla bezpiecznego mapowania
 */
export type CarMatField = keyof CarMatRecord;
export type MatsField = keyof MatsModel;

/**
 * Funkcja pomocnicza do konwersji ID
 */
export function convertIdToNumber(uuid: string): number {
  return parseInt(uuid.split('-')[0], 16) || 0;
}

/**
 * Funkcja pomocnicza do konwersji ID (odwrotna)
 * UWAGA: Ta funkcja nie jest odwracalna - UUID w bazie ma pełną strukturę
 * Używaj tylko do tworzenia nowych rekordów
 */
export function convertNumberToUuid(id: number): string {
  return `${id.toString(16).padStart(8, '0')}-0000-0000-0000-000000000000`;
}

/**
 * Funkcja do wyszukiwania UUID na podstawie ID
 * Pobiera rzeczywisty UUID z bazy danych
 */
export async function findUuidById(id: number, supabase: any): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('CarMat')
      .select('id')
      .limit(1000); // Pobierz wszystkie ID

    if (error) return null;

    // Znajdź UUID, którego pierwsze 8 znaków odpowiada ID
    const targetHex = id.toString(16).padStart(8, '0');
    const found = data?.find((record: any) => 
      record.id.startsWith(targetHex)
    );

    return found?.id || null;
  } catch (error) {
    return null;
  }
}
