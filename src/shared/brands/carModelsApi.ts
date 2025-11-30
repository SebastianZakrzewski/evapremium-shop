import { humanizeBrandSlug, mapSlugToCanonicalBrand } from "./brandNormalizer";

const API_BASE_PATH = "/api/models";

const buildUrl = (brandName: string) => `${API_BASE_PATH}?brand=${encodeURIComponent(brandName)}`;

const logPrefix = "[carModelsApi]";

export async function fetchCarModelsByApiName(brandName: string): Promise<any[]> {
  const trimmedName = brandName?.trim();
  if (!trimmedName) {
    console.error(`${logPrefix} fetchCarModelsByApiName called with empty brandName`);
    return [];
  }

  const url = buildUrl(trimmedName);
  console.log(`${logPrefix} Fetching car models:`, {
    brandName: trimmedName,
    url,
  });

  const startTime = Date.now();
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const duration = Date.now() - startTime;
  console.log(`${logPrefix} Request finished`, {
    brandName: trimmedName,
    status: `${response.status} ${response.statusText}`,
    duration,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`${logPrefix} API returned error`, {
      brandName: trimmedName,
      status: response.status,
      body: errorText,
    });
    return [];
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    console.error(`${logPrefix} Response is not an array`, {
      brandName: trimmedName,
      type: typeof data,
    });
    return [];
  }

  console.log(`${logPrefix} Received models`, {
    brandName: trimmedName,
    count: data.length,
  });

  return data;
}

interface FetchBySlugOptions {
  brandApiNameOverride?: string;
}

export function resolveBrandApiName(
  brandSlug: string,
  override?: string | null
): { resolved: string | null; canonical: string | null } {
  if (!brandSlug) {
    return { resolved: null, canonical: null };
  }

  if (override) {
    return { resolved: override, canonical: override };
  }

  const canonical = mapSlugToCanonicalBrand(brandSlug);
  const fallback = humanizeBrandSlug(brandSlug);

  return {
    canonical,
    resolved: canonical ?? (fallback || null),
  };
}

export async function fetchCarModelsBySlug(
  brandSlug: string,
  options?: FetchBySlugOptions
): Promise<any[]> {
  const { resolved } = resolveBrandApiName(brandSlug, options?.brandApiNameOverride);
  if (!resolved) {
    console.warn(`${logPrefix} Cannot fetch models – unresolved brand slug`, {
      brandSlug,
    });
    return [];
  }

  return fetchCarModelsByApiName(resolved);
}

export { buildUrl as buildCarModelsApiUrl };













