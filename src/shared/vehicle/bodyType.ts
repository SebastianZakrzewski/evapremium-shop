type BodyTypeKey =
  | 'sedan'
  | 'suv'
  | 'hatchback'
  | 'kombi'
  | 'minivan'
  | 'van'
  | 'coupe'
  | 'kabriolet'
  | 'roadster'
  | 'fastback'
  | 'liftback'
  | 'shooting brake'
  | string;

const bodyTypeLabels: Record<BodyTypeKey, string> = {
  sedan: 'Sedan',
  suv: 'SUV',
  hatchback: 'Hatchback',
  kombi: 'Kombi',
  minivan: 'Minivan',
  van: 'Van',
  coupe: 'Coupe',
  kabriolet: 'Kabriolet',
  roadster: 'Roadster',
  fastback: 'Fastback',
  liftback: 'Liftback',
  'shooting brake': 'Shooting Brake',
};

const capitalize = (value: string): string =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : '';

/**
 * Normalizuje typ nadwozia do klucza (małe litery, bez szczegółów).
 */
export function normalizeBodyTypeKey(bodyType: string): BodyTypeKey {
  if (!bodyType) return '';

  const normalized = bodyType.toLowerCase().trim();

  if (normalized.includes('hatchback') || normalized.includes('hatch')) {
    return 'hatchback';
  }
  if (normalized.includes('suv')) {
    return 'suv';
  }
  if (normalized.includes('sedan')) {
    return 'sedan';
  }
  if (normalized.includes('kombi') || normalized.includes('estate') || normalized.includes('wagon')) {
    return 'kombi';
  }
  if (normalized.includes('minivan') || normalized.includes('mpv')) {
    return 'minivan';
  }
  if (normalized.includes('van') || normalized.includes('dostawczak')) {
    return 'van';
  }
  if (normalized.includes('coupe')) {
    return 'coupe';
  }
  if (normalized.includes('cabrio') || normalized.includes('convertible')) {
    return 'kabriolet';
  }
  if (normalized.includes('roadster')) {
    return 'roadster';
  }
  if (normalized.includes('fastback')) {
    return 'fastback';
  }
  if (normalized.includes('liftback')) {
    return 'liftback';
  }
  if (normalized.includes('shooting brake')) {
    return 'shooting brake';
  }

  return normalized;
}

/**
 * Zwraca etykietę wyświetlaną dla typu nadwozia.
 */
export function formatBodyTypeLabel(bodyType: string): string {
  const key = normalizeBodyTypeKey(bodyType);
  if (!key) return '';
  return bodyTypeLabels[key] || capitalize(key);
}

/**
 * Szacuje liczbę drzwi na podstawie typu nadwozia.
 */
export function getDoorsCount(bodyType: string): string {
  const key = normalizeBodyTypeKey(bodyType);
  if (
    key === 'hatchback' ||
    key === 'sedan' ||
    key === 'kombi' ||
    key === 'suv' ||
    key === 'van' ||
    key === 'minivan'
  ) {
    return '5';
  }
  if (key === 'coupe' || key === 'kabriolet' || key === 'roadster' || key === 'fastback') {
    return '3';
  }
  return '5';
}

/**
 * Formatuje generację na podstawie lat produkcji (np. "2021-2025" lub "2021+").
 */
export function formatGenerationLabel(
  generation: string | null | undefined,
  yearFrom?: number,
  yearTo?: number,
): string {
  if (yearFrom && yearTo) {
    const currentYear = new Date().getFullYear();
    if (yearTo >= currentYear || yearTo - yearFrom > 10) {
      return `${yearFrom}+`;
    }
    return `${yearFrom}-${yearTo}`;
  }

  if (yearFrom) {
    return `${yearFrom}+`;
  }

  if (generation && generation.trim() !== '') {
    const genTrimmed = generation.trim();
    if (genTrimmed.includes('+')) {
      const match = genTrimmed.match(/^(\d{4})/);
      if (match) {
        return `${match[1]}+`;
      }
    }
    if (/^\d{4}$/.test(genTrimmed)) {
      return `${genTrimmed}+`;
    }
  }

  return '';
}






